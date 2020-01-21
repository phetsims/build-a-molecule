// Copyright 2013-2020, University of Colorado Boulder

/*
 * Module for the 3rd tab. Shows kits below as normal, but without collection boxes. Instead, the user is presented with an option of a "3d" view
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BAMScreen = require( 'BUILD_A_MOLECULE/common/view/BAMScreen' );
  const BAMScreenView = require( 'BUILD_A_MOLECULE/common/view/BAMScreenView' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Bucket = require( 'BUILD_A_MOLECULE/common/model/Bucket' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionLayout = require( 'BUILD_A_MOLECULE/common/model/CollectionLayout' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Element = require( 'NITROGLYCERIN/Element' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Kit = require( 'BUILD_A_MOLECULE/common/model/Kit' );
  const KitCollection = require( 'BUILD_A_MOLECULE/common/model/KitCollection' );
  const Molecule3DNode = require( 'BUILD_A_MOLECULE/common/view/view3d/Molecule3DNode' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/common/model/MoleculeList' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  const titlePlaygroundString = require( 'string!BUILD_A_MOLECULE/title.playground' );

  // constants
  const BUCKET_DIMENSIONS = new Dimension2( 670, 200 );

  class PlaygroundScreen extends BAMScreen {
    constructor() {

      // Iconize Molecule for homescreen and nav-bar
      const moleculeNode = new Molecule3DNode( MoleculeList.C2H4O2, new Bounds2( 0, 0, 548, 373 ), false );
      const transformMatrix = Molecule3DNode.initialTransforms[ MoleculeList.C2H4O2.getGeneralFormula() ];
      if ( transformMatrix ) {
        moleculeNode.transformMolecule( transformMatrix );
      }
      moleculeNode.draw();
      const node = new Image( moleculeNode.canvas.toDataURL() );
      const wrapperNode = new Rectangle( 0, 0, 548, 373 );
      wrapperNode.addChild( node );

      const options = {
        name: titlePlaygroundString,
        homeScreenIcon: wrapperNode
      };

      super(
        // createInitialKitCollection
        ( bounds, stepEmitter ) => {
          const kitCollection = new KitCollection();

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
        new CollectionLayout( false ), () => {
          throw new Error( 'There are no more kit collections in the 3rd tab' );
        },

        model => {

          // create the view
          return new BAMScreenView( model );
        },

        options );
    }
  }

  return buildAMolecule.register( 'PlaygroundScreen', PlaygroundScreen );

} );
