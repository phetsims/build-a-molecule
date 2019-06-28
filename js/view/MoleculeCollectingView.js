// Copyright 2013-2017, University of Colorado Boulder

/**
 * Subtype of BAMView that shows kits, but also has a collection area to the right-hand side
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // const AllFilledDialogNode = require( 'BUILD_A_MOLECULE/view/AllFilledDialogNode' );
  const BAMView = require( 'BUILD_A_MOLECULE/view/BAMView' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionPanel = require( 'BUILD_A_MOLECULE/view/CollectionPanel' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );

  class MoleculeCollectingView extends BAMView {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @param {boolean} isSingleCollectionMode
     * @param {Function} regenerateCallback
     * @constructor
     */
    constructor( kitCollectionList, isSingleCollectionMode, regenerateCallback ) {

      super( kitCollectionList );

      const collectionAttachmentCallbacks = [];

      // @private
      // this.allFilledDialogNode = new AllFilledDialogNode(regenerateCallback);
      // this.allFilledDialogNode.show();


      const collectionPanel = new CollectionPanel(
        kitCollectionList,
        isSingleCollectionMode,
        collectionAttachmentCallbacks,
        ( node ) => {

          // returns model bounds from a node, given local coordinates on a node
          const viewBounds = node.getParent().getUniqueTrail().getTransformTo( this.getUniqueTrail() ).transformBounds2( node.bounds );
          return BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelBounds( viewBounds );
        }, {
          xMargin: 10,
          yMargin: 7,
          minWidth: 250,
          align: 'center'
        } );
      collectionPanel.right = BAMConstants.STAGE_SIZE.width - BAMConstants.VIEW_PADDING / 2;
      collectionPanel.bottom = BAMConstants.STAGE_SIZE.bottom - BAMConstants.VIEW_PADDING;
      this.addChild( collectionPanel );
      collectionPanel.moveToBack();

      // notify attachment
      collectionAttachmentCallbacks.forEach( ( callback ) => { callback(); } );
    }

    /**
     * @param {KitCollection} collection
     *
     * @override
     * @returns {Node}
     */
    addCollection( collection ) {
      const kitCollectionNode = BAMView.prototype.addCollection.call( this, collection );

      // let hasShownOnce = false;
      //
      // // show dialog the 1st time all collection boxes are filled
      // collection.allCollectionBoxesFilledProperty.link( ( filled ) => {
      //   if ( !filled ) {
      //     // if ( !hasShownOnce ) {
      //       // REVIEW: "this" reference is referencing the constructor, allFilledDialogNode is undefined.
      //       this.allFilledDialogNode.show();
      //       hasShownOnce = true;
      //     // }
      //   }
      // } );

      return kitCollectionNode;
    }
  }

  return buildAMolecule.register( 'MoleculeCollectingView', MoleculeCollectingView );

} );
