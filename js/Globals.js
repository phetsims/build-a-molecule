// Copyright 2016-2017, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // imports
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var GameAudioPlayerOld = require( 'VEGAS/GameAudioPlayerOld' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );

  var soundEnabledProperty = new BooleanProperty( false );

  var Globals = {
    soundEnabled: soundEnabledProperty,
    gameAudioPlayer: new GameAudioPlayerOld( soundEnabledProperty )
  };

  buildAMolecule.register( 'Globals', Globals );

  return Globals;
} );
