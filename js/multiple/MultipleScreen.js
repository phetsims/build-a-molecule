// Copyright 2013-2020, University of Colorado Boulder

/*
 * Screen for 2nd tab. Collection boxes take multiple molecules of the same type, and start off with a different kit collection each time
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
  const Molecule3DNode = require( 'BUILD_A_MOLECULE/common/view/view3d/Molecule3DNode' );
  const MoleculeCollectingScreenView = require( 'BUILD_A_MOLECULE/common/view/MoleculeCollectingScreenView' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/common/model/MoleculeList' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  const titleMultipleString = require( 'string!BUILD_A_MOLECULE/title.multiple' );

  class MultipleScreen extends BAMScreen {
    constructor() {

      // Iconize first O2 Molecule
      const moleculeNodeOne = new Molecule3DNode( MoleculeList.O2, new Bounds2( 0, 0, 548, 373 ), false );
      const transformMatrix = Molecule3DNode.initialTransforms[ MoleculeList.O2.getGeneralFormula() ];
      if ( transformMatrix ) {
        moleculeNodeOne.transformMolecule( transformMatrix );
      }
      moleculeNodeOne.draw();
      const moleculeIconOne = new Image( moleculeNodeOne.canvas.toDataURL(), { scale: .50 } );

      // Iconize second O2 molecule
      const moleculeNodeTwo = new Molecule3DNode( MoleculeList.O2, new Bounds2( 0, 0, 548, 373 ), false );
      if ( transformMatrix ) {
        moleculeNodeTwo.transformMolecule( transformMatrix );
      }
      moleculeNodeTwo.draw();
      const moleculeIconTwo = new Image( moleculeNodeTwo.canvas.toDataURL(), { scale: .50 } );

      // Wrapper node to house molecule icons
      const wrapperNode = new Rectangle( 0, 0, 548, 373, {
        fill: BAMConstants.CANVAS_BACKGROUND_COLOR
      } );
      wrapperNode.addChild( moleculeIconOne );
      wrapperNode.addChild( moleculeIconTwo );

      // Adjust the position of the molecule icons.
      moleculeIconOne.center = wrapperNode.center.minusXY( 270, 85 );
      moleculeIconTwo.center = wrapperNode.center.minusXY( 5, 85 );
      const options = {
        name: titleMultipleString,
        homeScreenIcon: wrapperNode
      };

      super(
        // createInitialKitCollection
        ( bounds, stepEmitter ) => {
          const kitCollection = new KitCollection();
          kitCollection.addKit( new Kit( bounds, [
            new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
            new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 )
          ] ), { triggerCue: true } );

          kitCollection.addKit( new Kit( bounds, [
            new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.C, 2 ),
            new Bucket( new Dimension2( 600, 200 ), stepEmitter, Element.O, 4 ),
            new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
          ] ), { triggerCue: true } );
          kitCollection.addKit( new Kit( bounds, [
            new Bucket( new Dimension2( 600, 200 ), stepEmitter, Element.H, 12 ),
            new Bucket( new Dimension2( 600, 200 ), stepEmitter, Element.O, 4 ),
            new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
          ] ), { triggerCue: true } );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 2 ) );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 2 ) );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 4 ) );
          kitCollection.addCollectionBox( new CollectionBox( MoleculeList.NH3, 2 ) );
          return kitCollection;
        },

        // CollectionLayout
        new CollectionLayout( true ), ( bounds, stepEmitter ) => {
          return BAMScreen.generateKitCollection( true, 4, stepEmitter, bounds );
        },

        // createKitCollection
        model => {
          // create the view
          return new MoleculeCollectingScreenView( model, false, () => {
            // next collection callback
            model.addCollection( BAMScreen.generateKitCollection( true, 4, model.stepEmitter, model.collectionLayout ), true );
          } );
        },
        options );
    }
  }

  return buildAMolecule.register( 'MultipleScreen', MultipleScreen );
} );
