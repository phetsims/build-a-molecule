// Copyright 2013-2017, University of Colorado Boulder

/*
 * Screen for 2nd tab. Collection boxes take multiple molecules of the same type, and start off with a different kit collection each time
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
  var titleMultipleString = require( 'string!BUILD_A_MOLECULE/title.multiple' );

  /**
   * @constructor
   */
  function CollectMultipleScreen() {
    var options = {
      name: titleMultipleString,
      homeScreenIcon: new Rectangle( 0, 0, 548, 373, { fill: 'green' } )
    };

    BAMScreen.call( this,

      // createInitialKitCollection
      function( bounds, stepEmitter ) {
        var kitCollection = new KitCollection();
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
          new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 )
        ] ) );

        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.C, 2 ),
          new Bucket( new Dimension2( 600, 200 ), stepEmitter, Element.O, 4 ),
          new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
        ] ) );
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 600, 200 ), stepEmitter, Element.H, 12 ),
          new Bucket( new Dimension2( 600, 200 ), stepEmitter, Element.O, 4 ),
          new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
        ] ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 2 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 2 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 4 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.NH3, 2 ) );
        return kitCollection;
      },

      // CollectionLayout
      new CollectionLayout(), function( bounds, stepEmitter ) {
        return BAMScreen.generateKitCollection( true, 4, stepEmitter, bounds );
      },

      // createKitCollection
      function( model ) {
        // create the view
        return new MoleculeCollectingView( model, false, function() {
          // next collection callback
          model.addCollection( BAMScreen.generateKitCollection( true, 4, model.stepEmitter, model.collectionLayout ) );
        } );
      },

      options );
  }

  buildAMolecule.register( 'CollectMultipleScreen', CollectMultipleScreen );

  inherit( BAMScreen, CollectMultipleScreen );

  return CollectMultipleScreen;
} );
