// Copyright 2020-2022, University of Colorado Boulder

/**
 * Dialog that displays a warning text. Used as a webgl fallback when webgl isn't supported.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import MultiLineText from '../../../../scenery-phet/js/MultiLineText.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, openPopup, Path } from '../../../../scenery/js/imports.js';
import exclamationTriangleSolidShape from '../../../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import Dialog from '../../../../sun/js/Dialog.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';

class WarningDialog extends Dialog {
  constructor() {

    // Message describing the lack of webgl support with a link for more information
    const warningNode = new HBox( {
      children: [
        new Path( exclamationTriangleSolidShape, {
          fill: '#E87600', // "safety orange", according to Wikipedia
          scale: 0.06
        } ),
        new MultiLineText( BuildAMoleculeStrings.warning, {
          font: new PhetFont( 16 ),
          fill: '#000',
          align: 'left',
          maxWidth: 600
        } )
      ],
      spacing: 15,
      align: 'center',
      cursor: 'pointer'
    } );
    warningNode.mouseArea = warningNode.touchArea = warningNode.localBounds;

    // If webgl is disabled, show this pop-up
    warningNode.addInputListener( {
      up: () => {
        openPopup( `https://phet.colorado.edu/webgl-disabled-page?simLocale=${phet.joist.sim.locale}` );
      }
    } );
    super( warningNode, {
      fill: 'white',
      xAlign: 'center',
      title: null,
      resize: false
    } );
  }
}

buildAMolecule.register( 'WarningDialog', WarningDialog );
export default WarningDialog;