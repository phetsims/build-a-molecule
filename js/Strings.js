// Copyright 2013-2020, University of Colorado Boulder

import buildAMolecule from './buildAMolecule.js';
import buildAMoleculeStrings from './buildAMoleculeStrings.js';

// REVIEW: BAM prefix would be good for this file?

// REVIEW: We can include the getAtomName definition in this object (and move the definition of this down)
const Strings = {};

// REVIEW: These strings can be inlined
const boronString = buildAMoleculeStrings.boron;
const bromineString = buildAMoleculeStrings.bromine;
const carbonString = buildAMoleculeStrings.carbon;
const chlorineString = buildAMoleculeStrings.chlorine;
const fluorineString = buildAMoleculeStrings.fluorine;
const hydrogenString = buildAMoleculeStrings.hydrogen;
const iodineString = buildAMoleculeStrings.iodine;
const nitrogenString = buildAMoleculeStrings.nitrogen;
const oxygenString = buildAMoleculeStrings.oxygen;
const phosphorusString = buildAMoleculeStrings.phosphorus;
const siliconString = buildAMoleculeStrings.silicon;
const sulphurString = buildAMoleculeStrings.sulphur;

const elementMap = {
  'H': hydrogenString,
  'O': oxygenString,
  'C': carbonString,
  'N': nitrogenString,
  'F': fluorineString,
  'Cl': chlorineString,
  'B': boronString,
  'S': sulphurString,
  'Si': siliconString,
  'P': phosphorusString,
  'I': iodineString,
  'Br': bromineString
};

// REVIEW: arrow functions for ES6
Strings.getAtomName = function getAtomName( element ) {
  return elementMap[ element.symbol ];
};

buildAMolecule.register( 'Strings', Strings );
export default Strings;