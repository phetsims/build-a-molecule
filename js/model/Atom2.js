// Copyright 2002-2012, University of Colorado

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  "use strict";
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  
  var Backbone = require( 'backbone' );
  var Inheritance = require( 'PHETCOMMON/util/Inheritance' );
  var Atom = require( 'CHEMISTRY/Atom' );
  var Vector2 = require( 'DOT/Vector2' );
  
  var Atom2 = function( element ) {
    Atom.call( this, element );
    
    this.position = new Vector2();
    this.destination = new Vector2();
    this.userControlled = false;
  };
  
  Inheritance.inheritPrototype( Atom2, Atom );
  
  // _.extend( Atom2.prototype, Backbone.Events, {
    
  // } );
  
  return Atom2;
} );
