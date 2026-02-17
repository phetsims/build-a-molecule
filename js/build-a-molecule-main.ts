// Copyright 2013-2025, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import soundManager from '../../tambo/js/soundManager.js';
import Tandem from '../../tandem/js/Tandem.js';
import BuildAMoleculeStrings from './BuildAMoleculeStrings.js';
import MultipleScreen from './multiple/MultipleScreen.js';
import PlaygroundScreen from './playground/PlaygroundScreen.js';
import SingleScreen from './single/SingleScreen.js';

const buildAMoleculeTitleStringProperty = BuildAMoleculeStrings[ 'build-a-molecule' ].titleStringProperty;

// If the flag is set on window, don't launch the sim
simLauncher.launch( () => {

  // Create and start the sim
  new Sim( buildAMoleculeTitleStringProperty, [
    new SingleScreen( Tandem.ROOT.createTandem( 'singleScreen' ) ),
    new MultipleScreen( Tandem.ROOT.createTandem( 'multipleScreen' ) ),
    new PlaygroundScreen( Tandem.ROOT.createTandem( 'playgroundScreen' ) )
  ], {
    credits: {
      leadDesign: 'Emily B. Moore, Amy Rouinfar',
      softwareDevelopment: 'Denzell Barnett, Johnathan Olson',
      team: 'Christine Denison, Kelly Lancaster, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Logan Bray, Ethan Johnson, Liam Mulhall, Benjamin Roberts, Jacob Romero, Kathryn Woessner'
    },
    webgl: true
  } ).start();

  soundManager.setOutputLevelForCategory( 'user-interface', 0 );
} );