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
  var extend = require( 'SCENERY/util/Util' ).extend;
  
  var Atom2 = function( element ) {
    Atom.call( this, element );
    
    this._position = new Vector2();
    this._destination = new Vector2();
    this._userControlled = false;
  };
  
  Atom2.prototype = extend( {}, Backbone.Events, Atom.prototype, {
    constructor: Atom2,
    
    set position( value ) {
      var oldValue = this._position;
      this._position = value;
      this.trigger( 'change:position', value, oldValue );
    },
    
    get position() {
      return this._position;
    }
  } );
  // Inheritance.inheritPrototype( Atom2, Atom );
  
  // _.extend( Atom2.prototype, Backbone.Events, {
    
  // } );
  
  return Atom2;
} );
