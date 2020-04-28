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
   * @param {Atom2} atom REVIEW: Pretty sure this is inaccurate, PubChemAtom3 for example isn't an Atom2. Maybe add type checks to this file?
   *
   * REVIEW: Needs visibility
   *
   * @returns {boolean}
   */
  contains( atom ) {
    return atom === this.a || atom === this.b;
  }

  /**
   * Returns the other atom within the bond that isn't the passed in atom
   * @param {Atom2} atom REVIEW: Should be Atom, not Atom2, no?
   *
   * REVIEW: Needs visibility
   *
   * @returns {Atom2} REVIEW: Should be Atom, not Atom2, no?
   */
  getOtherAtom( atom ) {
    assert && assert( this.contains( atom ) );

    return ( this.a === atom ? this.b : this.a );
  }

  /**
   * Returns serialized form of bond data
   * @param {string} index - Index of bond within molecule REVIEW: Fairly sure that index is a number, not a string?
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