/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
 require( [
    // used in the function call
    'JOIST/SimLauncher', 'JOIST/Sim', 'BAM/Strings', 'BAM/Images',
    'BAM/screens/MakeMoleculeScreen', 'BAM/screens/CollectMultipleScreen', 'BAM/screens/LargerMoleculesScreen',
    
    // specified as dependencies for independent debugging (playground, etc.)
    'BAM/namespace',
    'BAM/model/Atom2',
    'BAM/model/Bond',
    'BAM/model/Bucket',
    'BAM/model/MoleculeStructure',
    'BAM/model/Molecule',
    'BAM/model/Direction',
    'BAM/model/LewisDotModel',
    'BAM/model/LayoutBounds',
    'BAM/model/CompleteMolecule',
    'BAM/model/StrippedMolecule',
    'BAM/model/MoleculeList',
    'BAM/model/ElementHistogram',
    'BAM/model/Kit',
    'BAM/model/CollectionBox',
    'BAM/model/KitCollection',
    'BAM/model/CollectionList',
    
    // view
    'BAM/view/AtomNode',
    'BAM/view/MoleculeMetadataNode',
    'BAM/view/MoleculeBondNode',
    'BAM/view/MoleculeBondContainerNode',
    'BAM/view/KitView',
    'BAM/view/KitCollectionNode',
    
    // data
    'BAM/model/data/collectionMoleculesData',
    'BAM/model/data/otherMoleculesData',
    'BAM/model/data/structuresData'
  ],
  function( SimLauncher, Sim, Strings, Images,
            MakeMoleculeScreen, CollectMultipleScreen, LargerMoleculesScreen,
            namespace ) {
    'use strict';
    
    // workaround, since the needed require statement in BAM/Images causes require.js to quote:
    //           Uncaught Error: Module name "BAM/namespace" has not been loaded yet for context: _. Use require([])
    namespace.Images = Images;
    
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
      SimLauncher.launch( Images, function() {
        //Create and start the sim
        new Sim( Strings['build-a-molecule.name'], [
          // TODO: replace these with the actual panel widths
          // new MakeMoleculeScreen( CollectionPanel.getCollectionPanelModelWidth( true ) ),
          new MakeMoleculeScreen( 400 ),
          // new CollectMultipleScreen( CollectionPanel.getCollectionPanelModelWidth( false ) ),
          new CollectMultipleScreen( 400 ),
          new LargerMoleculesScreen()
        ], simOptions ).start();
      } );
    }
  } );
