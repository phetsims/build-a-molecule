// Copyright 2020, University of Colorado Boulder

/**
 * Subtype of BAMScreenView that shows kits, but also has a collection area to the right-hand side
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const AllFilledNode = require( 'BUILD_A_MOLECULE/common/view/AllFilledNode' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const BAMScreenView = require( 'BUILD_A_MOLECULE/common/view/BAMScreenView' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionPanel = require( 'BUILD_A_MOLECULE/common/view/CollectionPanel' );
  const Color = require( 'SCENERY/util/Color' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Playable = require( 'TAMBO/Playable' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const nextCollectionString = require( 'string!BUILD_A_MOLECULE/nextCollection' );

  class MoleculeCollectingScreenView extends BAMScreenView {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @param {boolean} isSingleCollectionMode
     * @param {Function} regenerateCallback
     * @constructor
     */
    constructor( kitCollectionList, isSingleCollectionMode, regenerateCallback ) {
      super( kitCollectionList );

      // @private
      this.allFilledNode = new AllFilledNode();
      this.regenerateCallback = regenerateCallback;


      // Adjust play area and carousel bounds to compensate for CollectionPanel
      this.playAreaDragBounds.setMaxX( BAMConstants.KIT_VIEW_WIDTH );
      this.mappedKitCollectionBounds = this.kitCollectionMap[ this.kitCollectionList.currentCollectionProperty.value.id ].bounds.dilatedX( 15 );
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
        this.showDialogCallback,
        this.updateRefillButton, {
          xMargin: 10,
          yMargin: 7,
          minWidth: 250,
          align: 'center'
        },
      );

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
      const kitCollectionNode = BAMScreenView.prototype.addCollection.call( this, collection, true );
      let hasShownOnce = false;

      // show dialog the 1st time all collection boxes are filled
      collection.allCollectionBoxesFilledProperty.link( filled => {
        if ( filled ) {
          if ( !hasShownOnce ) {
            this.nextCollectionButton = new TextPushButton( nextCollectionString, {
              centerX: this.layoutBounds.centerX - 100,
              top: this.layoutBounds.top + BAMConstants.VIEW_PADDING,
              font: new PhetFont( {
                size: 18,
                weight: 'bold',
                maxWidth: BAMConstants.TEXT_MAX_WIDTH,
                visible: false
              } ),
              baseColor: Color.ORANGE,
              soundPlayer: Playable.NO_SOUND
            } );
            this.nextCollectionButton.touchArea = Shape.bounds( this.nextCollectionButton.localBounds.dilated( 20 ) );
            this.nextCollectionButton.addListener( () => {
              this.regenerateCallback();
              this.nextCollectionButton.dispose();
            } );
            this.addChild( this.nextCollectionButton );
            this.allFilledNode.show();
            hasShownOnce = true;
          }
        }
      } );

      return kitCollectionNode;
    }
  }

  return buildAMolecule.register( 'MoleculeCollectingScreenView', MoleculeCollectingScreenView );

} );
