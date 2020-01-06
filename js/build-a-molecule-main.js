// Copyright 2013-2019, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const buildAMoleculeTitleString = require( 'string!BUILD_A_MOLECULE/build-a-molecule.title' );
  const CollectMultipleScreen = require( 'BUILD_A_MOLECULE/screens/CollectMultipleScreen' );
  const PlaygroundScreen = require( 'BUILD_A_MOLECULE/screens/PlaygroundScreen' );
  const SingleScreen = require( 'BUILD_A_MOLECULE/single/SingleScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );

  const simOptions = {
    credits: {
      //TODO (without scrolling credits, the BAM team refuses to take credit!)'
      //REVIEW: Take a first pass at credits
    },
    webgl: true
  };

  // if the flag is set on window, don't launch the sim
  SimLauncher.launch( () => {
      //Create and start the sim
      new Sim( buildAMoleculeTitleString, [
        new SingleScreen(),
        new CollectMultipleScreen(),
        new PlaygroundScreen()
      ], simOptions ).start();
    } );
} );