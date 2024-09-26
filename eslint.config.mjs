// Copyright 2024, University of Colorado Boulder

/**
 * ESlint configuration for build-a-molecule.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import simEslintConfig from '../chipper/eslint/sim.eslint.config.mjs';

export default [
  ...simEslintConfig,
  {
    languageOptions: {
      globals: {
        THREE: 'readonly'
      }
    },
    rules: {
      'phet/no-view-imported-from-model': 'off'
    }
  }
];