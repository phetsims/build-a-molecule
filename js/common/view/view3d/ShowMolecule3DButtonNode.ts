// Copyright 2020-2026, University of Colorado Boulder

/**
 * Button responsible for showing a 3D representation of the molecule.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import ButtonNode from '../../../../../sun/js/buttons/ButtonNode.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../../tambo/js/nullSoundPlayer.js';
import buildAMolecule from '../../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../../BuildAMoleculeStrings.js';
import BAMConstants from '../../BAMConstants.js';
import CompleteMolecule from '../../model/CompleteMolecule.js';

export default class ShowMolecule3DButtonNode extends RectangularPushButton {

  public constructor( completeMolecule: CompleteMolecule, showDialogCallback: ( completeMolecule: CompleteMolecule ) => void, options?: RectangularPushButtonOptions ) {
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
      cornerRadius: 4,
      buttonAppearanceStrategy: content.height > 8 ? RectangularPushButton.ThreeDAppearanceStrategy : ButtonNode.FlatAppearanceStrategy
    }, options ) );
  }
}

buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );