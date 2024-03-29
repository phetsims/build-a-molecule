// Copyright 2020-2024, University of Colorado Boulder

// @author Jonathan Olson <jonathan.olson@colorado.edu>

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