/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
require( [
  // used in the function call
  'JOIST/SimLauncher', 'JOIST/Sim', 'string!BAM/build-a-molecule.name',
  'BAM/screens/MakeMoleculeScreen', 'BAM/screens/CollectMultipleScreen', 'BAM/screens/LargerMoleculesScreen',

  'BAM/namespace',
  'BAM/control/CollectionPanel',

  // specified as dependencies for independent debugging (playground, etc.)
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
  'BAM/view/BAMView',
  'BAM/view/MoleculeCollectingView',
  'BAM/view/view3d/ShowMolecule3DButtonNode',
  'BAM/view/view3d/Molecule3DDialog',
  'BAM/view/view3d/Molecule3DNode',
  'BAM/view/view3d/CloseButton',
  'BAM/control/KitPanel',
  'BAM/control/CollectionPanel',
  'BAM/control/AllFilledDialogNode',
  'BAM/control/CollectionBoxNode',
  'BAM/control/SingleCollectionBoxNode',
  'BAM/control/MultipleCollectionBoxNode',
  'BAM/control/CollectionAreaNode',
  'BAM/control/CollectionPanel',

  // data
  'BAM/model/data/collectionMoleculesData',
  'BAM/model/data/otherMoleculesData',
  'BAM/model/data/structuresData',

  // why, require.js, why?
  'SCENERY_PHET/NextPreviousNavigationNode'
],
  function( SimLauncher, Sim, buildAMoleculeNameString, MakeMoleculeScreen, CollectMultipleScreen, LargerMoleculesScreen, namespace, CollectionPanel ) {
    'use strict';

    var simOptions = {
      credits: 'TODO (without scrolling credits, the BAM team refuses to take credit!)'
    };

    // Appending '?dev' to the URL will enable developer-only features.
    if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
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
