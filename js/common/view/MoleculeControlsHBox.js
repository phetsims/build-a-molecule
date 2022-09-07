// Copyright 2020-2022, University of Colorado Boulder

/**
 * Displays the molecule name, 3D button, and 'X' button to break apart the molecule
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../../../kite/js/imports.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { ButtonListener, HBox, Image, Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import splitBlue_png from '../../../images/splitBlue_png.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import MoleculeList from '../model/MoleculeList.js';
import ShowMolecule3DButtonNode from './view3d/ShowMolecule3DButtonNode.js';

// constants
const DILATION_FACTOR = 4 / 1.2;
const SCALE = 1.2;

class MoleculeControlsHBox extends HBox {

  /**
   * @param {Kit} kit
   * @param {Molecule} molecule
   * @param {function} showDialogCallback
   */
  constructor( kit, molecule, showDialogCallback ) {
    super( { spacing: 9 } );

    // @public {Molecule}
    this.molecule = molecule;

    // @private {function}
    this.updatePositionListener = this.updatePosition.bind( this );

    // Check if molecule data exists
    const completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule( molecule );
    if ( completeMolecule ) {

      // Label with chemical formula and common name
      const label = new Text( StringUtils.fillIn( BuildAMoleculeStrings.moleculeNamePattern, {
        display: completeMolecule.getDisplayName()
      } ), {
        font: new PhetFont( { size: 17, weight: 'bold' } ),
        maxWidth: BAMConstants.TEXT_MAX_WIDTH
      } );
      this.addChild( label );

      // @private Button that shows 3d representation of molecule
      const button3d = new ShowMolecule3DButtonNode( completeMolecule, showDialogCallback, {
        scale: SCALE
      } );
      //RREVIEW: touchArea accepts {Bounds2}, no need for Shape.bounds wrapping
      button3d.touchArea = Shape.bounds( button3d.childBounds.dilated( DILATION_FACTOR ) );
      this.addChild( button3d );
    }

    // Break-up button 'X'
    const buttonBreak = new RectangularPushButton( {
      content: new Image( splitBlue_png ),
      scale: SCALE,
      cursor: 'pointer',
      xMargin: 0, // Setting margins to zero so the 'X' image takes up the whole button view
      yMargin: 0,
      soundPlayer: nullSoundPlayer
    } );
    buttonBreak.touchArea = buttonBreak.childBounds.dilated( DILATION_FACTOR );
    buttonBreak.addInputListener( new ButtonListener( {
      fire: () => {
        kit.breakMolecule( molecule );
      }
    } ) );
    this.addChild( buttonBreak );

    molecule.atoms.forEach( atom => {
      atom.positionProperty.link( this.updatePositionListener );
    } );

    // sanity check. should update (unfortunately) a number of times above
    this.updatePosition();
  }

  /**
   * @override
   * @public
   */
  dispose() {
    const listener = this.updatePositionListener;
    if ( listener ) {
      this.molecule.atoms.forEach( atom => {
        atom.positionProperty.unlink( listener );
      } );
    }
    super.dispose();
  }

  /**
   * Update the position of the controls.
   *
   * @private
   */
  updatePosition() {
    const modelPositionBounds = this.molecule.positionBounds;
    const moleculeViewBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( modelPositionBounds );

    this.setTranslation( moleculeViewBounds.centerX - this.width / 2, // horizontally center
      moleculeViewBounds.minY - this.height - 5 ); // offset from top of molecule
  }
}

buildAMolecule.register( 'MoleculeControlsHBox', MoleculeControlsHBox );
export default MoleculeControlsHBox;