// Copyright 2002-2014, University of Colorado

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Strings = {};

  // strings
  var hydrogen = require( 'string!BAM/atom.hydrogen' );
  var oxygen = require( 'string!BAM/atom.oxygen' );
  var carbon = require( 'string!BAM/atom.carbon' );
  var nitrogen = require( 'string!BAM/atom.nitrogen' );
  var fluorine = require( 'string!BAM/atom.fluorine' );
  var chlorine = require( 'string!BAM/atom.chlorine' );
  var boron = require( 'string!BAM/atom.boron' );
  var sulphur = require( 'string!BAM/atom.sulphur' );
  var silicon = require( 'string!BAM/atom.silicon' );
  var phosphorus = require( 'string!BAM/atom.phosphorus' );
  var iodine = require( 'string!BAM/atom.iodine' );
  var bromine = require( 'string!BAM/atom.bromine' );

  Strings['molecule.hydrogen_peroxide'] = require( 'string!BAM/molecule.hydrogen_peroxide' );
  Strings['molecule.formaldehyde'] = require( 'string!BAM/molecule.formaldehyde' );
  Strings['molecule.silane'] = require( 'string!BAM/molecule.silane' );
  Strings['molecule.molecular_fluorine'] = require( 'string!BAM/molecule.molecular_fluorine' );
  Strings['molecule.water'] = require( 'string!BAM/molecule.water' );
  Strings['molecule.borane'] = require( 'string!BAM/molecule.borane' );
  Strings['molecule.hydrogen_sulfide'] = require( 'string!BAM/molecule.hydrogen_sulfide' );
  Strings['molecule.carbon_dioxide'] = require( 'string!BAM/molecule.carbon_dioxide' );
  Strings['molecule.chloromethane'] = require( 'string!BAM/molecule.chloromethane' );
  Strings['molecule.molecular_chlorine'] = require( 'string!BAM/molecule.molecular_chlorine' );
  Strings['molecule.molecular_nitrogen'] = require( 'string!BAM/molecule.molecular_nitrogen' );
  Strings['molecule.phosphine'] = require( 'string!BAM/molecule.phosphine' );
  Strings['molecule.sulfur_dioxide'] = require( 'string!BAM/molecule.sulfur_dioxide' );
  Strings['molecule.ozone'] = require( 'string!BAM/molecule.ozone' );
  Strings['molecule.fluoromethane'] = require( 'string!BAM/molecule.fluoromethane' );
  Strings['molecule.hydrogen_cyanide'] = require( 'string!BAM/molecule.hydrogen_cyanide' );
  Strings['molecule.molecular_hydrogen'] = require( 'string!BAM/molecule.molecular_hydrogen' );
  Strings['molecule.acetylene'] = require( 'string!BAM/molecule.acetylene' );
  Strings['molecule.trifluoroborane'] = require( 'string!BAM/molecule.trifluoroborane' );
  Strings['molecule.carbon_monoxide'] = require( 'string!BAM/molecule.carbon_monoxide' );
  Strings['molecule.molecular_oxygen'] = require( 'string!BAM/molecule.molecular_oxygen' );
  Strings['molecule.methane'] = require( 'string!BAM/molecule.methane' );
  Strings['molecule.ammonia'] = require( 'string!BAM/molecule.ammonia' );
  Strings['molecule.ethylene'] = require( 'string!BAM/molecule.ethylene' );
  Strings['molecule.nitrous_oxide'] = require( 'string!BAM/molecule.nitrous_oxide' );
  Strings['molecule.nitric_oxide'] = require( 'string!BAM/molecule.nitric_oxide' );

  namespace.Strings = Strings;

  var elementMap = {
    'H': hydrogen,
    'O': oxygen,
    'C': carbon,
    'N': nitrogen,
    'F': fluorine,
    'Cl': chlorine,
    'B': boron,
    'S': sulphur,
    'Si': silicon,
    'P': phosphorus,
    'I': iodine,
    'Br': bromine
  };

  Strings.getAtomName = function getAtomName( element ) {
    return elementMap[element.symbol];
  };

  return Strings;
} );
