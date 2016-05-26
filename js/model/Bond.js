// Copyright 2013-2015, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );

  function Bond( a, b ) {
    assert && assert( a !== b, 'Bonds cannot connect an atom to itself' );
    this.a = a;
    this.b = b;
  }
  buildAMolecule.register( 'Bond', Bond );

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
