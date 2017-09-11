// Copyright 2013-2015, University of Colorado Boulder

/**
 * Subtype of BAMView that shows kits, but also has a collection area to the right-hand side
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var AllFilledDialogNode = require( 'BUILD_A_MOLECULE/control/AllFilledDialogNode' );
  var BAMView = require( 'BUILD_A_MOLECULE/view/BAMView' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CollectionPanel = require( 'BUILD_A_MOLECULE/control/CollectionPanel' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );

  function MoleculeCollectingView( collectionList, isSingleCollectionMode, regenerateCallback ) {
    var self = this;

    BAMView.call( this, collectionList );

    this.regenerateCallback = regenerateCallback;

    var collectionAttachmentCallbacks = [];

    var collectionPanel = new CollectionPanel( collectionList, isSingleCollectionMode, collectionAttachmentCallbacks, function( node ) {
      // returns model bounds from a node, given local coordinates on a node
      var viewBounds = node.getParent().getUniqueTrail().getTransformTo( self.getUniqueTrail() ).transformBounds2( node.bounds );
      return Constants.modelViewTransform.viewToModelBounds( viewBounds );
    } );
    collectionPanel.right = Constants.stageSize.width - Constants.viewPadding;
    collectionPanel.top = Constants.viewPadding;
    this.baseNode.addChild( collectionPanel );

    // notify attachment
    _.each( collectionAttachmentCallbacks, function( callback ) { callback(); } );

    /*---------------------------------------------------------------------------*
     * collection box hint arrow. add this only to the 1st collection
     *----------------------------------------------------------------------------*/

    // final KitCollection firstCollection = collectionList.currentCollection.get();
    // for ( final Kit kit : firstCollection.getKits() ) {
    //     kit.addMoleculeListener( new Kit.MoleculeAdapter() {
    //         @Override public void addedMolecule( Molecule molecule ) {
    //             CollectionBox targetBox = firstCollection.getFirstTargetBox( molecule );

    //             // if a hint doesn't exist AND we have a target box, add it
    //             if ( collectionBoxHintNode == null && targetBox != null ) {
    //                 collectionBoxHintNode = new CollectionBoxHintNode( molecule, targetBox );
    //                 addWorldChild( collectionBoxHintNode );
    //             }
    //             else if ( collectionBoxHintNode != null ) {
    //                 // otherwise clear any other hint nodes
    //                 collectionBoxHintNode.disperse();
    //             }
    //         }

    //         @Override public void removedMolecule( Molecule molecule ) {
    //             // clear any existing hint node on molecule removal
    //             if ( collectionBoxHintNode != null ) {
    //                 collectionBoxHintNode.disperse();
    //             }
    //         }
    //     } );

    //     // whenever a kit switch happens, remove the arrow
    //     kit.visible.addObserver( new SimpleObserver() {
    //         public void update() {
    //             // clear any existing hint node on molecule removal
    //             if ( collectionBoxHintNode != null ) {
    //                 collectionBoxHintNode.disperse();
    //             }
    //         }
    //     } );
    // }
  }
  buildAMolecule.register( 'MoleculeCollectingView', MoleculeCollectingView );

  return inherit( BAMView, MoleculeCollectingView, {
    addCollection: function( collection ) {
      var self = this;
      var kitCollectionNode = BAMView.prototype.addCollection.call( this, collection );

      var hasShownOnce = false;
      var allFilledDialogNode = null;

      // show dialog the 1st time all collection boxes are filled
      collection.allCollectionBoxesFilledProperty.link( function() {
        if ( collection.allCollectionBoxesFilled ) {
          if ( !hasShownOnce ) {
            allFilledDialogNode = new AllFilledDialogNode( self.collectionList.availablePlayAreaBounds, self.regenerateCallback );
            hasShownOnce = true;
          }
          if ( !allFilledDialogNode.hasParent() ) {
            kitCollectionNode.addChild( allFilledDialogNode );
          }
        }
        else {
          if ( allFilledDialogNode !== null ) {
            allFilledDialogNode.detach();
          }
        }
      } );

      return kitCollectionNode;
    }
  } );
} );
