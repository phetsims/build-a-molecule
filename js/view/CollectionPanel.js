// Copyright 2013-2019, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionAreaNode = require( 'BUILD_A_MOLECULE/view/CollectionAreaNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const NextPreviousNavigationNode = require( 'SCENERY_PHET/NextPreviousNavigationNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Shape = require( 'KITE/Shape' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const collectionPatternString = require( 'string!BUILD_A_MOLECULE/collectionPattern' );
  const yourMoleculesString = require( 'string!BUILD_A_MOLECULE/yourMolecules' );

  /**
   * @param {KitCollectionList} kitCollectionList
   * @param {boolean} isSingleCollectionMode
   * @param {Array.<function>} collectionAttachmentCallbacks
   * @param {Function} toModelBounds
   * @param {Object} options
   * @constructor
   */
  function CollectionPanel( kitCollectionList, isSingleCollectionMode, collectionAttachmentCallbacks, toModelBounds, options ) {
    var self = this;

    this.layoutNode = new VBox( { spacing: 10 } );
    this.collectionAreaHolder = new Node();
    this.collectionAreaMap = {}; // kitCollection id => node
    this.collectionAttachmentCallbacks = collectionAttachmentCallbacks;

    // Header text for panel
    var moleculeCollectionText = new Text( yourMoleculesString, {
      font: new PhetFont( {
        size: 22
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } );
    this.layoutNode.addChild( moleculeCollectionText );

    // "Collection X" with arrows
    var currentCollectionText = new Text( '', {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } );
    kitCollectionList.currentCollectionProperty.link( function() {
      currentCollectionText.text = StringUtils.fillIn( collectionPatternString, { number: kitCollectionList.currentIndex + 1 } );
    } );

    // Used to cycle through collections when a collection has bee completed.
    var collectionSwitcher = new NextPreviousNavigationNode( currentCollectionText, {
      arrowColor: BAMConstants.KIT_ARROW_BACKGROUND_ENABLED,
      arrowStrokeColor: BAMConstants.KIT_ARROW_BORDER_ENABLED,
      arrowWidth: 14,
      arrowHeight: 18,
      next: function() {
        kitCollectionList.switchToNextCollection();
      },
      previous: function() {
        kitCollectionList.switchToPreviousCollection();
      },
      createTouchAreaShape: function( shape ) {
        // square touch area
        return Shape.bounds( shape.bounds.dilated( 7 ) );
      }
    } );

    function updateSwitcher() {
      collectionSwitcher.hasNextProperty.value = kitCollectionList.hasNextCollection();
      collectionSwitcher.hasPreviousProperty.value = kitCollectionList.hasPreviousCollection();
    }

    kitCollectionList.currentCollectionProperty.link( updateSwitcher );
    kitCollectionList.addedCollectionEmitter.addListener( updateSwitcher );
    kitCollectionList.removedCollectionEmitter.addListener( updateSwitcher );
    this.layoutNode.addChild( collectionSwitcher );

    // all of the collection boxes themselves
    this.layoutNode.addChild( this.collectionAreaHolder );

    options = _.extend( {
      cornerRadius: 0
    }, options );

    Panel.call( this, this.layoutNode, options );

    // anonymous function here, so we don't create a bunch of fields
    function createCollectionNode( collection ) {
      self.collectionAreaMap[ collection.id ] = new CollectionAreaNode( collection, isSingleCollectionMode, toModelBounds );
    }

    // create nodes for all current collections
    kitCollectionList.collections.forEach( function( collection ) {
      createCollectionNode( collection );
    } );

    // if a new collection is added, create one for it
    kitCollectionList.addedCollectionEmitter.addListener( function( collection ) {
      createCollectionNode( collection );
    } );

    // use the current collection
    this.useCollection( kitCollectionList.currentCollectionProperty.value );

    kitCollectionList.currentCollectionProperty.link( function( newCollection ) {
      self.useCollection( newCollection );
    } );
  }

  buildAMolecule.register( 'CollectionPanel', CollectionPanel );
  return inherit( Panel, CollectionPanel, {

    /**
     *
     * @param {KitCollection} collection
     * @private
     */
    useCollection: function( collection ) {

      // swap out the inner collection area
      this.collectionAreaHolder.removeAllChildren();
      var collectionAreaNode = this.collectionAreaMap[ collection.id ];
      this.collectionAreaHolder.addChild( collectionAreaNode );

      // if we are hooked up, update the box locations. otherwise, listen to the canvas for when it is
      if ( this.hasCanvasAsParent() ) {
        collectionAreaNode.updateCollectionBoxLocations();
      }
      else {
        // we need to listen for this because the update needs to use canvas' global/local/view coordinate transformations
        this.collectionAttachmentCallbacks.push( function() {
          collectionAreaNode.updateCollectionBoxLocations();
        } );
      }
    },

    /**
     * Walk up the scene graph, looking to see if we are a (grand)child of a canvas
     *
     * @returns {boolean} If an ancestor is a BuildAMoleculeCanvas
     */
    hasCanvasAsParent: function() {
      var node = this; // eslint-disable-line consistent-this
      while ( node.getParent() !== null ) {
        node = node.getParent();
        if ( node instanceof ScreenView ) {
          return true;
        }
      }
      return false;
    }
  } );
} );
