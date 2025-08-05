// Copyright 2013-2022, University of Colorado Boulder

/**
 * 3rd screen: Shows kits below as normal, but without collection boxes.
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
import BAMScreenView from '../common/view/BAMScreenView.js';
import PlaygroundModel from './model/PlaygroundModel.js';

class PlaygroundScreen extends BAMScreen {
  constructor() {
    const options = {
      name: BuildAMoleculeStrings.title.playgroundStringProperty,
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR ),
      homeScreenIcon: BAMIconFactory.createPlaygroundScreenIcon()
    };
    super(
      () => new PlaygroundModel(),
      model => new BAMScreenView( model ),
      options
    );
  }
}

buildAMolecule.register( 'PlaygroundScreen', PlaygroundScreen );
export default PlaygroundScreen;