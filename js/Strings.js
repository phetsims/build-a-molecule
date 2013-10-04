// Copyright 2002-2013, University of Colorado

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Strings = {};
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
