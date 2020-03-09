// Copyright 2020, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NextPreviousNavigationNode from '../../../../scenery-phet/js/NextPreviousNavigationNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import buildAMoleculeStrings from '../../build-a-molecule-strings.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import BuildAMoleculeQueryParameters from '../BuildAMoleculeQueryParameters.js';
import CollectionAreaNode from './CollectionAreaNode.js';

const collectionPatternString = buildAMoleculeStrings.collectionPattern;
const yourMoleculesString = buildAMoleculeStrings.yourMolecules;

class CollectionPanel extends Panel {
  /**
   * @param {KitCollectionList} kitCollectionList
   * @param {boolean} isSingleCollectionMode
   * @param {Array.<function>} collectionAttachmentCallbacks
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   * @param {function} updateRefillButton
   * @param {Object} [options]
   */
  constructor( kitCollectionList, isSingleCollectionMode, collectionAttachmentCallbacks, toModelBounds,
               showDialogCallback, updateRefillButton, options ) {
    options = merge( {
      cornerRadius: BAMConstants.CORNER_RADIUS
    }, options );
    const layoutNode = new VBox( { spacing: 10 } );
    super( layoutNode, options );

    this.layoutNode = layoutNode;
    this.collectionAreaHolder = new Node();
    this.collectionAreaMap = {}; // kitCollection id => node
    this.collectionAttachmentCallbacks = collectionAttachmentCallbacks;

    // Header text for panel
    const yourMoleculesText = new Text( yourMoleculesString, {
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
    kitCollectionList.currentCollectionProperty.link( () => {
      currentCollectionText.text = StringUtils.fillIn( collectionPatternString, {
        number: kitCollectionList.currentIndex + BuildAMoleculeQueryParameters.skipLevels
      } );
    } );

    // Used to cycle through collections when a collection has bee completed.
    const collectionSwitcher = new NextPreviousNavigationNode( currentCollectionText, {
      arrowColor: BAMConstants.KIT_ARROW_BACKGROUND_ENABLED,
      arrowStrokeColor: BAMConstants.KIT_ARROW_BORDER_ENABLED,
      arrowWidth: 14,
      arrowHeight: 18,
      next() {
        kitCollectionList.switchToNextCollection();
      },
      previous() {
        kitCollectionList.switchToPreviousCollection();
      },
      createTouchAreaShape( shape ) {
        // square touch area
        return Shape.bounds( shape.bounds.dilated( 7 ) );
      }
    } );

    // Update the arrows that indicate the next/previous collection
    const updateSwitcher = () => {
      collectionSwitcher.hasNextProperty.value = kitCollectionList.hasNextCollection();
      collectionSwitcher.hasPreviousProperty.value = kitCollectionList.hasPreviousCollection();
    };

    kitCollectionList.currentCollectionProperty.link( updateSwitcher );
    kitCollectionList.addedCollectionEmitter.addListener( updateSwitcher );
    kitCollectionList.removedCollectionEmitter.addListener( updateSwitcher );
    this.layoutNode.addChild( collectionSwitcher );

    // all of the collection boxes themselves
    this.layoutNode.addChild( this.collectionAreaHolder );


    // anonymous function here, so we don't create a bunch of fields
    const createCollectionNode = collection => {
      this.collectionAreaMap[ collection.id ] = new CollectionAreaNode(
        collection, isSingleCollectionMode, toModelBounds, showDialogCallback, updateRefillButton
      );
    };

    // create nodes for all current collections
    kitCollectionList.collections.forEach( collection => {
      createCollectionNode( collection );
    } );

    // if a new collection is added, create one for it
    kitCollectionList.addedCollectionEmitter.addListener( collection => {
      createCollectionNode( collection );
    } );

    // use the current collection
    this.useCollection( kitCollectionList.currentCollectionProperty.value );

    // As the current collection changes, use that new collection
    kitCollectionList.currentCollectionProperty.link( newCollection => {
      this.useCollection( newCollection );
    } );
  }


  /**
   * @param {KitCollection} collection
   * @private
   */
  useCollection( collection ) {

    // swap out the inner collection area
    this.collectionAreaHolder.removeAllChildren();
    const collectionAreaNode = this.collectionAreaMap[ collection.id ];
    this.collectionAreaHolder.addChild( collectionAreaNode );

    // if we are hooked up, update the box locations. otherwise, listen to the canvas for when it is
    if ( this.hasCanvasAsParent() ) {
      collectionAreaNode.updateCollectionBoxLocations();
    }
    else {
      // we need to listen for this because the update needs to use canvas' global/local/view coordinate transformations
      this.collectionAttachmentCallbacks.push( () => {
        collectionAreaNode.updateCollectionBoxLocations();
      } );
    }
  }

  /**
   * Walk up the scene graph, looking to see if we are a (grand)child of a canvas
   * @private
   *
   * @returns {boolean} If an ancestor is a BuildAMoleculeCanvas
   */
  hasCanvasAsParent() {
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