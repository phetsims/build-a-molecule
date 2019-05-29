// Copyright 2013-2017, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Atom = require( 'NITROGLYCERIN/Atom' );

  //REVIEW: This is polymorphic, just requires things with IDs (a.id, b.id). I THINK it is used on Atom subtypes, so
  //REVIEW: Just use {Atom}

  class Bond extends Atom {
    constructor( a, b ) {
      super( a, b );
      assert && assert( a !== b, 'Bonds cannot connect an atom to itself' );
      this.a = a;
      this.b = b;
    }

    id() {
      return this.a.id + '-' + this.b.id;
    }

    equals( other ) {
      return this.a === other.a && this.b === other.b;
    }

    contains( atom ) {
      return atom === this.a || atom === this.b;
    }

    getOtherAtom( atom ) {
      assert && assert( this.contains( atom ) );

      return ( this.a === atom ? this.b : this.a );
    }

    toSerial2( index ) {
      return index + '';
    }
  }

  return buildAMolecule.register( 'Bond', Bond );
} );
