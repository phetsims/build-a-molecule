// Copyright 2013-2015, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Sim = require( 'JOIST/Sim' );
  var buildAMoleculeTitleString = require( 'string!BUILD_A_MOLECULE/build-a-molecule.title' );
  var MakeMoleculeScreen = require( 'BUILD_A_MOLECULE/screens/MakeMoleculeScreen' );
  var CollectMultipleScreen = require( 'BUILD_A_MOLECULE/screens/CollectMultipleScreen' );
  var LargerMoleculesScreen = require( 'BUILD_A_MOLECULE/screens/LargerMoleculesScreen' );
  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var CollectionPanel = require( 'BUILD_A_MOLECULE/control/CollectionPanel' );

  var simOptions = {
    credits: {
      //TODO (without scrolling credits, the BAM team refuses to take credit!)'
    },

    //on iPad3/iOS7 the default 'setVisible' screen switching strategy fails for this sim with an out of memory Safari crash.
    screenDisplayStrategy: 'setChildren'
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phet.chipper.getQueryParameter( 'dev' ) ) {
    // put our development shortcuts for types and data into the global namespace
    _.extend( window, namespace );

    window.namespace = namespace;

    // TODO: developer features as necessary
    // var kit = sim.screens[0].model.collections[0].kits[0]
  }

  // if the flag is set on window, don't launch the sim
  if ( !window.delayBuildAMoleculeLaunch ) {
    SimLauncher.launch( function() {
      //Create and start the sim
      new Sim( buildAMoleculeTitleString, [
        // TODO: replace these with the actual panel widths
        new MakeMoleculeScreen( CollectionPanel.getCollectionPanelModelWidth( true ) ),
        // new MakeMoleculeScreen( 400 ),
        new CollectMultipleScreen( CollectionPanel.getCollectionPanelModelWidth( false ) ),
        // new CollectMultipleScreen( 400 ),
        new LargerMoleculesScreen()
      ], simOptions ).start();
    } );
  }
} );