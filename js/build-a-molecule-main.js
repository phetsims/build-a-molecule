/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
 require( [
    // used in the function call
    'JOIST/SimLauncher', 'JOIST/Sim', 'Strings', 'Images', 'SCENERY/nodes/Rectangle',
    
    // specified as dependencies for independent debugging (playground, etc.)
    'namespace',
    'view/AtomNode',
    'model/Atom2',
    'model/Bond'
  ],
  function( SimLauncher, Sim, Strings, Images, Rectangle, namespace ) {
    'use strict';
    
    var simOptions = {
      credits: 'TODO (without scrolling credits, the BAM team refuses to take credit!)'
    };
    
    // Appending '?dev' to the URL will enable developer-only features.
    if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
      // put our development shortcuts for types and data into the global namespace
      _.extend( window, namespace );
      
      // TODO: developer features as necessary
    }
    
    // if the flag is set on window, don't launch the sim
    if ( !window.delayBuildAMoleculeLaunch ) {
      console.log( 'boo' );
      
      SimLauncher.launch( Images, function() {
        //Create and start the sim
        new Sim( Strings['build-a-molecule.name'], [
          new MakeMoleculesScreen(),
          new CollectMultipleScreen(),
          new LargerMoleculesScreen()
        ], simOptions ).start();
      } );
    }
  } );
