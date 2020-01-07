// Copyright 2020, University of Colorado Boulder

/**
 * Collection molecules that need to be loaded for the 1st tab to work
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );

  const collectionMoleculesData = [
    'acetylene|C2H2|6326|full|4|3|C 2.5369 -0.25 -0.6 0 0|C 3.403 0.25 0.6 0 0,0-3|H 2.0 -0.56 -1.665 0 -1.0E-4,0-1|H 3.9399 0.56 1.665 0 1.0E-4,1-1',
    'ammonia|H3N|222|full|4|3|N 2.5369 0.155 0 0 0|H 3.0739 0.465 -0.4417 0.2906 0.8711,0-1|H 2.0 0.465 0.7256 0.6896 -0.1907,0-1|H 2.5369 -0.465 0.4875 -0.8701 0.2089,0-1',
    'borane|BH3|6331|2d|4|3|B 2.5369 0.155|H 3.0739 0.465,0-1|H 2.0 0.465,0-1|H 2.5369 -0.465,0-1',
    'carbon dioxide|CO2|280|full|3|2|O 3.732 0.5 -1.197 0 0|O 2.0 -0.5 1.197 0 0|C 2.866 0 0 0 0,0-2,1-2',
    'carbon monoxide|CO|281|full|2|1|O 3.0 0 0.5285 0 0|C 2.0 0 -0.5285 0 0,0-3',
    'chloromethane|CH3Cl|6327|full|5|4|Cl 2.0 0 0.8836 0 0|C 3.0 0 -0.8836 0 0,0-1|H 3.0 -0.62 -1.2405 -0.6985 0.76,1-1|H 3.62 0 -1.2405 1.0074 0.2249,1-1|H 3.0 0.62 -1.2406 -0.3089 -0.9849,1-1',
    'ethylene|C2H4|6325|full|6|5|C 2.0 0 -0.6672 0 0|C 3.0 0 0.6672 0 0,0-2|H 1.69 0.5369 -1.2213 -0.929 0.0708,0-1|H 1.69 -0.5369 -1.2212 0.929 -0.0708,0-1|H 3.31 -0.5369 1.2213 0.929 -0.0708,1-1|H 3.31 0.5369 1.2213 -0.929 0.0708,1-1',
    'fluoromethane|CH3F|11638|full|5|4|F 2.0 0 0.6783 0 0|C 3.0 0 -0.6783 0 0,0-1|H 3.0 -0.62 -1.0293 0.464 0.9239,1-1|H 3.62 0 -1.0293 0.5681 -0.8639,1-1|H 3.0 0.62 -1.0293 -1.0322 -0.0601,1-1',
    'formaldehyde|CH2O|712|full|4|3|O 3.403 0.56 0.6123 0 0|C 2.5369 0.06 -0.6123 0 0,0-2|H 2.0 0.37 -1.2 0.2426 -0.8998,1-1|H 2.5369 -0.56 -1.2 -0.2424 0.8998,1-1',
    'hydrogen cyanide|CHN|768|full|3|2|N 3.403 0.405 -0.58 0 0|C 2.5369 -0.095 0.58 0 0,0-3|H 2.0 -0.405 1.645 0 0,1-1',
    'hydrogen peroxide|H2O2|784|full|4|3|O 2.5369 -0.25 0.7247 0 0|O 3.403 0.25 -0.7247 0 0,0-1|H 2.0 0.06 0.8233 -0.7 -0.6676,0-1|H 3.9399 -0.06 -0.8233 -0.6175 0.7446,1-1',
    'hydrogen sulfide|H2S|402|full|3|2|S 2.5369 -0.155 0 0 0|H 3.0739 0.155 0.4855 1.2232 0.2576,0-1|H 2.0 0.155 0.8868 -0.2325 -0.9787,0-1',
    'methane|CH4|297|full|5|4|C 2.5369 0 0 0 0|H 3.0739 0.31 0.5541 0.7996 0.4965,0-1|H 2.0 -0.31 0.6833 -0.8134 -0.2536,0-1|H 2.2269 0.5369 -0.7782 -0.3735 0.6692,0-1|H 2.8469 -0.5369 -0.4593 0.3874 -0.9121,0-1',
    'molecular chlorine|Cl2|24526|full|2|1|Cl 2.0 0 -1.0061 0 0|Cl 3.0 0 1.0061 0 0,0-1',
    'molecular fluorine|F2|24524|2d|2|1|F 2.0 0|F 3.0 0,0-1',
    'molecular hydrogen|H2|783|2d|2|1|H 2.0 0|H 3.0 0,0-1',
    'molecular nitrogen|N2|947|full|2|1|N 2.0 0 -0.556 0 0|N 3.0 0 0.556 0 0,0-3',
    'molecular oxygen|O2|977|full|2|1|O 2.0 0 -0.616 0 0|O 3.0 0 0.616 0 0,0-2',
    'nitric oxide|NO|145068|2d|2|1|O 3.0 0|N 2.0 0,0-2',
    'nitrous oxide|N2O|948|full|3|2|O 3.732 0.5 1.3063 0 0|N 2.866 0 -0.1096 0 0,0-1|N 2.0 -0.5 -1.1967 0 0,1-3',
    'ozone|O3|24823|full|3|2|O 2.866 -0.25 -0.095 -0.4943 0|O 2.0 0.25 1.1489 0.2152 0,0-1|O 3.732 0.25 -1.054 0.2791 0,0-2',
    'phosphine|H3P|24404|full|4|3|P 2.5369 0.155 0 0 0|H 3.0739 0.465 -0.6323 0.513 1.1573,0-1|H 2.0 0.465 1.2032 0.7159 0.2052,0-1|H 2.5369 -0.465 0.461 -1.1757 0.6383,0-1',
    'silane|H4Si|23953|full|5|4|Si 2.5369 0 0 0 0|H 3.0739 0.31 0.9385 0.9654 0.6265,0-1|H 2.0 -0.31 0.7506 -1.2008 -0.4472,0-1|H 2.2269 0.5369 -1.0315 -0.4013 0.99,0-1|H 2.8469 -0.5369 -0.6575 0.6367 -1.1694,0-1',
    'sulfur dioxide|O2S|1119|full|3|2|S 2.866 0 0 -0.5774 0|O 3.732 0.5 1.3091 0.2887 0,0-2|O 2.0 -0.5 -1.3091 0.2887 0,0-2',
    'trifluoroborane|BF3|6356|2d|4|3|F 3.732 0.75|F 2.0 0.75|F 2.866 -0.75|B 2.866 0.25,0-1,1-1,2-1',
    'water|H2O|962|full|3|2|O 2.5369 -0.155 0 0 0|H 3.0739 0.155 0.2774 0.8929 0.2544,0-1|H 2.0 0.155 0.6068 -0.2383 -0.7169,0-1'
  ];
  return buildAMolecule.register( 'collectionMoleculesData', collectionMoleculesData );
} );
