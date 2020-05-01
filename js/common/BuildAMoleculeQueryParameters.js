// Copyright 2019-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import buildAMolecule from '../buildAMolecule.js';

const BuildAMoleculeQueryParameters = QueryStringMachine.getAll( {

  // Triggers a successfully completed collection. The user just needs to fill a single box to go to next collection.
  //REVIEW: I see private:false now, documentation about why this is the correct choice would be good
  easyMode: { type: 'flag', private: false },

  // Triggers console logs for information related to created molecules, collected molecules, and split molecules
  logData: { type: 'flag' }
} );

buildAMolecule.register( 'BuildAMoleculeQueryParameters', BuildAMoleculeQueryParameters );
export default BuildAMoleculeQueryParameters;