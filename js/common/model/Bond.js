// Copyright 2020, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );

  class Bond {
    /**
     * @param {Atom} a
     * @param {Atom} b
     */
    constructor( a, b ) {
      assert && assert( a !== b, 'Bonds cannot connect an atom to itself' );
      this.a = a;
      this.b = b;
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
