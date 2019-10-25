// Copyright 2013-2019, University of Colorado Boulder

/**
 * Subtype of BAMView that shows kits, but also has a collection area to the right-hand side
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const AllFilledDialogNode = require( 'BUILD_A_MOLECULE/view/AllFilledDialogNode' );
  const BAMView = require( 'BUILD_A_MOLECULE/view/BAMView' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionPanel = require( 'BUILD_A_MOLECULE/view/CollectionPanel' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const Vector2 = require( 'DOT/Vector2' );

  class MoleculeCollectingView extends BAMView {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @param {boolean} isSingleCollectionMode
     * @param {Function} regenerateCallback
     * @constructor
     */
    constructor( kitCollectionList, isSingleCollectionMode, regenerateCallback ) {
      super( kitCollectionList );

      // Erode play area to compensate for CollectionPanel
      this.playAreaDragBounds.setMaxX( 650 );
      const collectionAttachmentCallbacks = [];

      // @private
      this.allFilledDialogNode = new AllFilledDialogNode( regenerateCallback );

      const collectionPanel = new CollectionPanel(
        kitCollectionList,
        isSingleCollectionMode,
        collectionAttachmentCallbacks,
        node => {

          // returns model bounds from a node, given local coordinates on a node
          const viewBounds = node.getParent().getUniqueTrail().getTransformTo( this.getUniqueTrail() ).transformBounds2( node.bounds );
          return BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelBounds( viewBounds );
        },
        this.showDialogCallback, {
          xMargin: 10,
          yMargin: 7,
          minWidth: 250,
          align: 'center'
        } );

      collectionPanel.setRightTop( new Vector2(
        BAMConstants.STAGE_SIZE.width - BAMConstants.VIEW_PADDING / 2,
        BAMConstants.STAGE_SIZE.top + BAMConstants.VIEW_PADDING / 2,
      ) );
      this.resetAllButton.setCenter( new Vector2(
        collectionPanel.centerX,
        collectionPanel.bottom + BAMConstants.RESET_BUTTON_RADIUS + BAMConstants.VIEW_PADDING / 2,
      ) );
      this.addChild( collectionPanel );
      collectionPanel.moveToBack();

      // notify attachment
      collectionAttachmentCallbacks.forEach( callback => { callback(); } );
    }

    /**
     * @param {KitCollection} collection
     *
     * @override
     * @returns {Node}
     */
    addCollection( collection ) {
      const kitCollectionNode = BAMView.prototype.addCollection.call( this, collection );
      let hasShownOnce = false;

      // show dialog the 1st time all collection boxes are filled
      collection.allCollectionBoxesFilledProperty.link( filled => {
        if ( filled ) {
          if ( !hasShownOnce ) {
            this.allFilledDialogNode.show();
            hasShownOnce = true;
          }
        }
      } );

      return kitCollectionNode;
    }
  }

  return buildAMolecule.register( 'MoleculeCollectingView', MoleculeCollectingView );

} );
