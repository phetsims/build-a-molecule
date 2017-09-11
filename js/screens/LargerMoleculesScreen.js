// Copyright 2013-2015, University of Colorado Boulder

/*
 * Module for the 3rd tab. Shows kits below as normal, but without collection boxes. Instead, the user is presented with an option of a "3d" view
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var BAMScreen = require( 'BUILD_A_MOLECULE/screens/BAMScreen' );
  var BAMView = require( 'BUILD_A_MOLECULE/view/BAMView' );
  var Bucket = require( 'BUILD_A_MOLECULE/model/Bucket' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Kit = require( 'BUILD_A_MOLECULE/model/Kit' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var LayoutBounds = require( 'BUILD_A_MOLECULE/model/LayoutBounds' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var titleLargerMoleculesString = require( 'string!BUILD_A_MOLECULE/title.largerMolecules' );

  function LargerMoleculesScreen() {

    var options = {
      name: titleLargerMoleculesString,
      homeScreenIcon: new Rectangle( 0, 0, 548, 373, { fill: 'blue' } )
    };

    BAMScreen.call( this,

      // createInitialKitCollection
      function( bounds, clock ) {
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
      },

      // layoutBounds
      new LayoutBounds( true, 0 ), function( bounds, clock ) {
        throw new Error( 'There are no more kit collections in the 3rd tab' );
      },

      // createKitCollection
      function( model ) {
        // create the view
        return new BAMView( model );
      },

      options );
  }

  buildAMolecule.register( 'LargerMoleculesScreen', LargerMoleculesScreen );

  inherit( BAMScreen, LargerMoleculesScreen );

  return LargerMoleculesScreen;
} );
