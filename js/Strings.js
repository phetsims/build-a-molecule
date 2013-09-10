// Copyright 2002-2013, University of Colorado

define( function( require ) {
  'use strict';
  
  var namespace = require( 'BAM/namespace' );
  var Strings = require( 'i18n!BAM/../nls/build-a-molecule-strings' );
  namespace.Strings = Strings;
  
  var elementMap = {
    'H': Strings[ 'atom_hydrogen' ],
    'O': Strings[ 'atom_oxygen' ],
    'C': Strings[ 'atom_carbon' ],
    'N': Strings[ 'atom_nitrogen' ],
    'F': Strings[ 'atom_fluorine' ],
    'Cl': Strings[ 'atom_chlorine' ],
    'B': Strings[ 'atom_boron' ],
    'S': Strings[ 'atom_sulphur' ],
    'Si': Strings[ 'atom_silicon' ],
    'P': Strings[ 'atom_phosphorus' ],
    'I': Strings[ 'atom_iodine' ],
    'Br': Strings[ 'atom_bromine' ]
  };
  
  Strings.getAtomName = function getAtomName( element ) {
    return elementMap[element.symbol];
  };
  
  return Strings;
} );
