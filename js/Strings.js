// Copyright 2002-2014, University of Colorado

define( function( require ) {
  'use strict';

  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var Strings = {};

  // strings
  var hydrogen = require( 'string!BUILD_A_MOLECULE/atom.hydrogen' );
  var oxygen = require( 'string!BUILD_A_MOLECULE/atom.oxygen' );
  var carbon = require( 'string!BUILD_A_MOLECULE/atom.carbon' );
  var nitrogen = require( 'string!BUILD_A_MOLECULE/atom.nitrogen' );
  var fluorine = require( 'string!BUILD_A_MOLECULE/atom.fluorine' );
  var chlorine = require( 'string!BUILD_A_MOLECULE/atom.chlorine' );
  var boron = require( 'string!BUILD_A_MOLECULE/atom.boron' );
  var sulphur = require( 'string!BUILD_A_MOLECULE/atom.sulphur' );
  var silicon = require( 'string!BUILD_A_MOLECULE/atom.silicon' );
  var phosphorus = require( 'string!BUILD_A_MOLECULE/atom.phosphorus' );
  var iodine = require( 'string!BUILD_A_MOLECULE/atom.iodine' );
  var bromine = require( 'string!BUILD_A_MOLECULE/atom.bromine' );

  Strings[ 'molecule.hydrogen_peroxide' ] = require( 'string!BUILD_A_MOLECULE/molecule.hydrogen_peroxide' );
  Strings[ 'molecule.formaldehyde' ] = require( 'string!BUILD_A_MOLECULE/molecule.formaldehyde' );
  Strings[ 'molecule.silane' ] = require( 'string!BUILD_A_MOLECULE/molecule.silane' );
  Strings[ 'molecule.molecular_fluorine' ] = require( 'string!BUILD_A_MOLECULE/molecule.molecular_fluorine' );
  Strings[ 'molecule.water' ] = require( 'string!BUILD_A_MOLECULE/molecule.water' );
  Strings[ 'molecule.borane' ] = require( 'string!BUILD_A_MOLECULE/molecule.borane' );
  Strings[ 'molecule.hydrogen_sulfide' ] = require( 'string!BUILD_A_MOLECULE/molecule.hydrogen_sulfide' );
  Strings[ 'molecule.carbon_dioxide' ] = require( 'string!BUILD_A_MOLECULE/molecule.carbon_dioxide' );
  Strings[ 'molecule.chloromethane' ] = require( 'string!BUILD_A_MOLECULE/molecule.chloromethane' );
  Strings[ 'molecule.molecular_chlorine' ] = require( 'string!BUILD_A_MOLECULE/molecule.molecular_chlorine' );
  Strings[ 'molecule.molecular_nitrogen' ] = require( 'string!BUILD_A_MOLECULE/molecule.molecular_nitrogen' );
  Strings[ 'molecule.phosphine' ] = require( 'string!BUILD_A_MOLECULE/molecule.phosphine' );
  Strings[ 'molecule.sulfur_dioxide' ] = require( 'string!BUILD_A_MOLECULE/molecule.sulfur_dioxide' );
  Strings[ 'molecule.ozone' ] = require( 'string!BUILD_A_MOLECULE/molecule.ozone' );
  Strings[ 'molecule.fluoromethane' ] = require( 'string!BUILD_A_MOLECULE/molecule.fluoromethane' );
  Strings[ 'molecule.hydrogen_cyanide' ] = require( 'string!BUILD_A_MOLECULE/molecule.hydrogen_cyanide' );
  Strings[ 'molecule.molecular_hydrogen' ] = require( 'string!BUILD_A_MOLECULE/molecule.molecular_hydrogen' );
  Strings[ 'molecule.acetylene' ] = require( 'string!BUILD_A_MOLECULE/molecule.acetylene' );
  Strings[ 'molecule.trifluoroborane' ] = require( 'string!BUILD_A_MOLECULE/molecule.trifluoroborane' );
  Strings[ 'molecule.carbon_monoxide' ] = require( 'string!BUILD_A_MOLECULE/molecule.carbon_monoxide' );
  Strings[ 'molecule.molecular_oxygen' ] = require( 'string!BUILD_A_MOLECULE/molecule.molecular_oxygen' );
  Strings[ 'molecule.methane' ] = require( 'string!BUILD_A_MOLECULE/molecule.methane' );
  Strings[ 'molecule.ammonia' ] = require( 'string!BUILD_A_MOLECULE/molecule.ammonia' );
  Strings[ 'molecule.ethylene' ] = require( 'string!BUILD_A_MOLECULE/molecule.ethylene' );
  Strings[ 'molecule.nitrous_oxide' ] = require( 'string!BUILD_A_MOLECULE/molecule.nitrous_oxide' );
  Strings[ 'molecule.nitric_oxide' ] = require( 'string!BUILD_A_MOLECULE/molecule.nitric_oxide' );

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
    return elementMap[ element.symbol ];
  };

  return Strings;
} );
