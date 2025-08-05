// Copyright 2020-2021, University of Colorado Boulder

/**
 * Main model for Playground Screen. This screen doesn't include a collection area.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMBucket from '../../common/model/BAMBucket.js';
import BAMModel from '../../common/model/BAMModel.js';
import CollectionLayout from '../../common/model/CollectionLayout.js';
import Kit from '../../common/model/Kit.js';
import KitCollection from '../../common/model/KitCollection.js';

// constants
const BUCKET_DIMENSIONS = new Dimension2( 670, 200 );

class PlaygroundModel extends BAMModel {
  constructor() {
    const collectionLayout = new CollectionLayout( false );
    const kitCollection = new KitCollection();
    super( kitCollection, collectionLayout, { isMultipleCollection: false } );

    // NOTE: if kits are modified here, examine MAX_NUM_HEAVY_ATOMS in MoleculeSDFCombinedParser, as it may need to be changed

    // general kit
    kitCollection.addKit( new Kit( collectionLayout, [
      BAMBucket.createAutoSized( this.stepEmitter, Element.H, 13 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.O, 3 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.C, 3 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.N, 3 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.Cl, 2 )
    ] ) );

    // organics kit
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( BUCKET_DIMENSIONS, this.stepEmitter, Element.H, 21 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.O, 4 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.C, 4 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.N, 4 )
    ] ) );

    // chlorine / fluorine
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( BUCKET_DIMENSIONS, this.stepEmitter, Element.H, 21 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.C, 4 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.Cl, 4 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.F, 4 )
    ] ) );

    // boron / silicon
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( BUCKET_DIMENSIONS, this.stepEmitter, Element.H, 21 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.C, 3 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.B, 2 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.Si, 2 )
    ] ) );

    // sulphur / oxygen
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( BUCKET_DIMENSIONS, this.stepEmitter, Element.H, 21 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.B, 1 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.S, 2 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.Si, 1 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.P, 1 )
    ] ) );

    // phosphorus
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( BUCKET_DIMENSIONS, this.stepEmitter, Element.H, 21 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.C, 4 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.O, 2 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.P, 2 )
    ] ) );

    // bromine
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( BUCKET_DIMENSIONS, this.stepEmitter, Element.H, 21 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.Br, 2 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.N, 3 ),
      BAMBucket.createAutoSized( this.stepEmitter, Element.C, 3 )
    ] ) );
  }
}

buildAMolecule.register( 'PlaygroundModel', PlaygroundModel );
export default PlaygroundModel;