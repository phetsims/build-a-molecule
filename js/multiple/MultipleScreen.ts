// Copyright 2013-2025, University of Colorado Boulder

/**
 * 2nd screen: Collection boxes take multiple molecules of the same type.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import buildAMolecule from '../buildAMolecule.js';
import BuildAMoleculeStrings from '../BuildAMoleculeStrings.js';
import BAMConstants from '../common/BAMConstants.js';
import BAMIconFactory from '../common/view/BAMIconFactory.js';
import BAMScreen from '../common/view/BAMScreen.js';
import MoleculeCollectingScreenView from '../common/view/MoleculeCollectingScreenView.js';
import MultipleModel from './model/MultipleModel.js';

class MultipleScreen extends BAMScreen<MultipleModel, MoleculeCollectingScreenView> {
  public constructor( tandem: Tandem ) {
    super(
      () => new MultipleModel(),
      ( model: MultipleModel ) => new MoleculeCollectingScreenView( model, false ),
      {
        name: BuildAMoleculeStrings.title.multipleStringProperty,
        backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR ),
        homeScreenIcon: BAMIconFactory.createMultipleScreenIcon(),
        tandem: tandem
      } );
  }
}

buildAMolecule.register( 'MultipleScreen', MultipleScreen );
export default MultipleScreen;