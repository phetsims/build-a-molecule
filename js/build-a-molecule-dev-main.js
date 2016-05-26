// Copyright 2013-2015, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  require( 'BUILD_A_MOLECULE/screens/MakeMoleculeScreen' );
  require( 'BUILD_A_MOLECULE/screens/CollectMultipleScreen' );
  require( 'BUILD_A_MOLECULE/screens/LargerMoleculesScreen' );
  require( 'BUILD_A_MOLECULE/control/CollectionPanel' );

  // specified as dependencies for independent debugging (playground, etc.)
  require( 'BUILD_A_MOLECULE/model/Atom2' );
  require( 'BUILD_A_MOLECULE/model/Bond' );
  require( 'BUILD_A_MOLECULE/model/Bucket' );
  require( 'BUILD_A_MOLECULE/model/MoleculeStructure' );
  require( 'BUILD_A_MOLECULE/model/Molecule' );
  require( 'BUILD_A_MOLECULE/model/Direction' );
  require( 'BUILD_A_MOLECULE/model/LewisDotModel' );
  require( 'BUILD_A_MOLECULE/model/LayoutBounds' );
  require( 'BUILD_A_MOLECULE/model/CompleteMolecule' );
  require( 'BUILD_A_MOLECULE/model/StrippedMolecule' );
  require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  require( 'BUILD_A_MOLECULE/model/ElementHistogram' );
  require( 'BUILD_A_MOLECULE/model/Kit' );
  require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  require( 'BUILD_A_MOLECULE/model/KitCollection' );
  require( 'BUILD_A_MOLECULE/model/CollectionList' );

  // view
  require( 'BUILD_A_MOLECULE/view/AtomNode' );
  require( 'BUILD_A_MOLECULE/view/MoleculeMetadataNode' );
  require( 'BUILD_A_MOLECULE/view/MoleculeBondNode' );
  require( 'BUILD_A_MOLECULE/view/MoleculeBondContainerNode' );
  require( 'BUILD_A_MOLECULE/view/KitView' );
  require( 'BUILD_A_MOLECULE/view/KitCollectionNode' );
  require( 'BUILD_A_MOLECULE/view/BAMView' );
  require( 'BUILD_A_MOLECULE/view/MoleculeCollectingView' );
  require( 'BUILD_A_MOLECULE/view/SliceNode' );
  require( 'BUILD_A_MOLECULE/view/view3d/ShowMolecule3DButtonNode' );
  require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DDialog' );
  require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DNode' );
  require( 'BUILD_A_MOLECULE/view/view3d/CloseButton' );
  require( 'BUILD_A_MOLECULE/control/KitPanel' );
  require( 'BUILD_A_MOLECULE/control/CollectionPanel' );
  require( 'BUILD_A_MOLECULE/control/AllFilledDialogNode' );
  require( 'BUILD_A_MOLECULE/control/CollectionBoxNode' );
  require( 'BUILD_A_MOLECULE/control/SingleCollectionBoxNode' );
  require( 'BUILD_A_MOLECULE/control/MultipleCollectionBoxNode' );
  require( 'BUILD_A_MOLECULE/control/CollectionAreaNode' );
  require( 'BUILD_A_MOLECULE/control/CollectionPanel' );

  // data
  require( 'BUILD_A_MOLECULE/model/data/collectionMoleculesData' );
  require( 'BUILD_A_MOLECULE/model/data/otherMoleculesData' );
  require( 'BUILD_A_MOLECULE/model/data/structuresData' );
} );
