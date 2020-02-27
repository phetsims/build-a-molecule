// Copyright 2013-2020, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import buildAMoleculeStrings from './build-a-molecule-strings.js';
import MultipleScreen from './multiple/MultipleScreen.js';
import PlaygroundScreen from './playground/PlaygroundScreen.js';
import SingleScreen from './single/SingleScreen.js';

const buildAMoleculeTitleString = buildAMoleculeStrings[ 'build-a-molecule' ].title;

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
    new MultipleScreen(),
    new PlaygroundScreen()
  ], simOptions ).start();
} );