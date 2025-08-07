// Copyright 2020-2025, University of Colorado Boulder

/**
 * Subtype of BAMScreenView that shows kits, but also has a collection area to the right-hand side
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import BAMModel from '../model/BAMModel.js';
import KitCollection from '../model/KitCollection.js';
import AllFilledDialog from './AllFilledDialog.js';
import BAMScreenView from './BAMScreenView.js';
import CollectionPanel from './CollectionPanel.js';
import KitCollectionNode from './KitCollectionNode.js';

class MoleculeCollectingScreenView extends BAMScreenView {

  // Whether the AllFilledDialog has been shown once
  private hasShownOnce: boolean;

  // Button to go to the next collection
  public override readonly nextCollectionButton: TextPushButton;

  // Dialog shown when all collection boxes are filled
  private readonly allFilledDialog: AllFilledDialog;

  /**
   * @param bamModel - The main model for Build A Molecule
   * @param isSingleCollectionMode - Whether this is in single collection mode
   */
  public constructor( bamModel: BAMModel, isSingleCollectionMode: boolean ) {
    super( bamModel );

    this.hasShownOnce = false;
    this.nextCollectionButton = new TextPushButton( BuildAMoleculeStrings.nextCollection, {
      centerX: this.layoutBounds.centerX - 100,
      top: this.layoutBounds.top + BAMConstants.VIEW_PADDING,
      font: new PhetFont( {
        size: 18,
        weight: 'bold'
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH,
      baseColor: Color.ORANGE,
      soundPlayer: nullSoundPlayer
    } );
    this.nextCollectionButton.touchArea = Shape.bounds( this.nextCollectionButton.localBounds.dilated( 20 ) );
    this.nextCollectionButton.addListener( (): void => {
      bamModel.regenerateCallback();
      bamModel.buttonClickedProperty.value = false;
      this.nextCollectionButton.visible = false;
    } );
    this.addChild( this.nextCollectionButton );
    this.nextCollectionButton.visible = false;

    this.allFilledDialog = new AllFilledDialog(
      bamModel.buttonClickedProperty,
      bamModel.regenerateCallback, {
        showCallback: (): void => {
          this.bamModel.buttonClickedProperty.value = false;
        }
      }
    );

    Multilink.lazyMultilink( [ this.allFilledDialog.isShowingProperty, this.bamModel.buttonClickedProperty ],
      ( isShowing: boolean, buttonClicked: boolean ): void => {
        this.nextCollectionButton.visible = !isShowing && !buttonClicked;
      } );

    // Note: mappedKitCollectionBounds is initialized in parent constructor, we're just re-assigning here
    this.mappedKitCollectionBounds = this.kitCollectionMap[ this.bamModel.currentCollectionProperty.value.id ].bounds.dilatedX( 15 );
    const collectionAttachmentCallbacks: ( () => void )[] = [];
    const collectionPanel = new CollectionPanel(
      this.bamModel,
      isSingleCollectionMode,
      collectionAttachmentCallbacks,
      ( node: Node ): Bounds2 => {

        // returns model bounds from a node, given local coordinates on a node
        const viewBounds = node.getParent()!.getUniqueTrail().getTransformTo( this.getUniqueTrail() ).transformBounds2( node.bounds );
        return BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelBounds( viewBounds );
      },
      (): void => { /* no-op - showDialogCallback is handled elsewhere */ },
      this.updateRefillButton, {
        xMargin: 10,
        yMargin: 7,
        minWidth: 250,
        align: 'center'
      } );

    collectionPanel.setRightTop( new Vector2(
      this.layoutBounds.width - BAMConstants.VIEW_PADDING / 2,
      this.layoutBounds.top + BAMConstants.VIEW_PADDING / 2
    ) );
    this.addChild( collectionPanel );
    collectionPanel.moveToBack();

    // notify attachment
    collectionAttachmentCallbacks.forEach( ( callback: () => void ): void => { callback(); } );

    // Affects whether the AllFilledDialog will show after resetting.
    this.resetAllButton.addListener( (): void => {
      this.hasShownOnce = false;
    } );

    // Adjust the center of the AllFilledDialog
    this.visibleBoundsProperty.link( (): void => {
      this.allFilledDialog.center = this.layoutBounds.center;
    } );
  }

  /**
   * Adds a collection to the view and sets up dialog behavior for when all collection boxes are filled.
   * @param collection - The kit collection to add
   * @returns The created KitCollectionNode
   */
  public override addCollection( collection: KitCollection ): KitCollectionNode {
    // Replicate parent's addCollection behavior since it's private
    const kitCollectionNode = new KitCollectionNode( collection, this, true );
    this.kitCollectionMap[ collection.id ] = kitCollectionNode;
    this.hasShownOnce = false;

    // show dialog the 1st time all collection boxes are filled
    collection.allCollectionBoxesFilledProperty.link( filled => {
      if ( filled ) {
        if ( !this.hasShownOnce && !this.bamModel.hasNextCollection() ) {
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