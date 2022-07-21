// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a generic collection box node which is decorated by additional header nodes (probably text describing what can be put in, what is in it,
 * etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import stepTimer from '../../../../axon/js/stepTimer.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Color, Node, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import MoleculeList from '../model/MoleculeList.js';
import BAMIconFactory from './BAMIconFactory.js';
import ShowMolecule3DButtonNode from './view3d/ShowMolecule3DButtonNode.js';

// constants
const BLACK_BOX_PADDING = 7;

// {Object.<moleculeId:number, Node>} Used to map molecules to their respective thumbnails
const moleculeIdThumbnailMap = {};

class CollectionBoxNode extends VBox {
  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds - Used to update position of the collection box
   * @param {function} showDialogCallback
   * @param {Object} [options]
   */
  constructor( box, toModelBounds, showDialogCallback, options ) {
    super( { spacing: 2 } );

    // @private {CollectionBox}
    this.box = box;

    // @private {function}
    this.toModelBounds = toModelBounds;

    // @private {Node}
    this.boxNode = new Node();

    // @private {Array.<Node>}
    this.moleculeNodes = [];

    // @private {function|null} NOT zero, since that could be a valid timeout ID for stepTimer.setTimeout!
    this.blinkTimeout = null;

    // @private {Object.<moleculeId:number,Node>} stores nodes for each molecule
    this.moleculeNodeMap = {};

    // @private {Rectangle}
    this.blackBox = new Rectangle( 0, 0, 160, 50, {
      fill: Color.BLACK,
      lineWidth: 4
    } );

    // Arrange button position for to trigger 3D representation
    const show3dButton = new ShowMolecule3DButtonNode( box.moleculeType, showDialogCallback );
    show3dButton.touchArea = show3dButton.bounds.dilated( 10 );
    show3dButton.right = this.blackBox.right - BLACK_BOX_PADDING;
    show3dButton.centerY = this.blackBox.centerY;

    // @private {number}
    this.button3dWidth = show3dButton.width;
    box.quantityProperty.link( quantity => { show3dButton.visible = quantity > 0; } );
    this.blackBox.addChild( show3dButton );
    this.boxNode.addChild( this.blackBox );

    // @private {ArrowNode}Cue that tells the user where to drop the molecule.
    this.cueNode = new ArrowNode( 10, 0, 34, 0, {
      fill: 'blue',
      stroke: 'black',
      right: this.blackBox.left - 5,
      centerY: this.blackBox.centerY,
      tailWidth: 8,
      headWidth: 14,
      pickable: false
    } );

    // Cues exists for the duration of sim lifetime.
    box.cueVisibilityProperty.link( visible => {
      this.cueNode.visible = visible;
    } );

    // The black box's bounds are expanded to keep the black box symmetrical with the panel. The arrow node is
    // positioned to the right side of the centered black box.
    this.blackBox.localBounds = this.blackBox.localBounds.withMaxX(
      this.blackBox.localBounds.right + this.blackBox.left - this.cueNode.left
    );
    this.boxNode.addChild( this.cueNode );

    // @private {Node} Layer to house molecules
    this.moleculeLayer = new Node( {} );
    this.boxNode.addChild( this.moleculeLayer );

    // Toggle the box's cues
    this.updateBoxGraphics();

    // Add listeners for the Collection Box that exist for the sim lifetime.
    box.addedMoleculeEmitter.addListener( this.addMolecule.bind( this ) );
    box.removedMoleculeEmitter.addListener( this.removeMolecule.bind( this ) );
    box.acceptedMoleculeCreationEmitter.addListener( this.blink.bind( this ) );

    this.addChild( this.boxNode );
    this.mutate( options );
  }

  /**
   * Allows us to set the model position of the collection boxes according to how they are laid out
   *
   * @public
   */
  updatePosition() {
    this.box.dropBoundsProperty.set( this.toModelBounds( this.blackBox ) );
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
    const pseudo3DNode = CollectionBoxNode.lookupThumbnail( completeMolecule, moleculeIdThumbnailMap );
    this.moleculeLayer.addChild( pseudo3DNode );
    this.moleculeNodes.push( pseudo3DNode );
    this.moleculeNodeMap[ molecule.moleculeId ] = pseudo3DNode;

    this.updateMoleculeLayout();
  }

  /**
   * Remove molecule to map and molecule layer. Update the layer and graphics.
   * @param {Molecule} molecule
   *
   * @private
   */
  removeMolecule( molecule ) {
    this.cancelBlinksInProgress();
    this.updateBoxGraphics();

    const lastMoleculeNode = this.moleculeNodeMap[ molecule.moleculeId ];
    this.moleculeLayer.removeChild( lastMoleculeNode );
    _.remove( this.moleculeNodes, item => {
      return lastMoleculeNode === item ? lastMoleculeNode : null;
    } );
    this.moleculeNodeMap[ molecule.moleculeId ].detach();
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
   * @param {Array.<Rectangle>} moleculeNodes List of molecules to lay out
   *
   * @private
   */
  layOutMoleculeList( moleculeNodes ) {
    const maxHeight = _.max( moleculeNodes.map( node => node.height ) );
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
   * @param {boolean} isMultipleCollectionBox
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
          this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BOX_BORDER_BLINK;
        }
        else {
          this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BACKGROUND;
        }

        // set the blinkTimeout so it can be canceled
        this.blinkTimeout = stepTimer.setTimeout( tick, blinkDelayInMs );
      }
    };
    this.blinkTimeout = stepTimer.setTimeout( tick, blinkDelayInMs );
  }

  /**
   * Interrupt the blinking
   *
   * @private
   */
  cancelBlinksInProgress() {

    // stop any previous blinking from happening. don't want double-blinking
    if ( this.blinkTimeout !== null ) {
      stepTimer.clearTimeout( this.blinkTimeout );
      this.blinkTimeout = null;
    }
  }

  /**
   * Search for a thumbnail that represents the completed molecule. Thumbnail is drawn using canvas.
   * @param {CompleteMolecule} completeMolecule
   * @param {Object.<moleculeId:number, Node>} moleculeMap
   *
   * @private
   * @returns {Node}
   */
  static lookupThumbnail( completeMolecule, moleculeMap ) {
    const dimensionLength = 50;
    if ( !moleculeMap[ completeMolecule.moleculeId ] ) {
      moleculeMap[ completeMolecule.moleculeId ] = BAMIconFactory.createIconImage(
        completeMolecule,
        dimensionLength,
        dimensionLength,
        1,
        true
      );
    }
    // wrap the returned image in an extra node so we can transform them independently, and that takes up the proper amount of space
    return new Rectangle( 0, 0, dimensionLength, dimensionLength, { children: [ moleculeMap[ completeMolecule.moleculeId ] ] } );
  }
}

buildAMolecule.register( 'CollectionBoxNode', CollectionBoxNode );
export default CollectionBoxNode;
