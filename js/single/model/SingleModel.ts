// Copyright 2020-2021, University of Colorado Boulder

/**
 * Main model for Single Screen.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMBucket from '../../common/model/BAMBucket.js';
import BAMModel from '../../common/model/BAMModel.js';
import CollectionBox from '../../common/model/CollectionBox.js';
import CollectionLayout from '../../common/model/CollectionLayout.js';
import Kit from '../../common/model/Kit.js';
import KitCollection from '../../common/model/KitCollection.js';
import MoleculeList from '../../common/model/MoleculeList.js';

class SingleModel extends BAMModel {
  constructor() {
    const collectionLayout = new CollectionLayout( true );
    const kitCollection = new KitCollection( { enableCues: true } );
    super( kitCollection, collectionLayout, { isMultipleCollection: false } );

    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( new Dimension2( 400, 200 ), this.stepEmitter, Element.H, 2 ),
      new BAMBucket( new Dimension2( 350, 200 ), this.stepEmitter, Element.O, 1 )
    ] ), { triggerCue: true } );
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( new Dimension2( 400, 200 ), this.stepEmitter, Element.H, 2 ),
      new BAMBucket( new Dimension2( 450, 200 ), this.stepEmitter, Element.O, 2 )
    ] ), { triggerCue: true } );
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( new Dimension2( 350, 200 ), this.stepEmitter, Element.C, 1 ),
      new BAMBucket( new Dimension2( 450, 200 ), this.stepEmitter, Element.O, 2 ),
      new BAMBucket( new Dimension2( 500, 200 ), this.stepEmitter, Element.N, 2 )
    ] ), { triggerCue: true } );

    // Add the collection boxes.
    kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2O, 1 ) );
    kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 1 ) );
    kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 1 ) );
    kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 1 ) );
    kitCollection.addCollectionBox( new CollectionBox( MoleculeList.N2, 1 ) );
  }
}

buildAMolecule.register( 'SingleModel', SingleModel );
export default SingleModel;