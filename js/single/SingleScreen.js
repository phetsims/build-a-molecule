// Copyright 2013-2020, University of Colorado Boulder

/*
 * 1st screen: collection boxes only take 1 molecule, and our 1st kit collection is always the same
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const BAMScreen = require( 'BUILD_A_MOLECULE/common/view/BAMScreen' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Bucket = require( 'BUILD_A_MOLECULE/common/model/Bucket' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionBox = require( 'BUILD_A_MOLECULE/common/model/CollectionBox' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Element = require( 'NITROGLYCERIN/Element' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Kit = require( 'BUILD_A_MOLECULE/common/model/Kit' );
  const KitCollection = require( 'BUILD_A_MOLECULE/common/model/KitCollection' );
  const CollectionLayout = require( 'BUILD_A_MOLECULE/common/model/CollectionLayout' );
  const MoleculeCollectingScreenView = require( 'BUILD_A_MOLECULE/common/view/MoleculeCollectingScreenView' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/common/model/MoleculeList' );
  const Molecule3DNode = require( 'BUILD_A_MOLECULE/common/view/view3d/Molecule3DNode' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  const titleSingleString = require( 'string!BUILD_A_MOLECULE/title.single' );

  class SingleScreen extends BAMScreen {
    /**
     * @constructor
     */
    constructor() {

      // Iconize Molecule for homescreen and nav-bar
      const moleculeNode = new Molecule3DNode( MoleculeList.H2O, new Bounds2( 0, 0, 548, 373 ), false );
      const transformMatrix = Molecule3DNode.initialTransforms[ MoleculeList.H2O.getGeneralFormula() ];
      if ( transformMatrix ) {
        moleculeNode.transformMolecule( transformMatrix );
      }
      moleculeNode.draw();
      const moleculeIcon = new Image( moleculeNode.canvas.toDataURL(), { scale: .85 } );
      const wrapperNode = new Rectangle( 0, 0, 548, 373, {
        fill: BAMConstants.CANVAS_BACKGROUND_COLOR
      } );
      wrapperNode.addChild( moleculeIcon );

      // Adjust the position of the molecule icons.
      moleculeIcon.center = wrapperNode.center.minusXY( 240, 140 );

      const options = {
        name: titleSingleString,
        homeScreenIcon: wrapperNode
      };

      //REVIEW: Formatting could use some changes here
      super(
        // createInitialKitCollection
        ( bounds, stepEmitter ) => {
          const kitCollection = new KitCollection();
          kitCollection.addKit( new Kit( bounds, [
            new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
            new Bucket( new Dimension2( 350, 200 ), stepEmitter, Element.O, 1 )
          ] ), { triggerCue: true } );
          kitCollection.addKit( new Kit( bounds, [
            new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
            new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 )
          ] ), { triggerCue: true } );
          kitCollection.addKit( new Kit( bounds, [
            new Bucket( new Dimension2( 350, 200 ), stepEmitter, Element.C, 1 ),
            new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 ),
            new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
          ] ), { triggerCue: true } );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2O, 1 ) );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 1 ) );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 1 ) );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 1 ) );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.N2, 1 ) );
          return kitCollection;
        },

        // CollectionLayout
        new CollectionLayout( true ), ( bounds, stepEmitter ) => {
          return BAMScreen.generateKitCollection( false, 5, stepEmitter, bounds );
        },

        // createKitCollection
        model => {
          // create the view
          return new MoleculeCollectingScreenView( model, true, () => {
            // next collection callback
            model.addCollection( BAMScreen.generateKitCollection( false, 5, model.stepEmitter, model.collectionLayout ), true );
          } );
        },

        options );
    }
  }

  return buildAMolecule.register( 'SingleScreen', SingleScreen );
} );
