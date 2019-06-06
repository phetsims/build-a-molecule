// Copyright 2013-2019, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var BAMScreen = require( 'BUILD_A_MOLECULE/screens/BAMScreen' );
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
  var NextPreviousNavigationNode = require( 'SCENERY_PHET/NextPreviousNavigationNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var collectionPatternString = require( 'string!BUILD_A_MOLECULE/collectionPattern' );
  var yourMoleculesString = require( 'string!BUILD_A_MOLECULE/yourMolecules' );

  // REVIEW: BAMConstants?
  var containerPadding = 15;

  /**
   * @param {KitCollectionList} kitCollectionList
   * @param {boolean} isSingleCollectionMode
   * @param {Array.<function>} collectionAttachmentCallbacks
   * @param {Function} toModelBounds
   * @constructor
   */
  function CollectionPanel( kitCollectionList, isSingleCollectionMode, collectionAttachmentCallbacks, toModelBounds ) {
    var self = this;
    Node.call( this, {} );

    var y = 0; // TODO: improve layout code

    this.layoutNode = new Node();
    this.collectionAreaHolder = new Node();
    this.backgroundHolder = new Node();
    this.collectionAreaMap = {}; // kitCollection id => node
    this.collectionAttachmentCallbacks = collectionAttachmentCallbacks;

    // move it over so the background will have padding
    this.layoutNode.setTranslation( containerPadding, containerPadding );

    // "Your Molecule Collection"
    var moleculeCollectionText = new Text( yourMoleculesString, {
      font: new PhetFont( {
        size: 22
      } )
    } );
    this.layoutNode.addChild( moleculeCollectionText );
    moleculeCollectionText.top = 0;
    y += moleculeCollectionText.height + 5;

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
    collectionSwitcher.top = y;
    y += collectionSwitcher.height + 10;

    // all of the collection boxes themselves
    this.layoutNode.addChild( this.collectionAreaHolder );
    this.collectionAreaHolder.y = y;
    y += 5; // TODO: height?

    // add our two layers: background and controls
    this.addChild( this.backgroundHolder );
    this.addChild( this.layoutNode );

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

  return inherit( Node, CollectionPanel, {
    updateLayout: function() {
      var centerX = this.layoutNode.width / 2;
      this.layoutNode.children.forEach( function( child ) {
        child.centerX = centerX;
      } );
    },

    useCollection: function( collection ) {
      // swap out the inner collection area
      this.collectionAreaHolder.removeAllChildren();
      var collectionAreaNode = this.collectionAreaMap[ collection.id ];
      this.collectionAreaHolder.addChild( collectionAreaNode );

      this.updateLayout();

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

      /*---------------------------------------------------------------------------*
       * draw new background
       *----------------------------------------------------------------------------*/
      this.backgroundHolder.removeAllChildren();
      // TODO: this is a major performance drain! just set the bounds!
      var background = new Rectangle( 0, 0, this.getPlacementWidth(), this.getPlacementHeight(), {
        fill: BAMConstants.MOLECULE_COLLECTION_BACKGROUND,
        stroke: BAMConstants.MOLECULE_COLLECTION_BORDER
      } );
      this.backgroundHolder.addChild( background );
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
        //REVIEW: Check for ScreenView instead?
        if ( node instanceof BAMScreen ) {
          return true;
        }
      }
      return false;
    },

    getPlacementWidth: function() {
      return this.layoutNode.width + containerPadding * 2;
    },

    getPlacementHeight: function() {
      // how much height we need with proper padding
      var requiredHeight = this.layoutNode.height + containerPadding * 2;

      // how much height we will take up to fit our vertical size perfectly
      var fixedHeight = BAMConstants.STAGE_SIZE.height - BAMConstants.VIEW_PADDING * 2; // we will have padding above and below

      if ( requiredHeight > fixedHeight ) {
        console.log( 'Warning: collection panel is too tall. required: ' + requiredHeight + ', but has: ' + fixedHeight );
      }

      return fixedHeight;
    }
  } );
} );
