// Copyright 2013-2017, University of Colorado Boulder

/*
 * 1st screen: collection boxes only take 1 molecule, and our 1st kit collection is always the same
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var BAMScreen = require( 'BUILD_A_MOLECULE/screens/BAMScreen' );
  var Bucket = require( 'BUILD_A_MOLECULE/model/Bucket' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Kit = require( 'BUILD_A_MOLECULE/model/Kit' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var CollectionLayout = require( 'BUILD_A_MOLECULE/model/CollectionLayout' );
  var MoleculeCollectingView = require( 'BUILD_A_MOLECULE/view/MoleculeCollectingView' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var titleSingleString = require( 'string!BUILD_A_MOLECULE/title.single' );

  /**
   * @param {number} collectionAreaWidth
   * @constructor
   */
  function MakeMoleculeScreen( collectionAreaWidth ) {

    var options = {
      name: titleSingleString,
      homeScreenIcon: new Rectangle( 0, 0, 548, 373, { fill: 'red' } )
    };

    //REVIEW: Formatting could use some changes here
    BAMScreen.call( this,

      // createInitialKitCollection
      function( bounds, stepEmitter ) {
        var kitCollection = new KitCollection();
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
          new Bucket( new Dimension2( 350, 200 ), stepEmitter, Element.O, 1 )
        ] ) );
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
          new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 )
        ] ) );
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 350, 200 ), stepEmitter, Element.C, 1 ),
          new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 ),
          new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
        ] ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2O, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.N2, 1 ) );
        return kitCollection;
      },

      // CollectionLayout
      new CollectionLayout( false, collectionAreaWidth ), function( bounds, stepEmitter ) {
        return BAMScreen.generateKitCollection( false, 5, stepEmitter, bounds );
      },

      // createKitCollection
      function( model ) {
        // create the view
        return new MoleculeCollectingView( model, true, function() {
          // next collection callback
          model.addCollection( BAMScreen.generateKitCollection( false, 5, model.stepEmitter, model.collectionLayout ) );
        } );
      },

      options );
  }

  buildAMolecule.register( 'MakeMoleculeScreen', MakeMoleculeScreen );

  inherit( BAMScreen, MakeMoleculeScreen );

  return MakeMoleculeScreen;
} );
