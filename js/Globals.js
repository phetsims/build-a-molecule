// Copyright 2016-2019, University of Colorado Boulder

define( require => {
  'use strict';

  // imports
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );

  var Globals = {
    gameAudioPlayer: new GameAudioPlayer()
  };

  buildAMolecule.register( 'Globals', Globals );

  return Globals;
} );
