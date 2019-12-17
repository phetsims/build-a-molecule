// Copyright 2019, University of Colorado Boulder

/**
 * Dialog that displays a warning text. Used as a webgl fallback when webgl isn't supported.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Dialog = require( 'SUN/Dialog' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const openPopup = require( 'PHET_CORE/openPopup' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const HBox = require( 'SCENERY/nodes/HBox' );

  // strings
  const warningString = require( 'string!BUILD_A_MOLECULE/warning' );

  class WarningDialog extends Dialog {
    /**
     *
     * @constructor
     */
    constructor() {

      // Message describing the lack of webgl support with a link for more information
      const warningNode = new HBox( {
        children: [
          new FontAwesomeNode( 'warning_sign', {
            fill: '#E87600', // "safety orange", according to Wikipedia
            scale: 0.8
          } ),
          new Text( warningString, {
            font: new PhetFont( 16 ),
            fill: '#000',
            maxWidth: 600
          } )
        ],
        spacing: 12,
        align: 'center',
        cursor: 'pointer'
      } );
      warningNode.mouseArea = warningNode.touchArea = warningNode.localBounds;
      warningNode.addInputListener( {
        up: () => {
          openPopup( 'http://phet.colorado.edu/webgl-disabled-page?simLocale=' + phet.joist.sim.locale );
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

  return buildAMolecule.register( 'WarningDialog', WarningDialog );

} );
