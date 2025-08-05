// Copyright 2013-2022, University of Colorado Boulder

/**
 * 2nd screen: Collection boxes take multiple molecules of the same type.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import buildAMolecule from '../buildAMolecule.js';
import BuildAMoleculeStrings from '../BuildAMoleculeStrings.js';
import BAMConstants from '../common/BAMConstants.js';
import BAMIconFactory from '../common/view/BAMIconFactory.js';
import BAMScreen from '../common/view/BAMScreen.js';
import MoleculeCollectingScreenView from '../common/view/MoleculeCollectingScreenView.js';
import MultipleModel from './model/MultipleModel.js';

class MultipleScreen extends BAMScreen {
  constructor() {
    const options = {
      name: BuildAMoleculeStrings.title.multipleStringProperty,
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR ),
      homeScreenIcon: BAMIconFactory.createMultipleScreenIcon()
    };
    super(
      () => new MultipleModel(),
      model => new MoleculeCollectingScreenView( model, false ),
      options );
  }
}

buildAMolecule.register( 'MultipleScreen', MultipleScreen );
export default MultipleScreen;