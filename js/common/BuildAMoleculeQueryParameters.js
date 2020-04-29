// Copyright 2019-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import buildAMolecule from '../buildAMolecule.js';

const BuildAMoleculeQueryParameters = QueryStringMachine.getAll( {

  // Triggers a successfully completed collection. The user just needs to fill a single box to go to next collection.
  easyMode: { type: 'flag', private: true },

  // Triggers console logs for information related to created molecules, collected molecules, and split molecules
  logData: { type: 'flag' },

  // Increments collections by a defined amount. This only changes the naming convention for the collections.
  // It doesn't create additional collections. Used for testing.
  //REVIEW: Recommend adding the private:true flag, so that students can't just do this to bypass things
  //REVIEW: Also seems weird how the default is 1... wouldn't that skip 1 level? Why not have the default be zero, and
  //REVIEW: have the index to number conversion add one?
  skipLevels: {
    type: 'number',
    private: true,
    isValidValue: value => ( value >= 0 ),
    defaultValue: 0
  }
} );

buildAMolecule.register( 'BuildAMoleculeQueryParameters', BuildAMoleculeQueryParameters );
export default BuildAMoleculeQueryParameters;