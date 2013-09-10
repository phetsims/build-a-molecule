// Copyright 2002-2013, University of Colorado Boulder

/*
 * Screen for 2nd tab. Collection boxes take multiple molecules of the same type, and start off with a different kit collection each time
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
define( function( require ) {
  'use strict';
  
  var Strings = require( 'BAM/Strings' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var BAMScreen = require( 'BAM/screens/BAMScreen' );
  var KitCollection = require( 'BAM/model/KitCollection' );
  var Kit = require( 'BAM/model/Kit' );
  var CollectionBox = require( 'BAM/model/CollectionBox' );
  var MoleculeList = require( 'BAM/model/MoleculeList' );
  var LayoutBounds = require( 'BAM/model/LayoutBounds' );
  var Bucket = require( 'BAM/model/Bucket' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  
  var CollectMultipleScreen = namespace.CollectMultipleScreen = function CollectMultipleScreen( collectionAreaWidth ) {
    // icon: new Image( Images.getImage( 'collectMultiple-thumbnail.png' ) ),
    BAMScreen.call( this, Strings.title_collectMultiple, new Rectangle( 0, 0, 548, 373, { fill: 'green' } ), function( bounds, clock ) {
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
    } );
  };
  
  inherit( BAMScreen, CollectMultipleScreen );
  
  return CollectMultipleScreen;
} );
