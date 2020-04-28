// Copyright 2020, University of Colorado Boulder

/**
 * Subtype of BAMScreenView that shows kits, but also has a collection area to the right-hand side
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Color from '../../../../scenery/js/util/Color.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Playable from '../../../../tambo/js/Playable.js';
import buildAMolecule from '../../buildAMolecule.js';
import buildAMoleculeStrings from '../../buildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import AllFilledDialog from './AllFilledDialog.js';
import BAMScreenView from './BAMScreenView.js';
import CollectionPanel from './CollectionPanel.js';

const nextCollectionString = buildAMoleculeStrings.nextCollection;

class MoleculeCollectingScreenView extends BAMScreenView {
  /**
   * @param {KitCollectionList} kitCollectionList
   * @param {boolean} isSingleCollectionMode
   * @param {Function} regenerateCallback //REVIEW: Lower-casing of {function}
   * @constructor //REVIEW: We don't annotate constructors anymore
   */
  constructor( kitCollectionList, isSingleCollectionMode, regenerateCallback ) {
    super( kitCollectionList );
    this.kitCollectionList = kitCollectionList;

    // @private {boolean}
    this.hasShownOnce = false;

    // @private {TextPushButton} Create a next collection button
    this.nextCollectionButton = new TextPushButton( nextCollectionString, {
      centerX: this.layoutBounds.centerX - 100,
      top: this.layoutBounds.top + BAMConstants.VIEW_PADDING,
      font: new PhetFont( {
        size: 18,
        weight: 'bold',
        maxWidth: BAMConstants.TEXT_MAX_WIDTH
      } ),
      baseColor: Color.ORANGE,
      soundPlayer: Playable.NO_SOUND
    } );
    this.nextCollectionButton.touchArea = Shape.bounds( this.nextCollectionButton.localBounds.dilated( 20 ) );
    this.nextCollectionButton.addListener( () => {
      regenerateCallback();
      kitCollectionList.buttonClickedProperty.value = false;
      this.nextCollectionButton.visible = false;
    } );
    this.addChild( this.nextCollectionButton );
    this.nextCollectionButton.visible = false;

    //REVIEW: Why the capitalization on the variable name? lower-case it
    // @private {Dialog} Dialog that shows when all the boxes are filled.
    this.AllFilledDialog = new AllFilledDialog(
      kitCollectionList.buttonClickedProperty,
      regenerateCallback, {
        layoutStrategy: ( dialog, simBounds, screenBounds, scale ) => {
          this.AllFilledDialog.center = screenBounds.center.times( 1.0 / scale ).minusXY( 75, 75 );
        },
        showCallback: () => {
          this.kitCollectionList.buttonClickedProperty.value = false;
        }
      }
    );

    Property.lazyMultilink( [ this.AllFilledDialog.isShowingProperty, this.kitCollectionList.buttonClickedProperty ],
      ( isShowing, buttonClicked ) => {
        this.nextCollectionButton.visible = !isShowing && !buttonClicked;
      } );

    // @public {Bounds2} Adjust play area and carousel bounds to compensate for CollectionPanel
    this.mappedKitCollectionBounds = this.kitCollectionMap[ this.kitCollectionList.currentCollectionProperty.value.id ].bounds.dilatedX( 15 );
    const collectionAttachmentCallbacks = [];
    const collectionPanel = new CollectionPanel(
      this.kitCollectionList,
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
      }
    );

    collectionPanel.setRightTop( new Vector2(
      //REVIEW: Can we jsut use the layoutBounds here, since we're in the ScreenView?
      BAMConstants.STAGE_SIZE.width - BAMConstants.VIEW_PADDING / 2,
      BAMConstants.STAGE_SIZE.top + BAMConstants.VIEW_PADDING / 2
    ) );
    this.addChild( collectionPanel );
    collectionPanel.moveToBack();

    // notify attachment
    collectionAttachmentCallbacks.forEach( callback => { callback(); } );

    // Affects whether the AllFilledDialog will show after resetting.
    this.resetAllButton.addListener( () => {
      this.hasShownOnce = false;
    } );

    // Adjust the center of the AllFilledDialog
    this.visibleBoundsProperty.link( () => {
      //REVIEW: Use the layoutBounds instead of the constant?
      this.AllFilledDialog.center = BAMConstants.STAGE_SIZE.center;
    } );
  }

  /**
   * @param {KitCollection} collection
   *
   * @override
   * @returns {Node}
   */
  addCollection( collection ) {
    const kitCollectionNode = BAMScreenView.prototype.addCollection.call( this, collection, true );
    this.hasShownOnce = false;

    // show dialog the 1st time all collection boxes are filled
    collection.allCollectionBoxesFilledProperty.link( filled => {
      if ( filled ) {
        if ( !this.hasShownOnce ) {
          this.AllFilledDialog.show();
          this.hasShownOnce = true;
        }
      }
    } );
    return kitCollectionNode;
  }
}

buildAMolecule.register( 'MoleculeCollectingScreenView', MoleculeCollectingScreenView );
export default MoleculeCollectingScreenView;