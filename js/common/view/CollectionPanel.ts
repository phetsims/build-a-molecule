// Copyright 2020-2025, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NextPreviousNavigationNode from '../../../../scenery-phet/js/NextPreviousNavigationNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import BAMModel from '../model/BAMModel.js';
import CompleteMolecule from '../model/CompleteMolecule.js';
import KitCollection from '../model/KitCollection.js';
import CollectionAreaNode from './CollectionAreaNode.js';

type SelfOptions = EmptySelfOptions;
export type CollectionPanelOptions = SelfOptions & PanelOptions;

class CollectionPanel extends Panel {

  private readonly layoutNode: VBox;
  private readonly collectionAreaHolder: Node;
  private readonly collectionAreaMap: Record<number, CollectionAreaNode>;
  private readonly collectionAttachmentCallbacks: ( () => void )[];

  /**
   * @param bamModel - The main model for Build A Molecule
   * @param isSingleCollectionMode - Whether this is in single collection mode
   * @param collectionAttachmentCallbacks - Callbacks for collection attachment
   * @param toModelBounds - Function to convert to model bounds
   * @param showDialogCallback - Callback for showing dialogs
   * @param updateRefillButton - Function to update refill button
   * @param providedOptions - Panel options
   */
  public constructor( bamModel: BAMModel, isSingleCollectionMode: boolean, collectionAttachmentCallbacks: ( () => void )[], toModelBounds: ( node: Node ) => Bounds2,
                      showDialogCallback: ( completeMolecule: CompleteMolecule ) => void, updateRefillButton: () => void, providedOptions?: CollectionPanelOptions ) {
    const options = optionize<CollectionPanelOptions, SelfOptions, PanelOptions>()( {
      cornerRadius: BAMConstants.CORNER_RADIUS
    }, providedOptions );
    const layoutNode = new VBox( { spacing: 10 } );
    super( layoutNode, options );

    this.layoutNode = layoutNode;
    this.collectionAreaHolder = new Node();
    this.collectionAreaMap = {};
    this.collectionAttachmentCallbacks = collectionAttachmentCallbacks;

    // Create header text for panel
    const yourMoleculesText = new Text( BuildAMoleculeStrings.yourMolecules, {
      font: new PhetFont( {
        size: 22
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH - 10
    } );
    this.layoutNode.addChild( yourMoleculesText );

    // "Collection X" with arrows
    const currentCollectionText = new Text( '', {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH - 10
    } );

    // Manages changing the label of the current collection
    bamModel.currentCollectionProperty.link( () => {
      currentCollectionText.string = StringUtils.fillIn( BuildAMoleculeStrings.collectionPattern, {
        number: bamModel.currentIndex + 1
      } );
    } );

    // Used to cycle through collections when a collection has bee completed.
    const collectionSwitcher = new NextPreviousNavigationNode( currentCollectionText, {
      arrowColor: BAMConstants.KIT_ARROW_BACKGROUND_ENABLED,
      arrowStrokeColor: BAMConstants.KIT_ARROW_BORDER_ENABLED,
      arrowWidth: 14,
      arrowHeight: 18,
      next() {
        bamModel.switchToNextCollection();
      },
      previous() {
        bamModel.switchToPreviousCollection();
      },
      createTouchAreaShape( shape: Shape ) {
        // square touch area
        return Shape.bounds( shape.bounds.dilated( 7 ) );
      }
    } );

    // Update the arrows that indicate the next/previous collection
    const updateSwitcher = () => {
      collectionSwitcher.hasNextProperty.value = bamModel.hasNextCollection();
      collectionSwitcher.hasPreviousProperty.value = bamModel.hasPreviousCollection();
    };

    bamModel.currentCollectionProperty.link( updateSwitcher );
    bamModel.addedCollectionEmitter.addListener( updateSwitcher );
    bamModel.removedCollectionEmitter.addListener( updateSwitcher );
    this.layoutNode.addChild( collectionSwitcher );

    // Add all of the collection boxes
    this.layoutNode.addChild( this.collectionAreaHolder );

    // anonymous function here, so we don't create a bunch of fields
    const createCollectionNode = ( collection: KitCollection ): void => {
      this.collectionAreaMap[ collection.id ] = new CollectionAreaNode(
        collection, isSingleCollectionMode, toModelBounds, showDialogCallback, updateRefillButton
      );
    };

    // Create nodes for all current collections
    bamModel.collections.forEach( collection => {
      createCollectionNode( collection );
    } );

    // If a new collection is added, create one for it
    bamModel.addedCollectionEmitter.addListener( ( collection: KitCollection ) => {
      createCollectionNode( collection );
    } );

    // Use the current collection
    this.useCollection( bamModel.currentCollectionProperty.value );

    // As the current collection changes, use that new collection
    bamModel.currentCollectionProperty.link( ( newCollection: KitCollection ) => {
      this.useCollection( newCollection );
    } );
  }


  /**
   * Swap to use the specified collection for this panel
   * @param collection - The collection to use
   */
  private useCollection( collection: KitCollection ): void {

    // swap out the inner collection area
    this.collectionAreaHolder.removeAllChildren();
    const collectionAreaNode = this.collectionAreaMap[ collection.id ];
    this.collectionAreaHolder.addChild( collectionAreaNode );

    // if we are hooked up, update the box positions. otherwise, listen to the canvas for when it is
    if ( this.hasScreenViewAsAncestor() ) {
      collectionAreaNode.updateCollectionBoxPositions();
    }
    else {
      // we need to listen for this because the update needs to use canvas' global/local/view coordinate transformations
      this.collectionAttachmentCallbacks.push( () => {
        collectionAreaNode.updateCollectionBoxPositions();
      } );
    }
  }

  /**
   * Walk up the scene graph, looking to see if we are a (grand)child of a canvas
   * @returns If an ancestor is a ScreenView
   */
  private hasScreenViewAsAncestor(): boolean {
    return this.hasScreenViewAsAncestorHelper( this );
  }

  /**
   * Helper method to check ancestors without using this alias
   */
  private hasScreenViewAsAncestorHelper( node: Node ): boolean {
    const parent = node.getParent();
    if ( parent === null ) {
      return false;
    }
    if ( parent instanceof ScreenView ) {
      return true;
    }
    return this.hasScreenViewAsAncestorHelper( parent );
  }
}

buildAMolecule.register( 'CollectionPanel', CollectionPanel );
export default CollectionPanel;