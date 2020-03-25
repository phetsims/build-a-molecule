// Copyright 2013-2020, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
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
    leadDesign: 'Emily B. Moore, Amy Rouinfar',
    softwareDevelopment: 'Denzell Barnett, Johnathan Olson',
    team: 'Christine Denison, Kelly Lancaster, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Logan Bray, Ethan Johnson, Liam Mulhall, Benjamin Roberts, Jacob Romero, Kathryn Woessner'
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
