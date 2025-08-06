// Copyright 2020-2021, University of Colorado Boulder

/**
 * Main model for Multiple Screen.
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

export default class MultipleModel extends BAMModel {
  public constructor() {
    const collectionLayout = new CollectionLayout( true );
    const kitCollection = new KitCollection( { enableCues: true } );
    super( kitCollection, collectionLayout, { isMultipleCollection: true } );

    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( new Dimension2( 400, 200 ), this.stepEmitter, Element.H, 2 ),
      new BAMBucket( new Dimension2( 450, 200 ), this.stepEmitter, Element.O, 2 )
    ] ), { triggerCue: true } );

    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( new Dimension2( 500, 200 ), this.stepEmitter, Element.C, 2 ),
      new BAMBucket( new Dimension2( 600, 200 ), this.stepEmitter, Element.O, 4 ),
      new BAMBucket( new Dimension2( 500, 200 ), this.stepEmitter, Element.N, 2 )
    ] ), { triggerCue: true } );
    kitCollection.addKit( new Kit( collectionLayout, [
      new BAMBucket( new Dimension2( 600, 200 ), this.stepEmitter, Element.H, 12 ),
      new BAMBucket( new Dimension2( 600, 200 ), this.stepEmitter, Element.O, 4 ),
      new BAMBucket( new Dimension2( 500, 200 ), this.stepEmitter, Element.N, 2 )
    ] ), { triggerCue: true } );
    kitCollection.addCollectionBox( new CollectionBox( ( MoleculeList as any ).CO2, 2 ) ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when MoleculeList is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    kitCollection.addCollectionBox( new CollectionBox( ( MoleculeList as any ).O2, 2 ) ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when MoleculeList is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    kitCollection.addCollectionBox( new CollectionBox( ( MoleculeList as any ).H2, 4 ) ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when MoleculeList is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    kitCollection.addCollectionBox( new CollectionBox( ( MoleculeList as any ).NH3, 2 ) ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when MoleculeList is converted, see https://github.com/phetsims/build-a-molecule/issues/245
  }
}

buildAMolecule.register( 'MultipleModel', MultipleModel );