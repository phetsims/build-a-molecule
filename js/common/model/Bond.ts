// Copyright 2020-2026, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import buildAMolecule from '../../buildAMolecule.js';

class Bond {

  public readonly a: Atom;
  public readonly b: Atom;

  public constructor( a: Atom, b: Atom ) {
    assert && assert( a !== b, 'Bonds cannot connect an atom to itself' );

    this.a = a;
    this.b = b;
  }

  /**
   * Checks if the passed in atom is equal to one of the bond's atoms
   */
  public contains( atom: Atom ): boolean {
    return atom === this.a || atom === this.b;
  }

  /**
   * Returns the other atom within the bond that isn't the passed in atom
   */
  public getOtherAtom( atom: Atom ): Atom {
    assert && assert( this.contains( atom ) );
    return ( this.a === atom ? this.b : this.a );
  }

  /**
   * Returns serialized form of bond data
   * @param index - Index of bond within molecule
   */
  public toSerial2( index: number ): string {
    return `${index}`;
  }
}

buildAMolecule.register( 'Bond', Bond );
export default Bond;