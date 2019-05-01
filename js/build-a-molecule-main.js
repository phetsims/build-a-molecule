// Copyright 2013-2017, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var buildAMoleculeTitleString = require( 'string!BUILD_A_MOLECULE/build-a-molecule.title' );
  var CollectionPanel = require( 'BUILD_A_MOLECULE/view/CollectionPanel' );
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

  //REVIEW: This can be ditched
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
        //REVIEW: Not sure what is necessary here, looks like we're computing a dynamic layout
        new MakeMoleculeScreen( CollectionPanel.getCollectionPanelModelWidth( true ) ),
        new CollectMultipleScreen( CollectionPanel.getCollectionPanelModelWidth( false ) ),
        new LargerMoleculesScreen()
      ], simOptions ).start();
    } );
  }
} );