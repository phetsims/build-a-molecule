// Copyright 2020, University of Colorado Boulder

/**
 * Button that refills the kit buckets with the default atoms.
 *
 * @author Denzell Barnett
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const merge = require( 'PHET_CORE/merge' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Playable = require( 'TAMBO/Playable' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );

  class RefillButton extends TextPushButton {
    /**
     * @param {string} refillString
     * @param {BooleanProperty} buttonClickedProperty
     * @param {Function} regenerateCallback
     * @param {object} options
     * @constructor
     */
    constructor( refillString, buttonListener, options ) {
      options = merge( {
        listener: buttonListener,
        baseColor: Color.ORANGE,
        soundPlayer: Playable.NO_SOUND,
        font: new PhetFont( { size: 12, weight: 'bold' } ),
        maxWidth: BAMConstants.TEXT_MAX_WIDTH
      }, options );
      super( refillString, options );
    }
  }

  return buildAMolecule.register( 'RefillButton', RefillButton );
} );
