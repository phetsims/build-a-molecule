// Copyright 2013-2020, University of Colorado Boulder

/*
 * 1st screen: collection boxes only take 1 molecule, and our 1st kit collection is always the same
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
import CollectionBox from '../common/model/CollectionBox.js';
import CollectionLayout from '../common/model/CollectionLayout.js';
import Kit from '../common/model/Kit.js';
import KitCollection from '../common/model/KitCollection.js';
import MoleculeList from '../common/model/MoleculeList.js';
import BAMScreen from '../common/view/BAMScreen.js';
import MoleculeCollectingScreenView from '../common/view/MoleculeCollectingScreenView.js';
import Molecule3DNode from '../common/view/view3d/Molecule3DNode.js';

const titleSingleString = buildAMoleculeStrings.title.single;

class SingleScreen extends BAMScreen {
  /**
   * @constructor
   */
  constructor() {

    // Iconize Molecule for homescreen and nav-bar
    const moleculeNode = new Molecule3DNode( MoleculeList.H2O, new Bounds2( 0, 0, 548, 373 ), false );
    const transformMatrix = Molecule3DNode.initialTransforms[ MoleculeList.H2O.getGeneralFormula() ];
    if ( transformMatrix ) {
      moleculeNode.transformMolecule( transformMatrix );
    }
    moleculeNode.draw();
    const moleculeIcon = new Image( moleculeNode.canvas.toDataURL(), { scale: 0.85 } );
    const wrapperNode = new Rectangle( 0, 0, 548, 373, {
      fill: BAMConstants.CANVAS_BACKGROUND_COLOR
    } );
    wrapperNode.addChild( moleculeIcon );

    // Adjust the position of the molecule icons.
    moleculeIcon.center = wrapperNode.center.minusXY( 240, 140 );

    const options = {
      name: titleSingleString,
      homeScreenIcon: wrapperNode
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