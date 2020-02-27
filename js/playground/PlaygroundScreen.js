// Copyright 2013-2020, University of Colorado Boulder

/*
 * Module for the 3rd tab. Shows kits below as normal, but without collection boxes. Instead, the user is presented with an option of a "3d" view
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Element from '../../../nitroglycerin/js/Element.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import buildAMoleculeStrings from '../build-a-molecule-strings.js';
import buildAMolecule from '../buildAMolecule.js';
import BAMConstants from '../common/BAMConstants.js';
import Bucket from '../common/model/Bucket.js';
import CollectionLayout from '../common/model/CollectionLayout.js';
import Kit from '../common/model/Kit.js';
import KitCollection from '../common/model/KitCollection.js';
import MoleculeList from '../common/model/MoleculeList.js';
import BAMScreen from '../common/view/BAMScreen.js';
import BAMScreenView from '../common/view/BAMScreenView.js';
import Molecule3DNode from '../common/view/view3d/Molecule3DNode.js';

const titlePlaygroundString = buildAMoleculeStrings.title.playground;

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
    const moleculeIcon = new Image( moleculeNode.canvas.toDataURL(), { scale: 0.95 } );
    const wrapperNode = new Rectangle( 0, 0, 548, 373, {
      fill: BAMConstants.CANVAS_BACKGROUND_COLOR
    } );
    wrapperNode.addChild( moleculeIcon );
    moleculeIcon.center = wrapperNode.center.minusXY( 275, 185 );

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

buildAMolecule.register( 'PlaygroundScreen', PlaygroundScreen );
export default PlaygroundScreen;