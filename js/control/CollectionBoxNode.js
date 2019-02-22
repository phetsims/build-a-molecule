// Copyright 2013-2017, University of Colorado Boulder

/**
 * Represents a generic collection box node which is decorated by additional header nodes (probably text describing what can be put in, what is in it,
 * etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Molecule3DNode = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DNode' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var ShowMolecule3DButtonNode = require( 'BUILD_A_MOLECULE/view/view3d/ShowMolecule3DButtonNode' );

  var moleculePadding = 5;
  var blackBoxPaddingFor3D = Constants.has3d ? 10 : 0;

  var moleculeIdThumbnailMap = {}; // maps moleculeId => Node (thumbnail view for the molecule)
  function lookupThumbnail( completeMolecule ) {
    if ( !moleculeIdThumbnailMap[ completeMolecule.moleculeId ] ) {
      var moleculeNode = new Molecule3DNode( completeMolecule, new Bounds2( 0, 0, 50, 50 ), false );
      var transformMatrix = Molecule3DNode.initialTransforms[ completeMolecule.getGeneralFormula() ];
      if ( transformMatrix ) {
        moleculeNode.transformMolecule( transformMatrix );
      }
      moleculeNode.draw();
      moleculeIdThumbnailMap[ completeMolecule.moleculeId ] = new Image( moleculeNode.canvas.toDataURL() );
    }

    // wrap the returned image in an extra node so we can transform them independently, and that takes up the proper amount of space
    var node = moleculeIdThumbnailMap[ completeMolecule.moleculeId ];
    var wrapperNode = new Rectangle( 0, 0, 50, 50 );
    wrapperNode.addChild( node );
    return wrapperNode;
  }

  function CollectionBoxNode( box, toModelBounds ) {
    Node.call( this, {} );
    var self = this;

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
      box.dropBounds = toModelBounds( self.blackBox );
    };

    if ( Constants.has3d ) {
      var show3dButton = new ShowMolecule3DButtonNode( box.moleculeType );
      show3dButton.touchArea = Shape.bounds( show3dButton.bounds.dilated( 10 ) );
      show3dButton.right = this.blackBox.right - blackBoxPaddingFor3D;
      show3dButton.centerY = this.blackBox.centerY;
      this.button3dWidth = show3dButton.width;
      var update3dVisibility = function() {
        show3dButton.visible = box.quantityProperty.value > 0;
      };
      box.addedMoleculeEmitter.addListener( update3dVisibility );
      box.removedMoleculeEmitter.addListener( update3dVisibility );
      update3dVisibility();
      this.blackBox.addChild( show3dButton );
    }
    else {
      this.button3dWidth = 0;
    }

    this.boxNode.addChild( this.blackBox );

    this.moleculeLayer = new Node();
    this.boxNode.addChild( this.moleculeLayer );

    this.updateBoxGraphics();

    box.addedMoleculeEmitter.addListener( this.addMolecule.bind( this ) );
    box.removedMoleculeEmitter.addListener( this.removeMolecule.bind( this ) );
    box.acceptedMoleculeCreationEmitter.addListener( this.blink.bind( this ) );

    // TODO: this is somewhat of an ugly way of getting the fixed layout (where the molecules don't resize). consider changing
    // kept for now since it is much easier to revert back to the old behavior

    // add invisible molecules to the molecule layer so that its size won't change later (fixes molecule positions)
    var nodes = [];
    for ( var i = 0; i < box.capacity; i++ ) {
      var node = lookupThumbnail( box.moleculeType );
      node.visible = false;
      nodes.push( node );
      this.moleculeLayer.addChild( node );
    }

    // position them like we would with the others
    this.layOutMoleculeList( nodes );

    this.centerMoleculesInBlackBox();

    this.boxNode.y = 3;
    this.addChild( this.boxNode );
  }
  buildAMolecule.register( 'CollectionBoxNode', CollectionBoxNode );

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
      var self = this;

      // headerNode.top = this.children[this.children.length-1].bottom - ( this.children.length > 1 ? 3 : 0 ); // more compact padding in general below the box node
      this.addChild( headerNode );
      // this.insertChild( this.headerCount++, headerNode );

      var centerX = this.width / 2;
      var y = 0;
      var len = this._children.length;
      for ( var i = 1; i > 0; i++ ) { // eslint-disable-line for-direction
        if ( i >= len ) {
          i = 0;
        }
        var child = this._children[ i ];
        child.centerX = centerX;
        child.top = y;
        y += child.height + 5 + ( child === self.boxNode ? 3 : -3 );
        if ( i === 0 ) {
          break;
        }
      }
      _.each( this.children, function( child ) {
      } );
    },

    addMolecule: function( molecule ) {
      this.cancelBlinksInProgress();
      this.updateBoxGraphics();

      var completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule( molecule );
      var pseudo3DNode = lookupThumbnail( completeMolecule );
      this.moleculeLayer.addChild( pseudo3DNode );
      this.moleculeNodes.push( pseudo3DNode );
      this.moleculeNodeMap[ molecule.moleculeId ] = pseudo3DNode;

      this.updateMoleculeLayout();
    },

    removeMolecule: function( molecule ) {
      this.cancelBlinksInProgress();
      this.updateBoxGraphics();

      var lastMoleculeNode = this.moleculeNodeMap[ molecule.moleculeId ];
      this.moleculeLayer.removeChild( lastMoleculeNode );
      this.moleculeNodes.splice( this.moleculeNodes.indexOf( lastMoleculeNode ), 1 ); // TODO: replace splice with remove
      delete this.moleculeNodeMap[ molecule.moleculeId ];

      this.updateMoleculeLayout();
    },

    updateMoleculeLayout: function() {
      // position molecule nodes
      this.layOutMoleculeList( this.moleculeNodes );

      // center in the black box
      if ( this.box.quantityProperty.value > 0 ) {
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
     * @returns {Bounds2} Molecule area. Excludes the area in the black box where the 3D button needs to go
     */
    getMoleculeAreaInBlackBox: function() {
      var bounds = this.blackBox.bounds;
      return bounds.withMaxX( bounds.maxX - blackBoxPaddingFor3D - this.button3dWidth ); // leave room for 3d button on RHS
    },

    centerMoleculesInBlackBox: function() {
      var moleculeArea = this.getMoleculeAreaInBlackBox();

      // for now, we scale the molecules up and down depending on their size
      this.moleculeLayer.setScaleMagnitude( 1 );
      var xScale = ( moleculeArea.width - 5 ) / this.moleculeLayer.width;
      var yScale = ( moleculeArea.height - 5 ) / this.moleculeLayer.height;
      this.moleculeLayer.setScaleMagnitude( Math.min( xScale, yScale ) );

      this.moleculeLayer.center = moleculeArea.center.minus( moleculeArea.leftTop );
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
      var self = this;

      var blinkLengthInSeconds = 1.3;

      // our delay between states
      var blinkDelayInMs = 100;

      // properties that we will use over time in our blinker
      var on = false; // on/off state
      var counts = Math.floor( blinkLengthInSeconds * 1000 / blinkDelayInMs ); // decrements to zero to stop the blinker

      this.cancelBlinksInProgress();

      function tick() {
        // precautionarily set this to null so we never cancel a timeout that has occurred
        self.blinkTimeout = null;

        // decrement and check
        counts--;
        assert && assert( counts >= 0 );

        if ( counts === 0 ) {
          // set up our normal graphics (border/background)
          self.updateBoxGraphics();

          // setTimeout not re-set
        }
        else {
          // toggle state
          on = !on;

          // draw graphics
          if ( on ) {
            self.blackBox.fill = Constants.moleculeCollectionBoxBackgroundBlink;
            self.blackBox.stroke = Constants.moleculeCollectionBoxBorderBlink;
          }
          else {
            self.blackBox.fill = Constants.moleculeCollectionBoxBackground;
            self.blackBox.stroke = Constants.moleculeCollectionBackground;
          }

          // set the blinkTimeout so it can be canceled
          self.blinkTimeout = window.setTimeout( tick, blinkDelayInMs );
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
