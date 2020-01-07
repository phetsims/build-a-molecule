// Copyright 2020, University of Colorado Boulder

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const Color = require( 'SCENERY/util/Color' );
  const merge = require( 'PHET_CORE/merge' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Playable = require( 'TAMBO/Playable' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  //REVIEW: Could rename the string key so we don't have to disable the lint rule here?
  const threeDString = require( 'string!BUILD_A_MOLECULE/threeD' ); // eslint-disable-line string-require-statement-match

  class ShowMolecule3DButtonNode extends RectangularPushButton {
    /**
     *
     * @param {CompleteMolecule} completeMolecule
     * @param {function} showDialogCallback
     * @param {Object} options
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

  return buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );
} );
