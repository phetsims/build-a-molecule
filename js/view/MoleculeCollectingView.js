// Copyright 2013-2019, University of Colorado Boulder

/**
 * Subtype of BAMView that shows kits, but also has a collection area to the right-hand side
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const AllFilledNode = require( 'BUILD_A_MOLECULE/view/AllFilledNode' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const BAMView = require( 'BUILD_A_MOLECULE/view/BAMView' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionPanel = require( 'BUILD_A_MOLECULE/view/CollectionPanel' );
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

      // @private
      this.regenerateCallback = regenerateCallback;

      // Erode play area to compensate for CollectionPanel
      this.playAreaDragBounds.setMaxX( BAMConstants.KIT_VIEW_WIDTH );
      const collectionAttachmentCallbacks = [];
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
      const kitCollectionNode = BAMView.prototype.addCollection.call( this, collection, true );
      let hasShownOnce = false;

      // show dialog the 1st time all collection boxes are filled
      collection.allCollectionBoxesFilledProperty.link( filled => {
        if ( filled ) {
          if ( !hasShownOnce ) {

            // Create the allFilledNode with a next collection button.
            const allFilledNode = new AllFilledNode( this.regenerateCallback, {
              center: new Vector2( this.layoutBounds.centerX - 100, this.layoutBounds.centerY - 90 )
            } );

            this.addChild( allFilledNode );
            hasShownOnce = true;
          }
        }
      } );

      return kitCollectionNode;
    }
  }

  return buildAMolecule.register( 'MoleculeCollectingView', MoleculeCollectingView );

} );
