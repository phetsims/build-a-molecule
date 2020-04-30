// Copyright 2013-2020, University of Colorado Boulder

/**
 * Module for the 3rd tab. Shows kits below as normal, but without collection boxes. Instead, the user is presented with an option of a "3d" view
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Element from '../../../nitroglycerin/js/Element.js';
import buildAMolecule from '../buildAMolecule.js';
import buildAMoleculeStrings from '../buildAMoleculeStrings.js';
import BAMConstants from '../common/BAMConstants.js';
import BAMBucket from '../common/model/BAMBucket.js';
import CollectionLayout from '../common/model/CollectionLayout.js';
import Kit from '../common/model/Kit.js';
import KitCollection from '../common/model/KitCollection.js';
import BAMIconFactory from '../common/view/BAMIconFactory.js';
import BAMScreen from '../common/view/BAMScreen.js';
import BAMScreenView from '../common/view/BAMScreenView.js';

//REVIEW: Can inline these now if desired
const titlePlaygroundString = buildAMoleculeStrings.title.playground;

// constants
const BUCKET_DIMENSIONS = new Dimension2( 670, 200 );

class PlaygroundScreen extends BAMScreen {
  constructor() {
    const options = {
      name: titlePlaygroundString,
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR ),
      homeScreenIcon: BAMIconFactory.createPlaygroundScreen()
    };

    super(
      // createInitialKitCollection
      ( bounds, stepEmitter ) => {
        const kitCollection = new KitCollection();

        // NOTE: if kits are modified here, examine MAX_NUM_HEAVY_ATOMS in MoleculeSDFCombinedParser, as it may need to be changed

        // general kit
        kitCollection.addKit( new Kit( bounds, [
          BAMBucket.createAutoSized( stepEmitter, Element.H, 13 ),
          BAMBucket.createAutoSized( stepEmitter, Element.O, 3 ),
          BAMBucket.createAutoSized( stepEmitter, Element.C, 3 ),
          BAMBucket.createAutoSized( stepEmitter, Element.N, 3 ),
          BAMBucket.createAutoSized( stepEmitter, Element.Cl, 2 )
        ] ) );

        // organics kit
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          BAMBucket.createAutoSized( stepEmitter, Element.O, 4 ),
          BAMBucket.createAutoSized( stepEmitter, Element.C, 4 ),
          BAMBucket.createAutoSized( stepEmitter, Element.N, 4 )
        ] ) );

        // chlorine / fluorine
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          BAMBucket.createAutoSized( stepEmitter, Element.C, 4 ),
          BAMBucket.createAutoSized( stepEmitter, Element.Cl, 4 ),
          BAMBucket.createAutoSized( stepEmitter, Element.F, 4 )
        ] ) );

        // boron / silicon
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          BAMBucket.createAutoSized( stepEmitter, Element.C, 3 ),
          BAMBucket.createAutoSized( stepEmitter, Element.B, 2 ),
          BAMBucket.createAutoSized( stepEmitter, Element.Si, 2 )
        ] ) );

        // sulphur / oxygen
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          BAMBucket.createAutoSized( stepEmitter, Element.B, 1 ),
          BAMBucket.createAutoSized( stepEmitter, Element.S, 2 ),
          BAMBucket.createAutoSized( stepEmitter, Element.Si, 1 ),
          BAMBucket.createAutoSized( stepEmitter, Element.P, 1 )
        ] ) );

        // phosphorus
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          BAMBucket.createAutoSized( stepEmitter, Element.C, 4 ),
          BAMBucket.createAutoSized( stepEmitter, Element.O, 2 ),
          BAMBucket.createAutoSized( stepEmitter, Element.P, 2 )
        ] ) );

        // bromine kit?
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( BUCKET_DIMENSIONS, stepEmitter, Element.H, 21 ),
          BAMBucket.createAutoSized( stepEmitter, Element.Br, 2 ),
          BAMBucket.createAutoSized( stepEmitter, Element.N, 3 ),
          BAMBucket.createAutoSized( stepEmitter, Element.C, 3 )
        ] ) );

        return kitCollection;
      },

      // CollectionLayout
      //REVIEW: Confusing formatting here, two options are specified on the same line!
      new CollectionLayout( false ), () => {
        //REVIEW: This parameter ends up being unused in general
        //REVIEW: See KitCollectionList and its unused generateKitCollection method for more info
        //REVIEW: Please remove this callback and usages of the 3rd parameter in BAMScreen
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