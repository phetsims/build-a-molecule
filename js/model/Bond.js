// Copyright 2013-2017, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );


  //REVIEW: This is polymorphic, just requires things with IDs (a.id, b.id). I THINK it is used on Atom subtypes, so
  //REVIEW: Just use {Atom}

  function Bond( a, b ) {
    assert && assert( a !== b, 'Bonds cannot connect an atom to itself' );
    this.a = a;
    this.b = b;
  }
  buildAMolecule.register( 'Bond', Bond );

  return inherit( PhetioObject, Bond, {
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
  } );
} );
