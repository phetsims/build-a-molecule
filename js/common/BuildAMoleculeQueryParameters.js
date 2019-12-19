// Copyright 2019, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );

  const BuildAMoleculeQueryParameters = QueryStringMachine.getAll( {

    // Triggers a successfully completed collection. The user just needs to fill a single box to go to next collection.
    easyMode: { type: 'flag' }

  } );

  buildAMolecule.register( 'BuildAMoleculeQueryParameters', BuildAMoleculeQueryParameters );
  return BuildAMoleculeQueryParameters;
} );
