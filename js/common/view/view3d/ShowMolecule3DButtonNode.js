// Copyright 2020, University of Colorado Boulder

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import ButtonListener from '../../../../../scenery/js/input/ButtonListener.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import Color from '../../../../../scenery/js/util/Color.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import Playable from '../../../../../tambo/js/Playable.js';
import buildAMoleculeStrings from '../../../build-a-molecule-strings.js';
import buildAMolecule from '../../../buildAMolecule.js';
import BAMConstants from '../../BAMConstants.js';

// strings
//REVIEW: Could rename the string key so we don't have to disable the lint rule here?
const threeDString = buildAMoleculeStrings.threeD;

class ShowMolecule3DButtonNode extends RectangularPushButton {
  /**
   *
   * @param {CompleteMolecule} completeMolecule
   * @param {function} showDialogCallback
   * @param {Object} [options]
   * @constructor
   */
  constructor( completeMolecule, showDialogCallback, options ) {
    super( merge( {
      content: new Text( threeDString, {
        font: new PhetFont( {
          size: 12,
          weight: 'bold'
        } ),
        fill: 'white'
      } ),
      baseColor: new Color( 112, 177, 84 ),
      xMargin: 3,
      yMargin: 3,
      cursor: 'pointer',
      maxWidth: BAMConstants.TEXT_MAX_WIDTH / 4,
      soundPlayer: Playable.NO_SOUND
    }, options ) );

    this.addInputListener( new ButtonListener( {
      fire() {
        showDialogCallback( completeMolecule );
      }
    } ) );
  }
}

buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );
export default ShowMolecule3DButtonNode;