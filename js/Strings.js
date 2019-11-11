// Copyright 2013-2019, University of Colorado Boulder

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Strings = {};

  // strings
  const boronString = require( 'string!BUILD_A_MOLECULE/boron' );
  const bromineString = require( 'string!BUILD_A_MOLECULE/bromine' );
  const carbonString = require( 'string!BUILD_A_MOLECULE/carbon' );
  const chlorineString = require( 'string!BUILD_A_MOLECULE/chlorine' );
  const fluorineString = require( 'string!BUILD_A_MOLECULE/fluorine' );
  const hydrogenString = require( 'string!BUILD_A_MOLECULE/hydrogen' );
  const iodineString = require( 'string!BUILD_A_MOLECULE/iodine' );
  const nitrogenString = require( 'string!BUILD_A_MOLECULE/nitrogen' );
  const oxygenString = require( 'string!BUILD_A_MOLECULE/oxygen' );
  const phosphorusString = require( 'string!BUILD_A_MOLECULE/phosphorus' );
  const siliconString = require( 'string!BUILD_A_MOLECULE/silicon' );
  const sulphurString = require( 'string!BUILD_A_MOLECULE/sulphur' );

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

  Strings.getAtomName = function getAtomName( element ) {
    return elementMap[ element.symbol ];
  };

  return buildAMolecule.register( 'Strings', Strings );

} );
