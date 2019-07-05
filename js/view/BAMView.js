// Copyright 2013-2017, University of Colorado Boulder

/**
 * Node canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KitCollectionNode = require( 'BUILD_A_MOLECULE/view/KitCollectionNode' );
  // var Node = require( 'SCENERY/nodes/Node' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  // var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );
  // var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  // var SliceNode = require( 'BUILD_A_MOLECULE/view/SliceNode' );

  /**
   * @param {KitCollectionList} kitCollectionList
   * @constructor
   */
  function BAMView( kitCollectionList ) {

    ScreenView.call( this );
    var self = this;

    this.kitCollectionMap = {}; // maps KitCollection ID => KitCollectionNode

    this.kitCollectionList = kitCollectionList;

    this.addCollection( kitCollectionList.currentCollectionProperty.value );

    this.atomsInPlayArea = new ObservableArray( [] );
    this.atomsInPlayArea.addItemAddedListener( function( atom ) {
      self.addAtomToPlayArea( atom );
    } );
    this.atomsInPlayArea.addItemRemovedListener( function( atom ) {
      self.removeAtomFromPlayArea( atom );
    } );

    kitCollectionList.currentCollectionProperty.link( function( newCollection, oldCollection ) {
      if ( oldCollection ) {
        self.removeChild( self.kitCollectionMap[ oldCollection.id ] );
      }
      if ( newCollection ) {
        self.addChild( self.kitCollectionMap[ newCollection.id ] );
      }
    } );

    kitCollectionList.addedCollectionEmitter.addListener( this.addCollection.bind( this ) );
  }
  buildAMolecule.register( 'BAMView', BAMView );

  return inherit( ScreenView, BAMView, {

    addCollection: function( collection ) {
      var kitCollectionNode = new KitCollectionNode( this.kitCollectionList, collection, this );
      this.kitCollectionMap[ collection.id ] = kitCollectionNode;

      // supposedly: return this so we can manipulate it in an override....?
      return kitCollectionNode;
    },
    addAtomToPlayArea: function( atom, kit, view ) {
      // var viewSwipeBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( kit.collectionLayout.availablePlayAreaBounds );
      // var sliceNode = new SliceNode( kit, viewSwipeBounds, view );


      // var swipeCatch = Rectangle.bounds( viewSwipeBounds.eroded( BAMConstants.VIEW_PADDING ) );
      // swipeCatch.addInputListener( sliceNode.sliceInputListener );

      //REVIEW: Can we use the newer drag listeners?
      var atomNode = new AtomNode( atom, {} );
      // this.addChild( swipeCatch );
      // this.addChild( sliceNode );
      // this.addChild( atomNode );

      var atomListener = new SimpleDragHandler( {
        start: function( event ) {
          atom.userControlledProperty.value = true;
          // var molecule = kit.getMolecule( atom );
          // if ( molecule ) {
          //   molecule.atoms.forEach( function( moleculeAtom ) {
          //     this.atomNodeMap[ moleculeAtom.id ].moveToFront();
          //   } );
          // }
          // else {
          atomNode.moveToFront();
          // }
        },

        end: function() {
          atom.userControlledProperty.value = false;
          // if ( !bucket.containsParticle( atom ) ) {
          // }
        },

        translate: function( data ) {
          // REVIEW: Forward translation to new instance of atom node. Toggle visibility
          var modelDelta = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelDelta( data.delta );
          kit.atomDragged( atom, modelDelta );
        }
      } );
      atomNode.addInputListener( atomListener );
      atomNode.atomDragListener = atomListener;
    },
    removeAtomFromPlayArea: function( atom ) {
      this.atomsInPlayArea.remove( atom );
    }
  } );
} );
