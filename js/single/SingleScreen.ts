// Copyright 2013-2022, University of Colorado Boulder

/**
 * 1st screen: collection boxes only take 1 molecule, and our 1st kit collection is always the same
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import buildAMolecule from '../buildAMolecule.js';
import BuildAMoleculeStrings from '../BuildAMoleculeStrings.js';
import BAMConstants from '../common/BAMConstants.js';
import BAMIconFactory from '../common/view/BAMIconFactory.js';
import BAMScreen from '../common/view/BAMScreen.js';
import MoleculeCollectingScreenView from '../common/view/MoleculeCollectingScreenView.js';
import SingleModel from './model/SingleModel.js';

class SingleScreen extends BAMScreen {
  constructor() {
    const options = {
      name: BuildAMoleculeStrings.title.singleStringProperty,
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR ),
      homeScreenIcon: BAMIconFactory.createSingleScreenIcon()
    };
    super(
      () => new SingleModel(),
      model => new MoleculeCollectingScreenView( model, true ),
      options
    );
  }
}

buildAMolecule.register( 'SingleScreen', SingleScreen );
export default SingleScreen;