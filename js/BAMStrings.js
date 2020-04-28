// Copyright 2013-2020, University of Colorado Boulder
import buildAMolecule from './buildAMolecule.js';
import buildAMoleculeStrings from './buildAMoleculeStrings.js';

const elementMap = {
  'H': buildAMoleculeStrings.hydrogen,
  'O': buildAMoleculeStrings.oxygen,
  'C': buildAMoleculeStrings.carbon,
  'N': buildAMoleculeStrings.nitrogen,
  'F': buildAMoleculeStrings.fluorine,
  'Cl': buildAMoleculeStrings.chlorine,
  'B': buildAMoleculeStrings.boron,
  'S': buildAMoleculeStrings.sulphur,
  'Si': buildAMoleculeStrings.silicon,
  'P': buildAMoleculeStrings.phosphorus,
  'I': buildAMoleculeStrings.iodine,
  'Br': buildAMoleculeStrings.bromine
};
// REVIEW: We can include the getAtomName definition in this object (and move the definition of this down)
const Strings = {};
Strings.getAtomName = element => {
  return elementMap[ element.symbol ];
};

buildAMolecule.register( 'Strings', Strings );
export default Strings;