// Copyright 2020, University of Colorado Boulder

/**
 * Represents a generic collection box node which is decorated by additional header nodes (probably text describing what can be put in, what is in it,
 * etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import timer from '../../../../axon/js/timer.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Shape from '../../../../kite/js/Shape.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import MoleculeList from '../model/MoleculeList.js';
import Molecule3DNode from './view3d/Molecule3DNode.js';
import ShowMolecule3DButtonNode from './view3d/ShowMolecule3DButtonNode.js';

// constants
const BLACK_BOX_PADDING = BAMConstants.HAS_3D ? 7 : 0;

class CollectionBoxNode extends VBox {
  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   * @param {Object} [options]
   */
  constructor( box, toModelBounds, showDialogCallback, options ) {
    super( options );

    // @public {CollectionBox}
    this.box = box;

    // @public {Node|Rectangle}
    this.boxNode = new Node();

    // @private {Array.<Node>}
    this.moleculeNodes = [];

    // @private {number|null} NOT zero, since that could be a valid timeout ID for window.setTimeout!
    this.blinkTimeout = null;

    // @private Molecule ID => node, stores nodes for each molecule
    this.moleculeNodeMap = {};

    // @private Maps moleculeId => Node (thumbnail view for the molecule)
    this.moleculeIdThumbnailMap = {};

    this.blackBox = new Rectangle( 0, 0, 160, 50, {
      fill: BAMConstants.MOLECULE_COLLECTION_BOX_BACKGROUND
    } );
    this.locationUpdateObserver = () => {
      box.dropBoundsProperty.set( toModelBounds( this.blackBox ) );
    };

    // Arrange button position for to trigger 3D representation
    if ( BAMConstants.HAS_3D ) {
      const show3dButton = new ShowMolecule3DButtonNode( box.moleculeType, showDialogCallback );
      show3dButton.touchArea = Shape.bounds( show3dButton.bounds.dilated( 10 ) );
      show3dButton.right = this.blackBox.right - BLACK_BOX_PADDING;
      show3dButton.centerY = this.blackBox.centerY;
      this.button3dWidth = show3dButton.width;
      const update3dVisibility = () => {
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

    // @private {Node} Layer to house molecules
    this.moleculeLayer = new Node();
    this.boxNode.addChild( this.moleculeLayer );

    // Update all the boxes cueing
    this.updateBoxGraphics();

    // Add listeners for the Collection Box
    box.addedMoleculeEmitter.addListener( this.addMolecule.bind( this ) );
    box.removedMoleculeEmitter.addListener( this.removeMolecule.bind( this ) );
    box.acceptedMoleculeCreationEmitter.addListener( this.blink.bind( this ) );

    // TODO: this is somewhat of an ugly way of getting the fixed layout (where the molecules don't resize). consider changing
    // kept for now since it is much easier to revert back to the old behavior

    // Add invisible molecules to the molecule layer so that its size won't change later (fixes molecule positions)
    const nodes = [];
    for ( let i = 0; i < box.capacity; i++ ) {
      const node = CollectionBoxNode.lookupThumbnail( box.moleculeType, this.moleculeNodeMap );
      node.visible = false;
      nodes.push( node );
      this.moleculeLayer.addChild( node );
    }

    // Position them like we would with the others
    this.layOutMoleculeList( nodes );
    this.centerMoleculesInBlackBox();
    this.boxNode.y = 3;
    this.addChild( this.boxNode );
  }


  /**
   * Allows us to set the model position of the collection boxes according to how they are laid out
   *
   * @public
   */
  updateLocation() {
    this.locationUpdateObserver();
  }

  /**
   * Add molecule to map and molecule layer. Update the layer and graphics.
   * @param {Molecule} molecule
   *
   * @public
   */
  addMolecule( molecule ) {
    this.cancelBlinksInProgress();
    this.updateBoxGraphics();

    const completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule( molecule );
    const pseudo3DNode = CollectionBoxNode.lookupThumbnail( completeMolecule, this.moleculeNodeMap );
    this.moleculeLayer.addChild( pseudo3DNode );
    this.moleculeNodes.push( pseudo3DNode );
    this.moleculeNodeMap[ molecule.moleculeId ] = pseudo3DNode;

    this.updateMoleculeLayout();
  }

  /**
   * Remove molecule to map and molecule layer. Update the layer and graphics.
   * @param {Molecule} molecule
   *
   * @public
   */
  removeMolecule( molecule ) {
    this.cancelBlinksInProgress();
    this.updateBoxGraphics();

    const lastMoleculeNode = this.moleculeNodeMap[ molecule.moleculeId ];
    this.moleculeLayer.removeChild( lastMoleculeNode );
    this.moleculeNodes.splice( this.moleculeNodes.indexOf( lastMoleculeNode ), 1 ); // TODO: replace splice with remove
    delete this.moleculeNodeMap[ molecule.moleculeId ];

    this.updateMoleculeLayout();
  }

  /**
   * Update the molecules that are within the box
   *
   * @private
   */
  updateMoleculeLayout() {

    // position molecule nodes
    this.layOutMoleculeList( this.moleculeNodes );

    // center in the black box
    if ( this.box.quantityProperty.value > 0 ) {

      // Molecule centering is adjusted for MultipleCollectionBoxNodes.
      this.centerMoleculesInBlackBox( this.box.capacity > 1 );
    }
  }

  /**
   * Layout of molecules. Spaced horizontally with moleculePadding, and vertically centered
   * @param {Array.<Node>} moleculeNodes List of molecules to lay out
   *
   * @private
   */
  layOutMoleculeList( moleculeNodes ) {
    let maxHeight = 0;
    moleculeNodes.forEach( moleculeNode => {
      maxHeight = Math.max( maxHeight, moleculeNode.height );
    } );
    let x = 0;
    moleculeNodes.forEach( moleculeNode => {
      moleculeNode.setTranslation( x, ( maxHeight - moleculeNode.height ) / 2 );
      x += moleculeNode.width;
    } );
  }

  /**
   * Return the molecule area. Excluding the area in the black box where the 3D button needs to go.
   *
   * @private
   * @returns {Bounds2}
   */
  getMoleculeAreaInBlackBox() {
    const bounds = this.blackBox.bounds;

    // leave room for 3d button on right hand side
    return bounds.withMaxX( bounds.maxX - BLACK_BOX_PADDING - this.button3dWidth );
  }

  /**
   * Center the molecules, while considering if the black box can fit multiple molecules
   * @param {Boolean} isMultipleCollectionBox
   *
   * @private
   */
  centerMoleculesInBlackBox( isMultipleCollectionBox ) {
    const moleculeArea = this.getMoleculeAreaInBlackBox();

    // for now, we scale the molecules up and down depending on their size
    isMultipleCollectionBox ? this.moleculeLayer.setScaleMagnitude( 1.23 ) : this.moleculeLayer.setScaleMagnitude( 1 );
    const xScale = ( moleculeArea.width - 5 ) / this.moleculeLayer.width;
    const yScale = ( moleculeArea.height - 5 ) / this.moleculeLayer.height;
    this.moleculeLayer.setScaleMagnitude( Math.min( xScale, yScale ) );

    // Shift the molecule center for MultipleCollectionBoxNodes
    const shiftX = isMultipleCollectionBox ? 15 : 0;
    this.moleculeLayer.center = moleculeArea.center.minus( moleculeArea.leftTop.plusXY( shiftX, 0 ) );
  }

  /**
   * Update the stroke around the collection box.
   *
   * @private
   */
  updateBoxGraphics() {
    this.blackBox.lineWidth = 4;
    if ( this.box.isFull() ) {
      this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BOX_HIGHLIGHT;
      this.box.cueVisibilityProperty.value = false;
    }
    else {
      this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BACKGROUND;
    }
  }

  /**
   * Sets up a blinking box to register that a molecule was created that can go into a box
   *
   * @private
   */
  blink() {
    const blinkLengthInSeconds = 1.3;

    // our delay between states
    const blinkDelayInMs = 100;

    // properties that we will use over time in our blinker
    let on = false; // on/off state
    let counts = Math.floor( blinkLengthInSeconds * 1000 / blinkDelayInMs ); // decrements to zero to stop the blinker

    this.cancelBlinksInProgress();

    const tick = () => {

      // precautionarily set this to null so we never cancel a timeout that has occurred
      this.blinkTimeout = null;

      // decrement and check
      counts--;
      assert && assert( counts >= 0 );

      if ( counts === 0 ) {

        // set up our normal graphics (border/background)
        this.updateBoxGraphics();

        // setTimeout not re-set
      }
      else {
        // toggle state
        on = !on;

        // draw graphics
        if ( on ) {
          this.blackBox.fill = BAMConstants.MOLECULE_COLLECTION_BOX_BACKGROUND_BLINK;
          this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BOX_BORDER_BLINK;
        }
        else {
          this.blackBox.fill = BAMConstants.MOLECULE_COLLECTION_BOX_BACKGROUND;
          this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BACKGROUND;
        }

        // set the blinkTimeout so it can be canceled
        this.blinkTimeout = timer.setTimeout( tick, blinkDelayInMs );
      }
    };
    this.blinkTimeout = timer.setTimeout( tick, blinkDelayInMs );
  }

  /**
   * Inturrupt the blinking
   *
   * @private
   */
  cancelBlinksInProgress() {

    // stop any previous blinking from happening. don't want double-blinking
    if ( this.blinkTimeout !== null ) {
      window.clearTimeout( this.blinkTimeout );
      this.blinkTimeout = null;
    }
  }

  /**
   * Search for a thumbnail that represents the completed molecule. Thumbnail is drawn using canvas.
   * @param {CompleteMolecule} completeMolecule
   * @param {object} moleculeIdThumbnailMap
   *
   * @static
   * @returns {Node}
   */
  static lookupThumbnail( completeMolecule, moleculeIdThumbnailMap ) {
    if ( !moleculeIdThumbnailMap[ completeMolecule.moleculeId ] ) {
      const moleculeNode = new Molecule3DNode( completeMolecule, new Bounds2( 0, 0, 50, 50 ), false );
      const transformMatrix = Molecule3DNode.initialTransforms[ completeMolecule.getGeneralFormula() ];
      if ( transformMatrix ) {
        moleculeNode.transformMolecule( transformMatrix );
      }
      moleculeNode.draw();
      moleculeIdThumbnailMap[ completeMolecule.moleculeId ] = new Image( moleculeNode.canvas.toDataURL() );
    }

    // wrap the returned image in an extra node so we can transform them independently, and that takes up the proper amount of space
    const node = moleculeIdThumbnailMap[ completeMolecule.moleculeId ];
    const wrapperNode = new Rectangle( 0, 0, 50, 50 );
    wrapperNode.addChild( node );
    return wrapperNode;
  }

  /**
   * Precomputation of largest collection box size
   * @param {SingleCollectionBoxNode|MultipleCollectionBoxNode} boxNode
   * @param {CollectionBox} box
   *
   * @static
   */
  static getPsuedoBoxBounds( boxNode, box ) {
    let maxBounds = Bounds2.NOTHING;

    MoleculeList.collectionBoxMolecules.forEach( molecule => {

      // fake boxes
      const boxBounds = new boxNode(
        new box( molecule, 1, { initializeAudio: false } ),
        node => {
          return node.bounds;
        },
        () => {} ).bounds;

      maxBounds = maxBounds.union( boxBounds );
    } );

    boxNode.maxWidth = maxBounds.width;
    boxNode.maxHeight = maxBounds.height;
  }
}

buildAMolecule.register( 'CollectionBoxNode', CollectionBoxNode );
export default CollectionBoxNode;