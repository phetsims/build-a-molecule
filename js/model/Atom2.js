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
  
  // experimental handling of property attributes through Backbone's Events, similarly to Property
  function addPropertyAttribute( obj, name ) {
    var underscoreName = '_' + name;
    var eventName = 'change:' + name;
    
    // we need to set the ES5 getter/setter like this, since we don't have a literal for the property name
    Object.defineProperty( obj, name, {
      configurable: true,
      enumerable: true,
      get: function() {
        return this[underscoreName];
      },
      set: function( value ) {
        var oldValue = this[underscoreName];
        this[underscoreName] = value;
        
        // trigger a backbone event
        this.trigger( eventName, value, oldValue );
      }
    } );
  }
  
  Atom2.prototype = extend( {}, Backbone.Events, Atom.prototype, {
    constructor: Atom2,
    
    set positionAndDestination( value ) {
      this.destination = this.position = value;
    }
  } );
  
  addPropertyAttribute( Atom2.prototype, 'position' );
  addPropertyAttribute( Atom2.prototype, 'destination' );
  addPropertyAttribute( Atom2.prototype, 'userControlled' );
  
  return Atom2;
} );
