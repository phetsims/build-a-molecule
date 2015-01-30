/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
require( [
    // used in the function call
    'JOIST/SimLauncher', 'JOIST/Sim', 'string!BUILD_A_MOLECULE/build-a-molecule.name',
    'BUILD_A_MOLECULE/screens/MakeMoleculeScreen', 'BUILD_A_MOLECULE/screens/CollectMultipleScreen', 'BUILD_A_MOLECULE/screens/LargerMoleculesScreen',

    'BUILD_A_MOLECULE/namespace',
    'BUILD_A_MOLECULE/control/CollectionPanel',

    // why, require.js, why?
    'SCENERY_PHET/NextPreviousNavigationNode'
  ],
  function( SimLauncher, Sim, buildAMoleculeNameString, MakeMoleculeScreen, CollectMultipleScreen, LargerMoleculesScreen, namespace, CollectionPanel ) {
    'use strict';

    var simOptions = {
      credits: {
        //TODO (without scrolling credits, the BAM team refuses to take credit!)'
      },

      //on iPad3/iOS7 the default 'setVisible' screen switching strategy fails for this sim with an out of memory Safari crash.
      screenDisplayStrategy: 'setChildren'
    };

    // Appending '?dev' to the URL will enable developer-only features.
    if ( window.phet.phetcommon.getQueryParameter( 'dev' ) ) {
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
        new Sim( buildAMoleculeNameString, [
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
