// Copyright 2020, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import buildAMolecule from '../../buildAMolecule.js';

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

  /**
   * Checks if the passed in atom is equal to one of the bond's atoms
   * @param {Atom2} atom
   *
   * @returns {boolean}
   */
  contains( atom ) {
    return atom === this.a || atom === this.b;
  }

  /**
   * Returns the other atom within the bond that isn't the passed in atom
   * @param {Atom2} atom
   *
   * @returns {Atom2}
   */
  getOtherAtom( atom ) {
    assert && assert( this.contains( atom ) );

    return ( this.a === atom ? this.b : this.a );
  }

  /**
   * Returns serialized form of bond data
   * @param {string} index - Index of bond within molecule
   *
   * @public
   * @returns {string}
   */
  toSerial2( index ) {
    return index + '';
  }
}

buildAMolecule.register( 'Bond', Bond );
export default Bond;