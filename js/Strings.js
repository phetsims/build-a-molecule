// Copyright 2013-2017, University of Colorado Boulder

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Strings = {};

  // strings
  var boronString = require( 'string!BUILD_A_MOLECULE/boron' );
  var bromineString = require( 'string!BUILD_A_MOLECULE/bromine' );
  var carbonString = require( 'string!BUILD_A_MOLECULE/carbon' );
  var chlorineString = require( 'string!BUILD_A_MOLECULE/chlorine' );
  var fluorineString = require( 'string!BUILD_A_MOLECULE/fluorine' );
  var hydrogenString = require( 'string!BUILD_A_MOLECULE/hydrogen' );
  var iodineString = require( 'string!BUILD_A_MOLECULE/iodine' );
  var nitrogenString = require( 'string!BUILD_A_MOLECULE/nitrogen' );
  var oxygenString = require( 'string!BUILD_A_MOLECULE/oxygen' );
  var phosphorusString = require( 'string!BUILD_A_MOLECULE/phosphorus' );
  var siliconString = require( 'string!BUILD_A_MOLECULE/silicon' );
  var sulphurString = require( 'string!BUILD_A_MOLECULE/sulphur' );

  buildAMolecule.register( 'Strings', Strings );

  var elementMap = {
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

  Strings.getAtomName = function getAtomName( element ) {
    return elementMap[ element.symbol ];
  };

  return Strings;
} );
