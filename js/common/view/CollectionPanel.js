// Copyright 2020-2023, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NextPreviousNavigationNode from '../../../../scenery-phet/js/NextPreviousNavigationNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import CollectionAreaNode from './CollectionAreaNode.js';

class CollectionPanel extends Panel {
  /**
   * @param {BAMModel} bamModel
   * @param {boolean} isSingleCollectionMode
   * @param {Array.<function>} collectionAttachmentCallbacks
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   * @param {function} updateRefillButton
   * @param {Object} [options]
   */
  constructor( bamModel, isSingleCollectionMode, collectionAttachmentCallbacks, toModelBounds,
               showDialogCallback, updateRefillButton, options ) {
    options = merge( {
      cornerRadius: BAMConstants.CORNER_RADIUS
    }, options );
    const layoutNode = new VBox( { spacing: 10 } );
    super( layoutNode, options );

    // @private {VBox}
    this.layoutNode = layoutNode;

    // @private {Node}
    this.collectionAreaHolder = new Node();

    // @private {Object.<kitCollectionId:number, Node}
    this.collectionAreaMap = {};

    // @private {Array.<function>}
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
      createTouchAreaShape( shape ) {
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
    const createCollectionNode = collection => {
      this.collectionAreaMap[ collection.id ] = new CollectionAreaNode(
        collection, isSingleCollectionMode, toModelBounds, showDialogCallback, updateRefillButton
      );
    };

    // Create nodes for all current collections
    bamModel.collections.forEach( collection => {
      createCollectionNode( collection );
    } );

    // If a new collection is added, create one for it
    bamModel.addedCollectionEmitter.addListener( collection => {
      createCollectionNode( collection );
    } );

    // Use the current collection
    this.useCollection( bamModel.currentCollectionProperty.value );

    // As the current collection changes, use that new collection
    bamModel.currentCollectionProperty.link( newCollection => {
      this.useCollection( newCollection );
    } );
  }


  /**
   * Swap to use the specified collection for this panel
   * @param {KitCollection} collection
   *
   * @private
   */
  useCollection( collection ) {

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
   *
   * @private
   * @returns {boolean} If an ancestor is a BuildAMoleculeCanvas
   */
  hasScreenViewAsAncestor() {
    let node = this; // eslint-disable-line consistent-this
    while ( node.getParent() !== null ) {
      node = node.getParent();
      if ( node instanceof ScreenView ) {
        return true;
      }
    }
    return false;
  }
}

buildAMolecule.register( 'CollectionPanel', CollectionPanel );
export default CollectionPanel;
