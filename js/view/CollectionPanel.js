// Copyright 2013-2019, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CollectionAreaNode = require( 'BUILD_A_MOLECULE/view/CollectionAreaNode' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var KitCollectionList = require( 'BUILD_A_MOLECULE/model/KitCollectionList' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var CollectionLayout = require( 'BUILD_A_MOLECULE/model/CollectionLayout' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var collectionPatternString = require( 'string!BUILD_A_MOLECULE/collectionPattern' );
  var yourMoleculesString = require( 'string!BUILD_A_MOLECULE/yourMolecules' );

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
      } )
    } );
    this.layoutNode.addChild( moleculeCollectionText );

    // "Collection X" with arrows
    var currentCollectionText = new Text( '', {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } )
    } );
    kitCollectionList.currentCollectionProperty.link( function() {
      currentCollectionText.text = StringUtils.fillIn( collectionPatternString, { number: kitCollectionList.currentIndex + 1 } );
    } );
    this.layoutNode.addChild( currentCollectionText );

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

  /**
   * Used to get the panel width so that we can construct the model (and thus kit) beforehand
   *
   * @param isSingleCollectionMode Whether we are on single (1st tab) or multiple (2nd tab) mode
   * @returns {number} Width of the entire collection panel
   */
  CollectionPanel.getCollectionPanelModelWidth = function( isSingleCollectionMode ) {

    // construct a dummy collection panel and check its width
    var collection = new KitCollection();
    collection.addCollectionBox( new CollectionBox( MoleculeList.H2O, 1 ) );
    var kitCollectionList = new KitCollectionList( collection, new CollectionLayout( false, 0 ), new Emitter(), function() {} );
    var collectionPanel = new CollectionPanel( kitCollectionList, isSingleCollectionMode, [], function() { return Bounds2.NOTHING; } );

    return BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelDeltaX( collectionPanel.width );
  };

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
