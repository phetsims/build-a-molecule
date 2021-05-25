// Copyright 2020-2021, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import buildAMolecule from '../../buildAMolecule.js';

class Bond {
  /**
   * @param {Atom} a
   * @param {Atom} b
   */
  constructor( a, b ) {
    assert && assert( a !== b, 'Bonds cannot connect an atom to itself' );

    // @public {Atom}
    this.a = a;

    // @public {Atom}
    this.b = b;
  }

  /**
   * Checks if the passed in atom is equal to one of the bond's atoms
   * @param {Atom|PubChemAtom*} atom
   *
   * @public
   * @returns {boolean}
   */
  contains( atom ) {
    assert && assert( atom instanceof Atom );
    return atom === this.a || atom === this.b;
  }

  /**
   * Returns the other atom within the bond that isn't the passed in atom
   * @param {Atom|PubChemAtom*} atom
   *
   * @public
   * @returns {Atom}
   */
  getOtherAtom( atom ) {
    assert && assert( atom instanceof Atom );
    assert && assert( this.contains( atom ) );
    return ( this.a === atom ? this.b : this.a );
  }

  /**
   * Returns serialized form of bond data
   * @param {number} index - Index of bond within molecule
   *
   * @public
   * @returns {string}
   */
  toSerial2( index ) {
    return `${index}`;
  }
}

buildAMolecule.register( 'Bond', Bond );
export default Bond;