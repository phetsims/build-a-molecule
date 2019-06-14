// Copyright 2013-2017, University of Colorado Boulder

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

  class MoleculeCollectingView extends BAMView {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @param {boolean} isSingleCollectionMode
     * @param {Function} regenerateCallback
     * @constructor
     */
    constructor( kitCollectionList, isSingleCollectionMode, regenerateCallback ) {

      super( kitCollectionList );

      this.regenerateCallback = regenerateCallback;

      const collectionAttachmentCallbacks = [];

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
          align: 'center'
        } );
      collectionPanel.right = BAMConstants.STAGE_SIZE.width - BAMConstants.VIEW_PADDING / 2;
      collectionPanel.bottom = this.kitCollectionMap[ 0 ].bottom;
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

      let hasShownOnce = false;
      let allFilledDialogNode = null;

      // show dialog the 1st time all collection boxes are filled
      collection.allCollectionBoxesFilledProperty.link( ( filled ) => {
        if ( filled ) {
          if ( !hasShownOnce ) {
            allFilledDialogNode = new AllFilledDialogNode( this.kitCollectionList.availablePlayAreaBounds, this.regenerateCallback );
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
  }

  return buildAMolecule.register( 'MoleculeCollectingView', MoleculeCollectingView );

} );
