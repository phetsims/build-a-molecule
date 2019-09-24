// Copyright 2013-2019, University of Colorado Boulder

/**
 * Node canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const KitCollectionNode = require( 'BUILD_A_MOLECULE/view/KitCollectionNode' );
  const KitPlayAreaNode = require( 'BUILD_A_MOLECULE/view/KitPlayAreaNode' );
  // const Node = require( 'SCENERY/nodes/Node' );
  const MoleculeControlsHBox = require( 'BUILD_A_MOLECULE/view/MoleculeControlsHBox' );
  // const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ScreenView = require( 'JOIST/ScreenView' );
  // const Shape = require( 'KITE/Shape' );
  // const SliceNode = require( 'BUILD_A_MOLECULE/view/SliceNode' );

  class BAMView extends ScreenView {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @constructor
     */
    constructor( kitCollectionList ) {
      super();
      this.atomNodeMap = {};
      this.kitCollectionMap = {}; // maps KitCollection ID => KitCollectionNode
      this.metadataMap = {}; // moleculeId => MoleculeControlsHBox
      this.bondMap = {}; // moleculeId => MoleculeBondContainerNode

      // @public {KitCollectionList}
      this.kitCollectionList = kitCollectionList;

      this.addCollection( kitCollectionList.currentCollectionProperty.value );

      // KitPlayAreaNode for the main BAMView listens to the kitPlayArea of each kit in the model to fill or remove
      // its content.
      const kits = [];
      this.kitCollectionList.collections.forEach( collection => {
        collection.kits.forEach( kit => {

          // Used for tracking kits in KitPlayAreaNode
          kits.push( kit );

          // Each kit gets listeners for managing its play area.
          kit.atomsInPlayArea.addItemAddedListener( atom => {
            this.addAtomNodeToPlayArea( atom, kitCollectionList.currentCollectionProperty.value );
          } );
          kit.atomsInPlayArea.addItemRemovedListener( atom => {
            this.onAtomRemovedFromPlayArea( atom );
          } );
        } );
      } );

      kitCollectionList.currentCollectionProperty.link( ( newCollection, oldCollection ) => {
        if ( oldCollection ) {
          this.removeChild( this.kitCollectionMap[ oldCollection.id ] );
        }
        if ( newCollection ) {
          this.addChild( this.kitCollectionMap[ newCollection.id ] );
        }
      } );
      kitCollectionList.addedCollectionEmitter.addListener( this.addCollection.bind( this ) );

      // Create a play area to house the atomNodes.
      this.kitPlayAreaNode = new KitPlayAreaNode( kits );
      this.addChild( this.kitPlayAreaNode );

      // Kit listeners added to manage molecule metadata.
      this.kitCollectionList.collections.forEach( collection => {
        collection.kits.forEach( kit => {

          // handle molecule creation and destruction
          kit.addedMoleculeEmitter.addListener( molecule => {
            var moleculeControlsHBox = new MoleculeControlsHBox( kit, molecule );
            this.kitPlayAreaNode.metadataLayer.addChild( moleculeControlsHBox );
            this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ] = moleculeControlsHBox;

            if ( BAMConstants.ALLOW_BOND_BREAKING ) {
              this.kitPlayAreaNode.addMoleculeBondNodes( molecule );
            }
          } );
          kit.removedMoleculeEmitter.addListener( molecule => {
            var moleculeControlsHBox = this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ];
            if ( moleculeControlsHBox ) {
              this.kitPlayAreaNode.metadataLayer.removeChild( moleculeControlsHBox );
              moleculeControlsHBox.dispose();
              delete this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ];

              if ( BAMConstants.ALLOW_BOND_BREAKING ) {
                this.kitPlayAreaNode.removeMoleculeBondNodes( molecule );
              }
            }
          } );
        } );
      } );
    }

    addCollection( collection ) {
      const kitCollectionNode = new KitCollectionNode( collection, this );
      this.kitCollectionMap[ collection.id ] = kitCollectionNode;

      // supposedly: return this so we can manipulate it in an override....?
      return kitCollectionNode;
    }

    /**
     * Fill the play area with an atom and map the atom to an atomNode
     * @param {Atom2} atom
     *
     * @private
     * @returns {AtomNode}
     */
    addAtomNodeToPlayAreaNode( atom ) {
      const atomNode = new AtomNode( atom );
      this.kitPlayAreaNode.atomLayer.addChild( atomNode );
      this.kitPlayAreaNode.atomNodeMap[ atom.id ] = atomNode;
      return atomNode;
    }

    addAtomNodeToPlayArea( atom, kitCollection, view ) {
      // const viewSwipeBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( kitCollection.collectionLayout.availablePlayAreaBounds );
      // const sliceNode = new SliceNode( kitCollection, viewSwipeBounds, view );


      // const swipeCatch = Rectangle.bounds( viewSwipeBounds.eroded( BAMConstants.VIEW_PADDING ) );
      // swipeCatch.addInputListener( sliceNode.sliceInputListener );

      //REVIEW: Can we use the newer drag listeners?
      // this.addChild( swipeCatch );
      // this.addChild( sliceNode );
      const atomNode = this.addAtomNodeToPlayAreaNode( atom );
      let lastPosition;
      const atomListener = new DragListener( {
        transform: BAMConstants.MODEL_VIEW_TRANSFORM,
        targetNode: atomNode,
        locationProperty: atom.positionProperty,
        start: event => {

          // Get atom position before drag
          lastPosition = atom.positionProperty.value;
          atom.userControlledProperty.value = true;

          // Update the current kit in the play area node.
          this.kitPlayAreaNode.currentKit = this.kitCollectionList.currentCollectionProperty.value.currentKitProperty.value;
        },
        drag: event => {

          // Get delta from start of drag
          const delta = atom.positionProperty.value.minus( lastPosition );

          // Set the last position to the newly dragged position.
          lastPosition = atom.positionProperty.value;

          // Handles atoms with multiple molecules
          const molecule = kitCollection.currentKitProperty.value.getMolecule( atom );
          if ( molecule ) {
            molecule.atoms.forEach( moleculeAtom => {
              if ( moleculeAtom !== atom ) {
                moleculeAtom.positionProperty.value = moleculeAtom.positionProperty.value.plus( delta );
              }
            } );
          }
          else {
            atomNode.moveToFront();
          }
        },
        end: () => {
          atom.userControlledProperty.value = false;
          const mappedAtomNode = this.kitPlayAreaNode.atomNodeMap[ atom.id ];
          const mappedKitCollectionBounds = this.kitCollectionMap[ this.kitCollectionList.currentCollectionProperty.value.id ].bounds;
          const currentKit = kitCollection.currentKitProperty.value;

          // responsible for bonding atoms into molecules in play area
          const droppedInKitArea = mappedAtomNode && mappedAtomNode.bounds.intersectsBounds( mappedKitCollectionBounds );
          currentKit.atomDropped( atom, droppedInKitArea );
        }
      } );
      // TODO: Check for memory leak. Unlink?
      this.visibleBoundsProperty.link( visibleBounds => {
        atomListener.setDragBounds( BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelBounds( visibleBounds ) );
      } );
      atomNode.dragListener = atomListener;
      atomNode.addInputListener( atomListener );
    }

    /**
     * Removes atom elements from view.
     *
     * @param atom {Atom2}
     * @private
     */
    onAtomRemovedFromPlayArea( atom ) {

      // Remove mapped atom node from the view and dispose it.
      this.kitPlayAreaNode.atomLayer.removeChild( this.kitPlayAreaNode.atomNodeMap[ atom.id ] );
      delete this.kitPlayAreaNode.atomNodeMap[ atom.id ];
    }
  }

  return buildAMolecule.register( 'BAMView', BAMView );
} );