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

      this.kitCollectionList.atomsInPlayArea.addItemAddedListener( atom => {
        this.addAtomNodeToPlayArea( atom, kitCollectionList.currentCollectionProperty.value );
      } );
      this.kitCollectionList.atomsInPlayArea.addItemRemovedListener( atom => {
        this.removeAtomFromPlayArea( atom );
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
    }

    addCollection( collection ) {
      const kitCollectionNode = new KitCollectionNode( collection, this );
      this.kitCollectionMap[ collection.id ] = kitCollectionNode;

      // supposedly: return this so we can manipulate it in an override....?
      return kitCollectionNode;
    }

    addAtomNodeToPlayArea( atom, kit, view ) {
      // const viewSwipeBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( kit.collectionLayout.availablePlayAreaBounds );
      // const sliceNode = new SliceNode( kit, viewSwipeBounds, view );


      // const swipeCatch = Rectangle.bounds( viewSwipeBounds.eroded( BAMConstants.VIEW_PADDING ) );
      // swipeCatch.addInputListener( sliceNode.sliceInputListener );

      //REVIEW: Can we use the newer drag listeners?
      const atomNode = new AtomNode( atom, {} );
      // this.addChild( swipeCatch );
      // this.addChild( sliceNode );
      this.addChild( atomNode );
      this.atomNodeMap[ atom.id ] = atomNode;

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
          let delta = atom.positionProperty.value.minus( lastPosition );

          // Set the last position to the newly dragged position.
          lastPosition = atom.positionProperty.value;

          // Handles atoms with multiple molecules
          const molecule = kit.currentKitProperty.value.getMolecule( atom );
          if ( molecule ) {
            molecule.atoms.forEach( ( moleculeAtom ) => {
              if ( moleculeAtom !== atom ) {
                moleculeAtom.positionProperty.value = moleculeAtom.positionProperty.value.plus( delta );
                console.log( 'delta = ' + delta );
              }
            } );
          }
          else {
            atomNode.moveToFront();
          }
        },
        end: () => {
          atom.userControlledProperty.value = false;
        }
      } );
      atomNode.dragListener = atomListener;
      atomNode.addInputListener( atomListener );
    }

    removeAtomFromPlayArea( atom ) {
      this.kitCollectionList.atomsInPlayArea.remove( atom );
      delete this.atomNodeMap[ atom.id ];
    }
  }

  return buildAMolecule.register( 'BAMView', BAMView );
} );