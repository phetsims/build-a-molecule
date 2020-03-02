// Copyright 2013-2020, University of Colorado Boulder

/*
 * 1st screen: collection boxes only take 1 molecule, and our 1st kit collection is always the same
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Element from '../../../nitroglycerin/js/Element.js';
import buildAMoleculeStrings from '../build-a-molecule-strings.js';
import buildAMolecule from '../buildAMolecule.js';
import BAMConstants from '../common/BAMConstants.js';
import Bucket from '../common/model/Bucket.js';
import CollectionBox from '../common/model/CollectionBox.js';
import CollectionLayout from '../common/model/CollectionLayout.js';
import Kit from '../common/model/Kit.js';
import KitCollection from '../common/model/KitCollection.js';
import MoleculeList from '../common/model/MoleculeList.js';
import Property from '../../../axon/js/Property.js';
import BAMIconFactory from '../common/view/BAMIconFactory.js';
import BAMScreen from '../common/view/BAMScreen.js';
import MoleculeCollectingScreenView from '../common/view/MoleculeCollectingScreenView.js';

const titleSingleString = buildAMoleculeStrings.title.single;

class SingleScreen extends BAMScreen {
  /**
   * @constructor
   */
  constructor() {

    const options = {
      name: titleSingleString,
      backgroundColorProperty: new Property( BAMConstants.CANVAS_BACKGROUND_COLOR ),
      homeScreenIcon: BAMIconFactory.createSingleScreen()
    };

    //REVIEW: Formatting could use some changes here
    super(
      // createInitialKitCollection
      ( bounds, stepEmitter ) => {
        const kitCollection = new KitCollection();
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
          new Bucket( new Dimension2( 350, 200 ), stepEmitter, Element.O, 1 )
        ] ), { triggerCue: true } );
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
          new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 )
        ] ), { triggerCue: true } );
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 350, 200 ), stepEmitter, Element.C, 1 ),
          new Bucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 ),
          new Bucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
        ] ), { triggerCue: true } );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2O, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 1 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.N2, 1 ) );
        return kitCollection;
      },

      // CollectionLayout
      new CollectionLayout( true ), ( bounds, stepEmitter ) => {
        return BAMScreen.generateKitCollection( false, 5, stepEmitter, bounds );
      },

      // createKitCollection
      model => {
        // create the view
        return new MoleculeCollectingScreenView( model, true, () => {
          // next collection callback
          model.addCollection( BAMScreen.generateKitCollection( false, 5, model.stepEmitter, model.collectionLayout ), true );
        } );
      },

      options );
  }
}

buildAMolecule.register( 'SingleScreen', SingleScreen );
export default SingleScreen;