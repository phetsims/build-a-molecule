// Copyright 2002-2013, University of Colorado

define( function( require ) {
  'use strict';
  
  var Strings = require( 'i18n!BAM/../nls/build-a-molecule-strings' );
  
  var elementMap = {
    'H': Strings[ 'atom.hydrogen' ],
    'O': Strings[ 'atom.oxygen' ],
    'C': Strings[ 'atom.carbon' ],
    'N': Strings[ 'atom.nitrogen' ],
    'F': Strings[ 'atom.fluorine' ],
    'Cl': Strings[ 'atom.chlorine' ],
    'B': Strings[ 'atom.boron' ],
    'S': Strings[ 'atom.sulphur' ],
    'Si': Strings[ 'atom.silicon' ],
    'P': Strings[ 'atom.phosphorus' ],
    'I': Strings[ 'atom.iodine' ],
    'Br': Strings[ 'atom.bromine' ]
  };
  
  Strings.getAtomName = function getAtomName( element ) {
    return elementMap[element.symbol];
  };
  
  return Strings;
} );
