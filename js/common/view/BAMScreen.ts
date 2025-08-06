// Copyright 2013-2021, University of Colorado Boulder

/**
 * Supertype for modules in Build a Molecule. Handles code required for all modules (bounds and the ability to switch models)
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Screen, { ScreenOptions } from '../../../../joist/js/Screen.js';
import TModel from '../../../../joist/js/TModel.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import optionize from '../../../../phet-core/js/optionize.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

type SelfOptions = {
  // No additional options for BAMScreen
};

export type BAMScreenOptions = SelfOptions & ScreenOptions;

class BAMScreen<M extends TModel, V extends ScreenView> extends Screen<M, V> {
  /**
   * @param createModel - Function to create the screen's model
   * @param createView - Function to create the screen's view
   * @param providedOptions - Screen options
   */
  public constructor( createModel: () => M, createView: ( model: M ) => V, providedOptions?: BAMScreenOptions ) {
    const options = optionize<BAMScreenOptions, SelfOptions, ScreenOptions>()( {
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR )
    }, providedOptions );
    super( createModel, createView, options );
  }
}

buildAMolecule.register( 'BAMScreen', BAMScreen );
export default BAMScreen;