// Copyright 2002-2012, University of Colorado

/**
 * Utilities that should probably be moved into common code
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  "use strict";
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  
  var Util = {
    // experimental handling of property attributes through Backbone's Events, similarly to Property
    addChangeProperty: function( obj, name ) {
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
  };
  
  return Util;
} );
