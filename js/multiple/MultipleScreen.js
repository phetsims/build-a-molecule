// Copyright 2013-2020, University of Colorado Boulder

/**
 * Screen for 2nd tab. Collection boxes take multiple molecules of the same type, and start off with a different kit collection each time
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
import CollectionBox from '../common/model/CollectionBox.js';
import CollectionLayout from '../common/model/CollectionLayout.js';
import Kit from '../common/model/Kit.js';
import KitCollection from '../common/model/KitCollection.js';
import MoleculeList from '../common/model/MoleculeList.js';
import BAMIconFactory from '../common/view/BAMIconFactory.js';
import BAMScreen from '../common/view/BAMScreen.js';
import MoleculeCollectingScreenView from '../common/view/MoleculeCollectingScreenView.js';

//REVIEW: Can inline these now if desired
const titleMultipleString = buildAMoleculeStrings.title.multiple;

class MultipleScreen extends BAMScreen {
  constructor() {
    const options = {
      name: titleMultipleString,
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR ),
      homeScreenIcon: BAMIconFactory.createMultipleScreen()
    };

    super(
      // createInitialKitCollection
      ( bounds, stepEmitter ) => {
        const kitCollection = new KitCollection({ enableCues: true });
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( new Dimension2( 400, 200 ), stepEmitter, Element.H, 2 ),
          new BAMBucket( new Dimension2( 450, 200 ), stepEmitter, Element.O, 2 )
        ] ), { triggerCue: true } );

        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( new Dimension2( 500, 200 ), stepEmitter, Element.C, 2 ),
          new BAMBucket( new Dimension2( 600, 200 ), stepEmitter, Element.O, 4 ),
          new BAMBucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
        ] ), { triggerCue: true } );
        kitCollection.addKit( new Kit( bounds, [
          new BAMBucket( new Dimension2( 600, 200 ), stepEmitter, Element.H, 12 ),
          new BAMBucket( new Dimension2( 600, 200 ), stepEmitter, Element.O, 4 ),
          new BAMBucket( new Dimension2( 500, 200 ), stepEmitter, Element.N, 2 )
        ] ), { triggerCue: true } );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 2 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 2 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 4 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.NH3, 2 ) );
        return kitCollection;
      },

      // CollectionLayout
      //REVIEW: Confusing formatting here, two options are specified on the same line!
      new CollectionLayout( true ), ( bounds, stepEmitter ) => {
        //REVIEW: This parameter ends up being unused in general
        //REVIEW: See KitCollectionList and its unused generateKitCollection method for more info
        //REVIEW: Please remove this callback and usages of the 3rd parameter in BAMScreen
        return BAMScreen.generateKitCollection( true, 4, stepEmitter, bounds );
      },

      // createKitCollection REVIEW: What is this comment saying?
      model => {
        // create the view
        return new MoleculeCollectingScreenView( model, false, () => {
          // next collection callback
          model.addCollection( BAMScreen.generateKitCollection( true, 4, model.stepEmitter, model.collectionLayout ), true );
        } );
      },
      options );
  }
}

buildAMolecule.register( 'MultipleScreen', MultipleScreen );
export default MultipleScreen;