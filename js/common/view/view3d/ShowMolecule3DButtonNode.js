[object Promise]

/**
 * Button responsible for showing a 3D representation of the molecule.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import Playable from '../../../../../tambo/js/Playable.js';
import buildAMolecule from '../../../buildAMolecule.js';
import buildAMoleculeStrings from '../../../buildAMoleculeStrings.js';
import BAMConstants from '../../BAMConstants.js';

class ShowMolecule3DButtonNode extends RectangularPushButton {
  /**
   * @param {CompleteMolecule} completeMolecule
   * @param {function} showDialogCallback
   * @param {Object} [options]
   */
  constructor( completeMolecule, showDialogCallback, options ) {
    super( merge( {
      listener: () => {
        showDialogCallback( completeMolecule );
      },
      content: new Text( buildAMoleculeStrings.threeD, {
        font: new PhetFont( {
          size: 12,
          weight: 'bold'
        } ),
        fill: 'white',
        maxWidth: BAMConstants.TEXT_MAX_WIDTH / 4
      } ),
      baseColor: 'rgb( 112, 177, 84 )',
      xMargin: 3,
      yMargin: 3,
      cursor: 'pointer',
      soundPlayer: Playable.NO_SOUND
    }, options ) );
  }
}

buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );
export default ShowMolecule3DButtonNode;