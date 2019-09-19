// Copyright 2013-2019, University of Colorado Boulder

/*
 * Module for the 3rd tab. Shows kits below as normal, but without collection boxes. Instead, the user is presented with an option of a "3d" view
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  const BAMScreen = require( 'BUILD_A_MOLECULE/screens/BAMScreen' );
  const BAMView = require( 'BUILD_A_MOLECULE/view/BAMView' );
  const Bucket = require( 'BUILD_A_MOLECULE/model/Bucket' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Element = require( 'NITROGLYCERIN/Element' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Kit = require( 'BUILD_A_MOLECULE/model/Kit' );
  const KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  const CollectionLayout = require( 'BUILD_A_MOLECULE/model/CollectionLayout' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  const titleLargerString = require( 'string!BUILD_A_MOLECULE/title.larger' );

  // constants
  const BUCKET_DIMENSIONS = new Dimension2( 670, 200 );

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
          new Bucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.O, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.N, 4 )
        ] ) );

        // chlorine / fluorine
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.Cl, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.F, 4 )
        ] ) );

        // boron / silicon
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 3 ),
          Bucket.createAutoSized( stepEmitter, Element.B, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.Si, 2 )
        ] ) );

        // sulphur / oxygen
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.B, 1 ),
          Bucket.createAutoSized( stepEmitter, Element.S, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.Si, 1 ),
          Bucket.createAutoSized( stepEmitter, Element.P, 1 )
        ] ) );

        // phosphorus
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 4 ),
          Bucket.createAutoSized( stepEmitter, Element.O, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.P, 2 )
        ] ) );

        // bromine kit?
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          Bucket.createAutoSized( stepEmitter, Element.Br, 2 ),
          Bucket.createAutoSized( stepEmitter, Element.N, 3 ),
          Bucket.createAutoSized( stepEmitter, Element.C, 3 )
        ] ) );

        return kitCollection;
      },

      // CollectionLayout
      new CollectionLayout(), function() {
        throw new Error( 'There are no more kit collections in the 3rd tab' );
      },

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
