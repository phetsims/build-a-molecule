[object Promise]

import buildAMolecule from '../buildAMolecule.js';
import buildAMoleculeStrings from '../buildAMoleculeStrings.js';

const Strings = {
  H: buildAMoleculeStrings.hydrogen,
  O: buildAMoleculeStrings.oxygen,
  C: buildAMoleculeStrings.carbon,
  N: buildAMoleculeStrings.nitrogen,
  F: buildAMoleculeStrings.fluorine,
  Cl: buildAMoleculeStrings.chlorine,
  B: buildAMoleculeStrings.boron,
  S: buildAMoleculeStrings.sulphur,
  Si: buildAMoleculeStrings.silicon,
  P: buildAMoleculeStrings.phosphorus,
  I: buildAMoleculeStrings.iodine,
  Br: buildAMoleculeStrings.bromine
};

buildAMolecule.register( 'Strings', Strings );
export default Strings;