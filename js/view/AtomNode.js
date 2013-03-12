// Copyright 2002-2012, University of Colorado

/**
 * Displays an atom and that labels it with the chemical symbol
 *
 * NOTE: Iodine is unusable as its label is too large (very thin I). If needed, rework the scaling
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var Inheritance = require( 'PHETCOMMON/util/Inheritance' );
  var Node = require( 'SCENERY/nodes/Node' );
  
  var AtomNode = function( options ) {
    Node.call( this, options );
  };
  
  Inheritance.inheritPrototype( AtomNode, Node );
  
  return AtomNode;
} );
