// Copyright 2020-2025, University of Colorado Boulder

// @author Jonathan Olson (PhET Interactive Simulations)

import buildAMolecule from '../buildAMolecule.js';
import BuildAMoleculeStrings from '../BuildAMoleculeStrings.js';

const Strings = {
  H: BuildAMoleculeStrings.hydrogen,
  O: BuildAMoleculeStrings.oxygen,
  C: BuildAMoleculeStrings.carbon,
  N: BuildAMoleculeStrings.nitrogen,
  F: BuildAMoleculeStrings.fluorine,
  Cl: BuildAMoleculeStrings.chlorine,
  B: BuildAMoleculeStrings.boron,
  S: BuildAMoleculeStrings.sulphur,
  Si: BuildAMoleculeStrings.silicon,
  P: BuildAMoleculeStrings.phosphorus,
  I: BuildAMoleculeStrings.iodine,
  Br: BuildAMoleculeStrings.bromine
};

buildAMolecule.register( 'Strings', Strings );
export default Strings;