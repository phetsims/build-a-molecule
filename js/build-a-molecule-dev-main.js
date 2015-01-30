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

    // specified as dependencies for independent debugging (playground, etc.)
    'BUILD_A_MOLECULE/model/Atom2',
    'BUILD_A_MOLECULE/model/Bond',
    'BUILD_A_MOLECULE/model/Bucket',
    'BUILD_A_MOLECULE/model/MoleculeStructure',
    'BUILD_A_MOLECULE/model/Molecule',
    'BUILD_A_MOLECULE/model/Direction',
    'BUILD_A_MOLECULE/model/LewisDotModel',
    'BUILD_A_MOLECULE/model/LayoutBounds',
    'BUILD_A_MOLECULE/model/CompleteMolecule',
    'BUILD_A_MOLECULE/model/StrippedMolecule',
    'BUILD_A_MOLECULE/model/MoleculeList',
    'BUILD_A_MOLECULE/model/ElementHistogram',
    'BUILD_A_MOLECULE/model/Kit',
    'BUILD_A_MOLECULE/model/CollectionBox',
    'BUILD_A_MOLECULE/model/KitCollection',
    'BUILD_A_MOLECULE/model/CollectionList',

    // view
    'BUILD_A_MOLECULE/view/AtomNode',
    'BUILD_A_MOLECULE/view/MoleculeMetadataNode',
    'BUILD_A_MOLECULE/view/MoleculeBondNode',
    'BUILD_A_MOLECULE/view/MoleculeBondContainerNode',
    'BUILD_A_MOLECULE/view/KitView',
    'BUILD_A_MOLECULE/view/KitCollectionNode',
    'BUILD_A_MOLECULE/view/BAMView',
    'BUILD_A_MOLECULE/view/MoleculeCollectingView',
    'BUILD_A_MOLECULE/view/SliceNode',
    'BUILD_A_MOLECULE/view/view3d/ShowMolecule3DButtonNode',
    'BUILD_A_MOLECULE/view/view3d/Molecule3DDialog',
    'BUILD_A_MOLECULE/view/view3d/Molecule3DNode',
    'BUILD_A_MOLECULE/view/view3d/CloseButton',
    'BUILD_A_MOLECULE/control/KitPanel',
    'BUILD_A_MOLECULE/control/CollectionPanel',
    'BUILD_A_MOLECULE/control/AllFilledDialogNode',
    'BUILD_A_MOLECULE/control/CollectionBoxNode',
    'BUILD_A_MOLECULE/control/SingleCollectionBoxNode',
    'BUILD_A_MOLECULE/control/MultipleCollectionBoxNode',
    'BUILD_A_MOLECULE/control/CollectionAreaNode',
    'BUILD_A_MOLECULE/control/CollectionPanel',

    // data
    'BUILD_A_MOLECULE/model/data/collectionMoleculesData',
    'BUILD_A_MOLECULE/model/data/otherMoleculesData',
    'BUILD_A_MOLECULE/model/data/structuresData',

    // why, require.js, why?
    'SCENERY_PHET/NextPreviousNavigationNode'
  ],
  function( SimLauncher, Sim, buildAMoleculeNameString, MakeMoleculeScreen, CollectMultipleScreen, LargerMoleculesScreen, namespace, CollectionPanel ) {
    'use strict';

    _.extend( window, namespace );
  } );
