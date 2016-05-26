// Copyright 2013-2015, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // imports
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Property = require( 'AXON/Property' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );

  var soundEnabled = new Property( false );

  var Globals = {
    soundEnabled: soundEnabled,
    gameAudioPlayer: new GameAudioPlayer( soundEnabled )
  };

  buildAMolecule.register( 'Globals', Globals );

  return Globals;
} );
