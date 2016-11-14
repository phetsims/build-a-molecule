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
  var CollectionPanel = require( 'BUILD_A_MOLECULE/control/CollectionPanel' );

  var simOptions = {
    credits: {
      //TODO (without scrolling credits, the BAM team refuses to take credit!)'
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phet.chipper.queryParameters.dev ) {

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