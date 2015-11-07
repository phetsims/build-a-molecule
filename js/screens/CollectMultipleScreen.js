// Copyright 2013-2015, University of Colorado Boulder

/*
 * Screen for 2nd tab. Collection boxes take multiple molecules of the same type, and start off with a different kit collection each time
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var BAMScreen = require( 'BUILD_A_MOLECULE/screens/BAMScreen' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var Kit = require( 'BUILD_A_MOLECULE/model/Kit' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var LayoutBounds = require( 'BUILD_A_MOLECULE/model/LayoutBounds' );
  var Bucket = require( 'BUILD_A_MOLECULE/model/Bucket' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var MoleculeCollectingView = require( 'BUILD_A_MOLECULE/view/MoleculeCollectingView' );

  // strings
  var titleCollectMultipleString = require( 'string!BUILD_A_MOLECULE/title.collectMultiple' );

  var CollectMultipleScreen = namespace.CollectMultipleScreen = function CollectMultipleScreen( collectionAreaWidth ) {
    BAMScreen.call( this, titleCollectMultipleString, new Rectangle( 0, 0, 548, 373, { fill: 'green' } ), function( bounds, clock ) {
      var kitCollection = new KitCollection();
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 400, 200 ), clock, Element.H, 2 ),
        new Bucket( new Dimension2( 450, 200 ), clock, Element.O, 2 )
      ] ) );

      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 500, 200 ), clock, Element.C, 2 ),
        new Bucket( new Dimension2( 600, 200 ), clock, Element.O, 4 ),
        new Bucket( new Dimension2( 500, 200 ), clock, Element.N, 2 )
      ] ) );
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 600, 200 ), clock, Element.H, 12 ),
        new Bucket( new Dimension2( 600, 200 ), clock, Element.O, 4 ),
        new Bucket( new Dimension2( 500, 200 ), clock, Element.N, 2 )
      ] ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 2 ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 2 ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 4 ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.NH3, 2 ) );
      return kitCollection;
    }, new LayoutBounds( false, collectionAreaWidth ), function( bounds, clock ) {
      return BAMScreen.generateKitCollection( true, 4, clock, bounds );
    }, function( model ) {
      // create the view
      return new MoleculeCollectingView( model, false, function() {
        // next collection callback
        model.addCollection( BAMScreen.generateKitCollection( true, 4, model.clock, model.layoutBounds ) );
      } );
    } );
  };

  inherit( BAMScreen, CollectMultipleScreen );

  return CollectMultipleScreen;
} );
