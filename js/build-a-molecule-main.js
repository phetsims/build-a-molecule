// Copyright 2013-2022, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import soundManager from '../../tambo/js/soundManager.js';
import BuildAMoleculeStrings from './BuildAMoleculeStrings.js';
import MultipleScreen from './multiple/MultipleScreen.js';
import PlaygroundScreen from './playground/PlaygroundScreen.js';
import SingleScreen from './single/SingleScreen.js';

const buildAMoleculeTitleStringProperty = BuildAMoleculeStrings[ 'build-a-molecule' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Emily B. Moore, Amy Rouinfar',
    softwareDevelopment: 'Denzell Barnett, Johnathan Olson',
    team: 'Christine Denison, Kelly Lancaster, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Logan Bray, Ethan Johnson, Liam Mulhall, Benjamin Roberts, Jacob Romero, Kathryn Woessner'
  },
  webgl: true
};

// If the flag is set on window, don't launch the sim
simLauncher.launch( () => {

  // Create and start the sim
  new Sim( buildAMoleculeTitleStringProperty, [
    new SingleScreen(),
    new MultipleScreen(),
    new PlaygroundScreen()
  ], simOptions ).start();

  soundManager.setOutputLevelForCategory( 'user-interface', 0 );
} );
