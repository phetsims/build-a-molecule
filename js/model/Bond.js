// Copyright 2002-2014, University of Colorado

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );

  var Bond = namespace.Bond = function Bond( a, b ) {
    assert && assert( a !== b, 'Bonds cannot connect an atom to itself' );
    this.a = a;
    this.b = b;
  };

  Bond.prototype = {
    constructor: Bond,

    get id() {
      return this.a.id + '-' + this.b.id;
    },

    equals: function( other ) {
      return this.a === other.a && this.b === other.b;
    },

    contains: function( atom ) {
      return atom === this.a || atom === this.b;
    },

    getOtherAtom: function( atom ) {
      assert && assert( this.contains( atom ) );

      return ( this.a === atom ? this.b : this.a );
    },

    toSerial2: function( index ) {
      return index + '';
    }
  };

  return Bond;
} );
