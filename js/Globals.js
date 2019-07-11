// Copyright 2016-2019, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // imports
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );

  var Globals = {
    gameAudioPlayer: new GameAudioPlayer()
  };

  buildAMolecule.register( 'Globals', Globals );

  return Globals;
} );
