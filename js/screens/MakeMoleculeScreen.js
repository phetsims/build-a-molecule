// Copyright 2002-2013, University of Colorado Boulder

/*
 * 1st screen: collection boxes only take 1 molecule, and our 1st kit collection is always the same
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
  
  var MakeMoleculeScreen = namespace.MakeMoleculeScreen = function MakeMoleculeScreen( collectionAreaWidth ) {
    // icon: new Image( Images.getImage( 'makeMolecule-thumbnail.png' ) ),
    BAMScreen.call( this, Strings.title_makeMolecule, new Rectangle( 0, 0, 548, 373, { fill: 'red' } ), function( bounds, clock ) {
      var kitCollection = new KitCollection();
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 400, 200 ), clock, Element.H, 2 ),
        new Bucket( new Dimension2( 350, 200 ), clock, Element.O, 1 )
      ] ) );
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 400, 200 ), clock, Element.H, 2 ),
        new Bucket( new Dimension2( 450, 200 ), clock, Element.O, 2 )
      ] ) );
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 350, 200 ), clock, Element.C, 1 ),
        new Bucket( new Dimension2( 450, 200 ), clock, Element.O, 2 ),
        new Bucket( new Dimension2( 500, 200 ), clock, Element.N, 2 )
      ] ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2O, 1 ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 1 ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 1 ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 1 ) );
      kitCollection.addCollectionBox( new CollectionBox( MoleculeList.N2, 1 ) );
      return kitCollection;
    }, new LayoutBounds( false, collectionAreaWidth ), function( bounds, clock ) {
      return BAMScreen.generateKitCollection( false, 5, clock, bounds );
    } );
  };
  
  inherit( BAMScreen, MakeMoleculeScreen );
  
  return MakeMoleculeScreen;
} );
