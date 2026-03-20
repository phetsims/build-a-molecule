// Copyright 2019-2026, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';

const BAMQueryParameters = QueryStringMachine.getAll( {

  // Triggers a successfully completed collection. The user just needs to fill a single box to go to next collection.
  easyMode: { type: 'flag', private: false },

  // Triggers console logs for information related to created molecules, collected molecules, and split molecules
  logData: { type: 'flag' }
} );

export default BAMQueryParameters;
