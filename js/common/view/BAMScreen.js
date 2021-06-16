// Copyright 2013-2021, University of Colorado Boulder

/**
 * Supertype for modules in Build a Molecule. Handles code required for all modules (bounds and the ability to switch models)
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Screen from '../../../../joist/js/Screen.js';
import merge from '../../../../phet-core/js/merge.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

class BAMScreen extends Screen {
  /**
   * @param {function} createModel
   * @param {function} createView
   * @param {Object} [options]
   */
  constructor( createModel, createView, options ) {
    options = merge( {
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR )
    }, options );
    super( createModel, createView, options );
  }
}

buildAMolecule.register( 'BAMScreen', BAMScreen );
export default BAMScreen;