// Copyright 2013-2019, University of Colorado Boulder

/**
 * Represents a generic collection box node which is decorated by additional header nodes (probably text describing what can be put in, what is in it,
 * etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Molecule3DNode = require( 'BUILD_A_MOLECULE/common/view/view3d/Molecule3DNode' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/common/model/MoleculeList' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const ShowMolecule3DButtonNode = require( 'BUILD_A_MOLECULE/common/view/view3d/ShowMolecule3DButtonNode' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const MOLECULE_PADDING = 5;
  const BLACK_BOX_PADDING = BAMConstants.HAS_3D ? 10 : 0;

  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   * @constructor
   */
  function CollectionBoxNode( box, toModelBounds, showDialogCallback ) {
    VBox.call( this );
    const self = this;

    this.box = box;
    this.moleculeNodes = [];
    this.moleculeNodeMap = {}; // molecule ID => node, stores nodes for each moecule
    this.blinkTimeout = null; // NOT zero, since that could be a valid timeout ID for window.setTimeout!
    this.boxNode = new Node();
    this.moleculeIdThumbnailMap = {}; // maps moleculeId => Node (thumbnail view for the molecule)

    this.blackBox = new Rectangle( 0, 0, 160, 50, {
      fill: BAMConstants.MOLECULE_COLLECTION_BOX_BACKGROUND
    } );
    this.locationUpdateObserver = function() {
      box.dropBoundsProperty.set( toModelBounds( self.blackBox ) );
    };

    if ( BAMConstants.HAS_3D ) {
      const show3dButton = new ShowMolecule3DButtonNode( box.moleculeType, showDialogCallback );
      show3dButton.touchArea = Shape.bounds( show3dButton.bounds.dilated( 10 ) );
      show3dButton.right = this.blackBox.right - BLACK_BOX_PADDING;
      show3dButton.centerY = this.blackBox.centerY;
      this.button3dWidth = show3dButton.width;
      const update3dVisibility = function() {
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

    // Cue that tells the user where to drop the molecule.
    this.cueNode = new ArrowNode( 10, 0, 34, 0, {
      fill: 'blue',
      stroke: 'black',
      right: this.blackBox.left - 5,
      centerY: this.blackBox.centerY,
      tailWidth: 8,
      headWidth: 14,
      pickable: false,
      visible: box.cueVisibilityProperty.value
    } );
    box.cueVisibilityProperty.link( visible => {
      this.cueNode.visible = visible;
    } );

    // Bounds are expanded to compensate for layout including a cueNode.
    this.blackBox.localBounds = this.blackBox.localBounds.withMaxX(
      this.blackBox.localBounds.right + this.blackBox.left - this.cueNode.left
    );
    this.boxNode.addChild( this.cueNode );

    this.moleculeLayer = new Node();
    this.boxNode.addChild( this.moleculeLayer );

    this.updateBoxGraphics();


    box.addedMoleculeEmitter.addListener( this.addMolecule.bind( this ) );
    box.removedMoleculeEmitter.addListener( this.removeMolecule.bind( this ) );
    box.acceptedMoleculeCreationEmitter.addListener( this.blink.bind( this ) );

    // TODO: this is somewhat of an ugly way of getting the fixed layout (where the molecules don't resize). consider changing
    // kept for now since it is much easier to revert back to the old behavior

    // add invisible molecules to the molecule layer so that its size won't change later (fixes molecule positions)
    const nodes = [];
    for ( let i = 0; i < box.capacity; i++ ) {
      const node = this.lookupThumbnail( box.moleculeType );
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

  return inherit( VBox, CollectionBoxNode, {
    /**
     * Allows us to set the model position of the collection boxes according to how they are laid out
     */
    updateLocation: function() {
      this.locationUpdateObserver();
    },

    /**
     * @param {CompleteMolecule} completeMolecule
     * @returns {Node}
     */
    lookupThumbnail: function( completeMolecule ) {
      if ( !this.moleculeIdThumbnailMap[ completeMolecule.moleculeId ] ) {
        const moleculeNode = new Molecule3DNode( completeMolecule, new Bounds2( 0, 0, 50, 50 ), false );
        const transformMatrix = Molecule3DNode.initialTransforms[ completeMolecule.getGeneralFormula() ];
        if ( transformMatrix ) {
          moleculeNode.transformMolecule( transformMatrix );
        }
        moleculeNode.draw();
        //REVIEW: Can we factor all of this out to a static call on Molecule3DNode?
        this.moleculeIdThumbnailMap[ completeMolecule.moleculeId ] = new Image( moleculeNode.canvas.toDataURL() );
      }

      // wrap the returned image in an extra node so we can transform them independently, and that takes up the proper amount of space
      const node = this.moleculeIdThumbnailMap[ completeMolecule.moleculeId ];
      const wrapperNode = new Rectangle( 0, 0, 50, 50 );
      wrapperNode.addChild( node );
      return wrapperNode;
    },

    /*---------------------------------------------------------------------------*
     * Implementation
     *----------------------------------------------------------------------------*/

    addMolecule: function( molecule ) {
      this.cancelBlinksInProgress();
      this.updateBoxGraphics();

      const completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule( molecule );
      const pseudo3DNode = this.lookupThumbnail( completeMolecule );
      this.moleculeLayer.addChild( pseudo3DNode );
      this.moleculeNodes.push( pseudo3DNode );
      this.moleculeNodeMap[ molecule.moleculeId ] = pseudo3DNode;

      this.updateMoleculeLayout();
    },

    removeMolecule: function( molecule ) {
      this.cancelBlinksInProgress();
      this.updateBoxGraphics();
      this.box.cueVisibilityProperty.value = false;

      const lastMoleculeNode = this.moleculeNodeMap[ molecule.moleculeId ];
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
      let maxHeight = 0;
      moleculeNodes.forEach( function( moleculeNode ) {
        maxHeight = Math.max( maxHeight, moleculeNode.height );
      } );
      let x = 0;
      moleculeNodes.forEach( function( moleculeNode ) {
        moleculeNode.setTranslation( x, ( maxHeight - moleculeNode.height ) / 2 );
        x += moleculeNode.width + MOLECULE_PADDING;
      } );
    },

    /**
     * @returns {Bounds2} Molecule area. Excludes the area in the black box where the 3D button needs to go
     */
    getMoleculeAreaInBlackBox: function() {
      const bounds = this.blackBox.bounds;
      return bounds.withMaxX( bounds.maxX - BLACK_BOX_PADDING - this.button3dWidth ); // leave room for 3d button on RHS
    },

    centerMoleculesInBlackBox: function() {
      const moleculeArea = this.getMoleculeAreaInBlackBox();

      // for now, we scale the molecules up and down depending on their size
      this.moleculeLayer.setScaleMagnitude( 1 );
      const xScale = ( moleculeArea.width - 5 ) / this.moleculeLayer.width;
      const yScale = ( moleculeArea.height - 5 ) / this.moleculeLayer.height;
      this.moleculeLayer.setScaleMagnitude( Math.min( xScale, yScale ) );

      this.moleculeLayer.center = moleculeArea.center.minus( moleculeArea.leftTop );
    },

    updateBoxGraphics: function() {
      this.blackBox.lineWidth = 4;
      if ( this.box.isFull() ) {
        this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BOX_HIGHLIGHT;
        this.box.cueVisibilityProperty.value = false;
      }
      else {
        this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BACKGROUND;
      }
    },

    /**
     * Sets up a blinking box to register that a molecule was created that can go into a box
     */
    blink: function() {
      const self = this;

      const blinkLengthInSeconds = 1.3;

      // our delay between states
      const blinkDelayInMs = 100;

      // properties that we will use over time in our blinker
      let on = false; // on/off state
      let counts = Math.floor( blinkLengthInSeconds * 1000 / blinkDelayInMs ); // decrements to zero to stop the blinker

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
            self.blackBox.fill = BAMConstants.MOLECULE_COLLECTION_BOX_BACKGROUND_BLINK;
            self.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BOX_BORDER_BLINK;
          }
          else {
            self.blackBox.fill = BAMConstants.MOLECULE_COLLECTION_BOX_BACKGROUND;
            self.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BACKGROUND;
          }

          // set the blinkTimeout so it can be canceled
          self.blinkTimeout = window.setTimeout( tick, blinkDelayInMs );
        }
      }

      //REVIEW: Use timer.setTimeout (or another thing that is hooked to the simulation step)
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
