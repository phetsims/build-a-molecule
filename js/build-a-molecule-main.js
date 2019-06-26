// Copyright 2013-2017, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var buildAMoleculeTitleString = require( 'string!BUILD_A_MOLECULE/build-a-molecule.title' );
  var CollectMultipleScreen = require( 'BUILD_A_MOLECULE/screens/CollectMultipleScreen' );
  var LargerMoleculesScreen = require( 'BUILD_A_MOLECULE/screens/LargerMoleculesScreen' );
  var MakeMoleculeScreen = require( 'BUILD_A_MOLECULE/screens/MakeMoleculeScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  var simOptions = {
    credits: {
      //TODO (without scrolling credits, the BAM team refuses to take credit!)'
      //REVIEW: Take a first pass at credits
    }
  };

  // if the flag is set on window, don't launch the sim
    SimLauncher.launch( function() {
      //Create and start the sim
      new Sim( buildAMoleculeTitleString, [
        new MakeMoleculeScreen(),
        new CollectMultipleScreen(),
        new LargerMoleculesScreen()
      ], simOptions ).start();
    } );
} );