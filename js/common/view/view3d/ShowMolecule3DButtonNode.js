// Copyright 2020-2022, University of Colorado Boulder

/**
 * Button responsible for showing a 3D representation of the molecule.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import ButtonNode from '../../../../../sun/js/buttons/ButtonNode.js';
import nullSoundPlayer from '../../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import buildAMolecule from '../../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../../BuildAMoleculeStrings.js';
import BAMConstants from '../../BAMConstants.js';

class ShowMolecule3DButtonNode extends RectangularPushButton {
  /**
   * @param {CompleteMolecule} completeMolecule
   * @param {function} showDialogCallback
   * @param {Object} [options]
   */
  constructor( completeMolecule, showDialogCallback, options ) {
    const content = new Text( BuildAMoleculeStrings.threeD, {
      font: new PhetFont( {
        size: 12,
        weight: 'bold'
      } ),
      fill: 'white',
      maxWidth: BAMConstants.TEXT_MAX_WIDTH / 4
    } );
    super( merge( {
      listener: () => {
        showDialogCallback( completeMolecule );
      },
      content: content,
      baseColor: 'rgb( 112, 177, 84 )',
      xMargin: 3,
      yMargin: 3,
      cursor: 'pointer',
      soundPlayer: nullSoundPlayer,
      cornerRadius: content.height > 8 ? 4 : 0,
      buttonAppearanceStrategy: content.height > 8 ? RectangularPushButton.ThreeDAppearanceStrategy : ButtonNode.FlatAppearanceStrategy
    }, options ) );
  }
}

buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );
export default ShowMolecule3DButtonNode;