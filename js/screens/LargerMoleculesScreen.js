// Copyright 2013-2017, University of Colorado Boulder

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
  var CollectionLayout = require( 'BUILD_A_MOLECULE/model/CollectionLayout' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var titleLargerString = require( 'string!BUILD_A_MOLECULE/title.larger' );

  /**
   * @constructor
   */
  function LargerMoleculesScreen() {
    var options = {
      name: titleLargerString,
      homeScreenIcon: new Rectangle( 0, 0, 548, 373, { fill: 'blue' } )
    };

    BAMScreen.call( this,

      // createInitialKitCollection
      function( bounds, stepEmitter ) {
        var kitCollection = new KitCollection();

        // NOTE: if kits are modified here, examine MAX_NUM_HEAVY_ATOMS in MoleculeSDFCombinedParser, as it may need to be changed

        // general kit
        kitCollection.addKit( new Kit( bounds, [
          Bucket.createAutoSized( stepEmitter, Element.H, 13 ),
          Bucket.createAutoSized( stepEmitter, Element.O, 3 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 3 ),
          Bucket.createAutoSized( stepEmitter, Element.N, 3 ),
          Bucket.createAutoSized( stepEmitter, Element.Cl, 2 )
        ] ) );

        // organics kit
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 700, 200 ), stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.O, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.N, 4 )
        ] ) );

        // chlorine / fluorine
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 700, 200 ), stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.Cl, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.F, 4 )
        ] ) );

        // boron / silicon
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 700, 200 ), stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 3 ),
          Bucket.createAutoSized( stepEmitter, Element.B, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.Si, 2 )
        ] ) );

        // sulphur / oxygen
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 700, 200 ), stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.B, 1 ),
          Bucket.createAutoSized( stepEmitter, Element.S, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.Si, 1 ),
          Bucket.createAutoSized( stepEmitter, Element.P, 1 )
        ] ) );

        // phosphorus
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 700, 200 ), stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.O, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.P, 2 )
        ] ) );

        // bromine kit?
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 700, 200 ), stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.Br, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.N, 3 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 3 )
        ] ) );

        return kitCollection;
      },

      // CollectionLayout
      new CollectionLayout( true, 0 ), function() {
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
