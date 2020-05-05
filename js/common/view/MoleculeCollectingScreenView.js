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

//REVIEW: Can inline these now if desired
const nextCollectionString = buildAMoleculeStrings.nextCollection;

class MoleculeCollectingScreenView extends BAMScreenView {
  /**
   * @param {BAMModel} bamModel
   * @param {boolean} isSingleCollectionMode
   */
  constructor( bamModel, isSingleCollectionMode ) {
    super( bamModel );

    //REVIEW: visibility docs (public?)
    this.bamModel = bamModel;

    // @private {boolean}
    this.hasShownOnce = false;

    // @private {TextPushButton} Create a next collection button
    this.nextCollectionButton = new TextPushButton( nextCollectionString, {
      centerX: this.layoutBounds.centerX - 100,
      top: this.layoutBounds.top + BAMConstants.VIEW_PADDING,
      font: new PhetFont( {
        size: 18,
        weight: 'bold',
        //REVIEW: I don't believe maxWidth is a PhetFont option, do you need the option elsewhere?
        maxWidth: BAMConstants.TEXT_MAX_WIDTH
      } ),
      baseColor: Color.ORANGE,
      soundPlayer: Playable.NO_SOUND
    } );
    //RREVIEW: touchArea accepts {Bounds2}, no need for Shape.bounds wrapping
    this.nextCollectionButton.touchArea = Shape.bounds( this.nextCollectionButton.localBounds.dilated( 20 ) );
    this.nextCollectionButton.addListener( () => {
      bamModel.regenerateCallback();
      bamModel.buttonClickedProperty.value = false;
      this.nextCollectionButton.visible = false;
    } );
    this.addChild( this.nextCollectionButton );
    this.nextCollectionButton.visible = false;

    // @private {Dialog} Dialog that shows when all the boxes are filled.
    this.allFilledDialog = new AllFilledDialog(
      bamModel.buttonClickedProperty,
      bamModel.regenerateCallback, {
        //REVIEW: this layoutStrategy seems to be used for all of the usages (e.g. this one), and seems like it
        //REVIEW: belongs in AllFilledDialog itself (since it's using nothing from the screen view here).
        layoutStrategy: ( dialog, simBounds, screenBounds, scale ) => {
          //REVIEW: Also if called synchronously, this.allFilledDialog wouldn't be available yet
          this.allFilledDialog.center = screenBounds.center.times( 1.0 / scale ).minusXY( 75, 75 );
        },
        showCallback: () => {
          this.bamModel.buttonClickedProperty.value = false;
        }
      }
    );

    Property.lazyMultilink( [ this.allFilledDialog.isShowingProperty, this.bamModel.buttonClickedProperty ],
      ( isShowing, buttonClicked ) => {
        this.nextCollectionButton.visible = !isShowing && !buttonClicked;
      } );

    // @public {Bounds2} Adjust play area and carousel bounds to compensate for CollectionPanel
    this.mappedKitCollectionBounds = this.kitCollectionMap[ this.bamModel.currentCollectionProperty.value.id ].bounds.dilatedX( 15 );
    const collectionAttachmentCallbacks = [];
    const collectionPanel = new CollectionPanel(
      this.bamModel,
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
      this.layoutBounds.width - BAMConstants.VIEW_PADDING / 2,
      this.layoutBounds.top + BAMConstants.VIEW_PADDING / 2
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
      this.allFilledDialog.center = this.layoutBounds.center;
    } );
  }

  /**
   * @param {KitCollection} collection
   *
   * @override
   * @public
   * @returns {Node}
   */
  addCollection( collection ) {
    //REVIEW: super.addCollection( ... )
    const kitCollectionNode = BAMScreenView.prototype.addCollection.call( this, collection, true );
    this.hasShownOnce = false;

    // show dialog the 1st time all collection boxes are filled
    collection.allCollectionBoxesFilledProperty.link( filled => {
      if ( filled ) {
        if ( !this.hasShownOnce ) {
          this.allFilledDialog.show();
          this.hasShownOnce = true;
        }
      }
    } );
    return kitCollectionNode;
  }
}

buildAMolecule.register( 'MoleculeCollectingScreenView', MoleculeCollectingScreenView );
export default MoleculeCollectingScreenView;