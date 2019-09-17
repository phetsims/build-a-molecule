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

      // @public {KitCollectionList}
      this.kitCollectionList = kitCollectionList;

      this.addCollection( kitCollectionList.currentCollectionProperty.value );

      this.kitCollectionList.collections.forEach( collection => {
        collection.kits.forEach( kit => {
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


      this.kitCollectionList.currentCollectionProperty.value.currentKitProperty.link( kit => {
        if ( kit ) {
          this.kitPlayAreaNode = new KitPlayAreaNode( kit );
          kit.atomsInPlayArea.getArray().forEach( atom => {
            console.log( 'atom = ' + atom );


            var atomNode2 = new AtomNode( atom );
            this.kitPlayAreaNode.atomLayer.addChild( atomNode2 );
            this.kitPlayAreaNode.atomNodeMap[ atom.id ] = atomNode2;
          } );
          // this.kitPlayerAreaNode.dispose();
          this.addChild( this.kitPlayAreaNode );
        }
      } );
    }

    addCollection( collection ) {
      const kitCollectionNode = new KitCollectionNode( collection, this );
      this.kitCollectionMap[ collection.id ] = kitCollectionNode;

      // supposedly: return this so we can manipulate it in an override....?
      return kitCollectionNode;
    }

    addAtomNodeToPlayArea( atom, kitCollection, view ) {
      // const viewSwipeBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( kitCollection.collectionLayout.availablePlayAreaBounds );
      // const sliceNode = new SliceNode( kitCollection, viewSwipeBounds, view );


      // const swipeCatch = Rectangle.bounds( viewSwipeBounds.eroded( BAMConstants.VIEW_PADDING ) );
      // swipeCatch.addInputListener( sliceNode.sliceInputListener );

      //REVIEW: Can we use the newer drag listeners?
      const atomNode = new AtomNode( atom, {} );
      // this.addChild( swipeCatch );
      // this.addChild( sliceNode );
      this.kitPlayAreaNode.atomNodeMap[ atom.id ] = atomNode;
      this.kitPlayAreaNode.atomLayer.addChild( atomNode );

      let lastPosition;
      var atomListener = new DragListener( {
        transform: BAMConstants.MODEL_VIEW_TRANSFORM,
        targetNode: atomNode,
        locationProperty: atom.positionProperty,
        start: ( event ) => {

          // Get atom position before drag
          lastPosition = atom.positionProperty.value;
          atom.userControlledProperty.value = true;
        },
        drag: ( event ) => {

          // Get delta from start of drag
          const delta = atom.positionProperty.value.minus( lastPosition );

          // Set the last position to the newly dragged position.
          lastPosition = atom.positionProperty.value;

          // Handles atoms with multiple molecules
          const molecule = kitCollection.currentKitProperty.value.getMolecule( atom );
          if ( molecule ) {
            molecule.atoms.forEach( ( moleculeAtom ) => {
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
          console.log( 'mappedAtomNode = ' + mappedAtomNode );
          const currentKit = kitCollection.currentKitProperty.value;

          const returnToBucket = atom => {
            this.kitCollectionList.currentCollectionProperty.value.currentKitProperty.value.atomsInPlayArea.remove( atom );
            const bucket = currentKit.getBucketForElement( atom.element );
            if ( !bucket.particleList.contains( atom ) ) {
              bucket.particleList.push( atom );
            }
          };

          // responsible for bonding atoms into molecules in play area
          currentKit.atomDropped( atom );

          // responsible for breaking molecules up and returning atoms to their bucket
          if ( mappedAtomNode && mappedAtomNode.bounds.intersectsBounds( mappedKitCollectionBounds ) ) {
            const molecule = currentKit.getMolecule( atom );
            const atomsToReturn = [];
            if ( molecule ) {
              molecule.atoms.forEach( ( moleculeAtom ) => {
                atomsToReturn.push( moleculeAtom );
              } );
              currentKit.breakMolecule( molecule );
              atomsToReturn.forEach( atomToReturn => {
                returnToBucket( atomToReturn );
              } );
            }
            else {
              returnToBucket( atom );
            }
          }
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
      this.kitPlayAreaNode.atomLayer.removeChild( this.kitPlayAreaNode.atomNodeMap[ atom.id ] );
      delete this.kitPlayAreaNode.atomNodeMap[ atom.id ];
    }
  }

  return buildAMolecule.register( 'BAMView', BAMView );
} );