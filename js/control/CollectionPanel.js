// Copyright 2013-2015, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var BAMScreen = require( 'BUILD_A_MOLECULE/screens/BAMScreen' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Shape = require( 'KITE/Shape' );
  var CollectionAreaNode = require( 'BUILD_A_MOLECULE/control/CollectionAreaNode' );
  var CollectionList = require( 'BUILD_A_MOLECULE/model/CollectionList' );
  var LayoutBounds = require( 'BUILD_A_MOLECULE/model/LayoutBounds' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var NextPreviousNavigationNode = require( 'SCENERY_PHET/NextPreviousNavigationNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SoundToggleButton = require( 'SCENERY_PHET/buttons/SoundToggleButton' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Globals = require( 'BUILD_A_MOLECULE/Globals' );
  var PropertySet = require( 'AXON/PropertySet' );

  // strings
  var collectionYourMoleculeCollectionString = require( 'string!BUILD_A_MOLECULE/collection.yourMoleculeCollection' );
  var collectionLabelString = require( 'string!BUILD_A_MOLECULE/collection.label' );

  var containerPadding = 15;

  function CollectionPanel( collectionList, isSingleCollectionMode, collectionAttachmentCallbacks, toModelBounds ) {
    var self = this;
    Node.call( this, {} );

    var y = 0; // TODO: improve layout code using GeneralLayoutNode?

    this.layoutNode = new Node();
    this.collectionAreaHolder = new Node();
    this.backgroundHolder = new Node();
    this.collectionAreaMap = {}; // kitCollection id => node
    this.collectionAttachmentCallbacks = collectionAttachmentCallbacks;

    // move it over so the background will have padding
    this.layoutNode.setTranslation( containerPadding, containerPadding );

    // "Your Molecule Collection"
    var moleculeCollectionText = new Text( collectionYourMoleculeCollectionString, {
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
    collectionList.currentCollectionProperty.link( function() {
      currentCollectionText.text = StringUtils.format( collectionLabelString, collectionList.currentIndex + 1 );
    } );
    var collectionSwitcher = new NextPreviousNavigationNode( currentCollectionText, {
      arrowColor: Constants.kitArrowBackgroundEnabled,
      arrowStrokeColor: Constants.kitArrowBorderEnabled,
      arrowWidth: 14,
      arrowHeight: 18,
      next: function() {
        collectionList.switchToNextCollection();
      },
      previous: function() {
        collectionList.switchToPreviousCollection();
      },
      createTouchAreaShape: function( shape ) {
        // square touch area
        return Shape.bounds( shape.bounds.dilated( 7 ) );
      }
    } );

    function updateSwitcher() {
      collectionSwitcher.hasNextProperty.value = collectionList.hasNextCollection();
      collectionSwitcher.hasPreviousProperty.value = collectionList.hasPreviousCollection();
    }

    collectionList.currentCollectionProperty.link( updateSwitcher );
    collectionList.on( 'addedCollection', updateSwitcher );
    collectionList.on( 'removedCollection', updateSwitcher );
    this.layoutNode.addChild( collectionSwitcher );
    collectionSwitcher.top = y;
    y += collectionSwitcher.height + 10;

    // all of the collection boxes themselves
    this.layoutNode.addChild( this.collectionAreaHolder );
    this.collectionAreaHolder.y = y;
    y += 5; // TODO: height?

    // sound on/off
    this.soundToggleButton = new SoundToggleButton( Globals.soundEnabled );
    this.soundToggleButton.touchArea = Shape.bounds( this.soundToggleButton.bounds.dilated( 7 ) );
    this.layoutNode.addChild( this.soundToggleButton );
    this.soundToggleButton.top = y;

    // add our two layers: background and controls
    this.addChild( this.backgroundHolder );
    this.addChild( this.layoutNode );

    // anonymous function here, so we don't create a bunch of fields
    function createCollectionNode( collection ) {
      self.collectionAreaMap[ collection.id ] = new CollectionAreaNode( collection, isSingleCollectionMode, toModelBounds );
    }

    // create nodes for all current collections
    _.each( collectionList.collections, function( collection ) {
      createCollectionNode( collection );
    } );

    // if a new collection is added, create one for it
    collectionList.on( 'addedCollection', function( collection ) {
      createCollectionNode( collection );
    } );

    // use the current collection
    this.useCollection( collectionList.currentCollection );

    collectionList.currentCollectionProperty.link( function( newCollection ) {
      self.useCollection( newCollection );
    } );
  }
  buildAMolecule.register( 'CollectionPanel', CollectionPanel );

  /**
   * Used to get the panel width so that we can construct the model (and thus kit) beforehand
   *
   * @param isSingleCollectionMode Whether we are on single (1st tab) or multiple (2nd tab) mode
   * @return Width of the entire collection panel
   */
  CollectionPanel.getCollectionPanelModelWidth = function( isSingleCollectionMode ) {
    // construct a dummy collection panel and check its width
    var collection = new KitCollection();
    collection.addCollectionBox( new CollectionBox( MoleculeList.H2O, 1 ) );
    var collectionList = new CollectionList( collection, new LayoutBounds( false, 0 ), new PropertySet( {} ) );
    var collectionPanel = new CollectionPanel( collectionList, isSingleCollectionMode, [], function() { return Bounds2.NOTHING; } );

    return Constants.modelViewTransform.viewToModelDeltaX( collectionPanel.width );
  };

  return inherit( Node, CollectionPanel, {
    updateLayout: function() {
      this.soundToggleButton.top = this.collectionAreaHolder.bottom + 25;
      var centerX = this.layoutNode.width / 2;
      _.each( this.layoutNode.children, function( child ) {
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
        fill: Constants.moleculeCollectionBackground,
        stroke: Constants.moleculeCollectionBorder
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
      var fixedHeight = Constants.stageSize.height - Constants.viewPadding * 2; // we will have padding above and below

      if ( requiredHeight > fixedHeight ) {
        console.log( 'Warning: collection panel is too tall. required: ' + requiredHeight + ', but has: ' + fixedHeight );
      }

      return fixedHeight;
    }
  } );
} );
