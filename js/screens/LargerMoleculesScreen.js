// Copyright 2002-2013, University of Colorado Boulder

/*
 * Module for the 3rd tab. Shows kits below as normal, but without collection boxes. Instead, the user is presented with an option of a "3d" view
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
define( function( require ) {
  'use strict';
  
  var Strings = require( 'BAM/Strings' );
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
  
  var LargerMoleculesScreen = namespace.LargerMoleculesScreen = function LargerMoleculesScreen() {
    // icon: new Image( Images.getImage( 'largerMolecules-thumbnail.png' ) ),
    BAMScreen.call( this, Strings.title_largerMolecules, new Rectangle( 0, 0, 548, 373, { fill: 'blue' } ), function( bounds, clock ) {
      var kitCollection = new KitCollection();

      // NOTE: if kits are modified here, examine MAX_NUM_HEAVY_ATOMS in MoleculeSDFCombinedParser, as it may need to be changed

      // general kit
      kitCollection.addKit( new Kit( bounds, [
        Bucket.createAutoSized( clock, Element.H, 13 ),
        Bucket.createAutoSized( clock, Element.O, 3 ),
        Bucket.createAutoSized( clock, Element.C, 3 ),
        Bucket.createAutoSized( clock, Element.N, 3 ),
        Bucket.createAutoSized( clock, Element.Cl, 2 )
      ] ) );

      // organics kit
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 700, 200 ), clock, Element.H, 21 ),
        Bucket.createAutoSized( clock, Element.O, 4 ),
        Bucket.createAutoSized( clock, Element.C, 4 ),
        Bucket.createAutoSized( clock, Element.N, 4 )
      ] ) );

      // chlorine / fluorine
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 700, 200 ), clock, Element.H, 21 ),
        Bucket.createAutoSized( clock, Element.C, 4 ),
        Bucket.createAutoSized( clock, Element.Cl, 4 ),
        Bucket.createAutoSized( clock, Element.F, 4 )
      ] ) );

      // boron / silicon
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 700, 200 ), clock, Element.H, 21 ),
        Bucket.createAutoSized( clock, Element.C, 3 ),
        Bucket.createAutoSized( clock, Element.B, 2 ),
        Bucket.createAutoSized( clock, Element.Si, 2 )
      ] ) );

      // sulphur / oxygen
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 700, 200 ), clock, Element.H, 21 ),
        Bucket.createAutoSized( clock, Element.B, 1 ),
        Bucket.createAutoSized( clock, Element.S, 2 ),
        Bucket.createAutoSized( clock, Element.Si, 1 ),
        Bucket.createAutoSized( clock, Element.P, 1 )
      ] ) );

      // phosphorus
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 700, 200 ), clock, Element.H, 21 ),
        Bucket.createAutoSized( clock, Element.C, 4 ),
        Bucket.createAutoSized( clock, Element.O, 2 ),
        Bucket.createAutoSized( clock, Element.P, 2 )
      ] ) );

      // bromine kit?
      kitCollection.addKit( new Kit( bounds, [
        new Bucket( new Dimension2( 700, 200 ), clock, Element.H, 21 ),
        Bucket.createAutoSized( clock, Element.Br, 2 ),
        Bucket.createAutoSized( clock, Element.N, 3 ),
        Bucket.createAutoSized( clock, Element.C, 3 )
      ] ) );

      return kitCollection;
    }, new LayoutBounds( true, 0 ), function( bounds, clock ) {
      throw new Error( 'There are no more kit collections in the 3rd tab' );
    } );
  };
  
  return LargerMoleculesScreen;
} );
