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
  const KitCollectionNode = require( 'BUILD_A_MOLECULE/view/KitCollectionNode' );
  // const Node = require( 'SCENERY/nodes/Node' );
  // const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ScreenView = require( 'JOIST/ScreenView' );
  // const Shape = require( 'KITE/Shape' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  // const SliceNode = require( 'BUILD_A_MOLECULE/view/SliceNode' );

  class BAMView extends ScreenView {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @constructor
     */
    constructor( kitCollectionList ) {

      super();

      this.kitCollectionMap = {}; // maps KitCollection ID => KitCollectionNode

      // @public {KitCollectionList}
      this.kitCollectionList = kitCollectionList;

      this.addCollection( kitCollectionList.currentCollectionProperty.value );

      this.kitCollectionList.atomsInPlayArea.addItemAddedListener( atom => {
        this.addAtomNodeToPlayArea( atom );
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
      // this.addChild( atomNode );

      const atomListener = new SimpleDragHandler( {
        start( event ) {
          atom.userControlledProperty.value = true;
          // const molecule = kit.getMolecule( atom );
          // if ( molecule ) {
          //   molecule.atoms.forEach( function( moleculeAtom ) {
          //     this.atomNodeMap[ moleculeAtom.id ].moveToFront();
          //   } );
          // }
          // else {
          atomNode.moveToFront();
          // }
        },

        end() {
          atom.userControlledProperty.value = false;
          // if ( !bucket.containsParticle( atom ) ) {
          // }
        },

        translate( data ) {
          // REVIEW: Forward translation to new instance of atom node. Toggle visibility
          const modelDelta = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelDelta( data.delta );
          kit.atomDragged( atom, modelDelta );
        }
      } );
      atomNode.addInputListener( atomListener );
      atomNode.atomDragListener = atomListener;
    }

    removeAtomFromPlayArea( atom ) {
      this.kitCollectionList.atomsInPlayArea.remove( atom );
    }
  }

  return buildAMolecule.register( 'BAMView', BAMView );
} );
