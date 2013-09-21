// Copyright 2002-2013, University of Colorado

/**
 * Represents a generic collection box node which is decorated by additional header nodes (probably text describing what can be put in, what is in it,
 * etc.)
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Strings = require( 'BAM/Strings' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Property = require( 'AXON/Property' );
  var ShowMolecule3DButtonNode = require( 'BAM/view/view3d/ShowMolecule3DButtonNode' );
  
  var moleculePadding = 5;
  var blackBoxPaddingFor3D = Constants.has3d ? 10 : 0;
  
  var CollectionBoxNode = namespace.CollectionBoxNode = function( box, toModelBounds ) {
    Node.call( this, {} );
    var selfNode = this;
    
    this.box = box;
    this.dialog = new Property( null ); // will reference the dialog showing a 3d model of this molecule
    this.headerCount = 0;
    this.moleculeNodes = [];
    this.moleculeNodeMap = {}; // molecule ID => node, stores nodes for each moecule
    this.blinkTimeout = null; // NOT zero, since that could be a valid timeout ID for window.setTimeout!
    this.boxNode = new Node();
    
    this.blackBox = new Rectangle( 0, 0, 160, 50, {
      fill: Constants.moleculeCollectionBoxBackground
    } );
    this.locationUpdateObserver = function() {
      box.setDropBounds( toModelBounds( selfNode.blackBox ) );
    };
    
    if ( Constants.has3d ) {
      var show3dButton = new ShowMolecule3DButtonNode( this.dialog, box.moleculeType );
      show3dButton.centerX = this.blackBox.centerX - blackBoxPaddingFor3D;
      this.button3dWidth = show3dButton.width;
      var update3dVisibility = function() {
        show3dButton.visible = box.quantity > 0;
      };
      box.on( 'addedMolecule', update3dVisibility );
      box.on( 'removedMolecule', update3dVisibility );
      update3dVisibility();
      this.blackBox.addChild( show3dButton );
    } else {
      this.button3dWidth = 0;
    }
    
    this.boxNode.addChild( this.blackBox );
    
    this.moleculeLayer = new Node();
    this.boxNode.addChild( this.moleculeLayer );
    
    this.updateBoxGraphics();
    
    box.on( 'addedMolecule', this.addMolecule.bind( this ) );
    box.on( 'removedMolecule', this.removeMolecule.bind( this ) );
    box.on( 'acceptedMoleculeCreation', this.blink.bind( this ) );

    // TODO: this is somewhat of an ugly way of getting the fixed layout (where the molecules don't resize). consider changing
    // kept for now since it is much easier to revert back to the old behavior
    
    // add invisible molecules to the molecule layer so that its size won't change later (fixes molecule positions)
    var nodes = [];
    for ( var i = 0; i < box.capacity; i++ ) {
      console.log( 'TODO: CompleteMolecule.createPseudo3DNode then enable in CollectionBoxNode' );
      // var node = box.moleculeType.createPseudo3DNode();
      // node.visible = false;
      // nodes.push( node );
      // moleculeLayer.addChild( node );
    }

    // position them like we would with the others
    this.layOutMoleculeList( nodes );

    this.centerMoleculesInBlackBox();
    
    this.boxNode.y = 3;
    this.addChild( this.boxNode );
  };

  return inherit( Node, CollectionBoxNode, {
    /**
     * Allows us to set the model position of the collection boxes according to how they are laid out
     */
    updateLocation: function() {
      this.locationUpdateObserver();
    },
    
    /*---------------------------------------------------------------------------*
    * Implementation
    *----------------------------------------------------------------------------*/
    
    addHeaderNode: function( headerNode ) {
      var selfNode = this;
      
      // headerNode.top = this.children[this.children.length-1].bottom - ( this.children.length > 1 ? 3 : 0 ); // more compact padding in general below the box node
      this.insertChild( this.headerCount++, headerNode );
      
      var centerX = this.width / 2;
      var y = 0;
      _.each( this.children, function( child ) {
        child.centerX = centerX;
        child.top = y;
        y += child.height + 5 + ( child === selfNode.boxNode ? 3 : -3 );
        console.log( child.height + ', to ' + child.top + ' with ' + child.y );
      } );
    },

    addMolecule: function( molecule ) {
      this.cancelBlinksInProgress();
      this.updateBoxGraphics();
      
      console.log( 'createPseudo3DNode, then CollectionBoxNode' );
      var pseudo3DNode = molecule.getMatchingCompleteMolecule().createPseudo3DNode();
      this.moleculeLayer.addChild( pseudo3DNode );
      this.moleculeNodes.push( pseudo3DNode );
      this.moleculeNodeMap[molecule.moleculeId] = pseudo3DNode;

      this.updateMoleculeLayout();
    },

    removeMolecule: function( molecule ) {
      this.cancelBlinksInProgress();
      this.updateBoxGraphics();

      var lastMoleculeNode = this.moleculeNodeMap.get( molecule );
      this.moleculeLayer.removeChild( lastMoleculeNode );
      this.moleculeNodes.splice( this.moleculeNodes.indexOf( lastMoleculeNode ), 1 ); // TODO: replace splice with remove
      delete this.moleculeNodeMap[molecule.moleculeId];

      this.updateMoleculeLayout();
    },

    updateMoleculeLayout: function() {
      // position molecule nodes
      this.layOutMoleculeList( this.moleculeNodes );

      // center in the black box
      if ( this.box.quantity > 0 ) {
        this.centerMoleculesInBlackBox();
      }
    },

    /**
     * Layout of molecules. Spaced horizontally with moleculePadding, and vertically centered
     *
     * @param {Array[Node]} moleculeNodes List of molecules to lay out
     */
    layOutMoleculeList: function( moleculeNodes ) {
      var maxHeight = 0;
      _.each( moleculeNodes, function( moleculeNode ) {
        maxHeight = Math.max( maxHeight, moleculeNode.height );
      } );
      var x = 0;
      _.each( moleculeNodes, function( moleculeNode ) {
        moleculeNode.setTranslation( x, ( maxHeight - moleculeNode.height ) / 2 );
        x += moleculeNode.width + moleculePadding;
      } );
    },

    /**
     * @return {Bounds2} Molecule area. Excludes the area in the black box where the 3D button needs to go
     */
    getMoleculeAreaInBlackBox: function() {
      var bounds = this.blackBox.bounds;
      return bounds.withMaxX( bounds.maxX - blackBoxPaddingFor3D - this.button3dWidth ); // leave room for 3d button on RHS
    },

    centerMoleculesInBlackBox: function() {
      var moleculeArea = this.getMoleculeAreaInBlackBox();

      // for now, we scale the molecules up and down depending on their size
      this.moleculeLayer.setScaleMagnitude( 1 );
      var xScale = ( moleculeArea.width - 25 ) / this.moleculeLayer.width;
      var yScale = ( moleculeArea.height - 25 ) / this.moleculeLayer.height;
      this.moleculeLayer.setScaleMagnitude( Math.min( xScale, yScale ) );
      
      this.moleculeLayer.center = moleculeArea.center.minus( moleculeArea.upperLeft );
    },

    updateBoxGraphics: function() {
      this.blackBox.lineWidth = 4;
      if ( this.box.isFull() ) {
        this.blackBox.stroke = Constants.moleculeCollectionBoxHighlight;
      }
      else {
        this.blackBox.stroke = Constants.moleculeCollectionBackground;
      }
    },

    /**
     * Sets up a blinking box to register that a molecule was created that can go into a box
     */
    blink: function() {
      var selfNode = this;
      
      var blinkLengthInSeconds = 1.3;

      // our delay between states
      var blinkDelayInMs = 100;
      
      // properties that we will use over time in our blinker
      var on = false; // on/off state
      var counts = Math.floor( blinkLengthInSeconds * 1000 / blinkDelayInMs ); // decrements to zero to stop the blinker

      this.cancelBlinksInProgress();
      
      function tick() {
        // precautionarily set this to null so we never cancel a timeout that has occurred
        selfNode.blinkTimeout = null;
        
        // decrement and check
        counts--;
        assert && assert( counts >= 0 );
        
        if ( counts === 0 ) {
          // set up our normal graphics (border/background)
          selfNode.updateBoxGraphics();
          
          // setTimeout not re-set
        } else {
          // toggle state
          on = !on;

          // draw graphics
          if ( on ) {
            selfNode.blackBox.fill = Constants.moleculeCollectionBoxBackgroundBlink;
            selfNode.blackBox.stroke = Constants.moleculeCollectionBoxBorderBlink;
          } else {
            selfNode.blackBox.fill = Constants.moleculeCollectionBoxBackground;
            selfNode.blackBox.stroke = Constants.moleculeCollectionBackground;
          }

          // make sure this paint happens immediately
          selfNode.blackBox.repaint();
          
          // set the blinkTimeout so it can be canceled
          selfNode.blinkTimeout = window.setTimeout( tick, blinkDelayInMs );
        }
      }
      
      this.blinkTimeout = window.setTimeout( tick, blinkDelayInMs );
    },

    cancelBlinksInProgress: function() {
      // stop any previous blinking from happening. don't want double-blinking
      if ( this.blinkTimeout !== null ) {
        window.clearTimeout( this.blinkTimeout );
        this.blinkTimeout = null;
      }
    }
  } );
} );
