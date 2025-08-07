// Copyright 2020-2023, University of Colorado Boulder


/**
 * Represents the lewis-dot directional connections between atoms. Holds information for all atoms within a particular kit, but it is generic
 * enough to handle other situations
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Atom from '../../../../nitroglycerin/js/Atom.js';
import buildAMolecule from '../../buildAMolecule.js';
import Direction, { DirectionValue } from './Direction.js';

class LewisDotModel {

  public readonly atomMap: Record<string, LewisDotAtom>;

  public constructor() {

    this.atomMap = {};
  }

  /**
   * Add an atom to the atom map
   * @param atom
   */
  public addAtom( atom: Atom ): void {
    this.atomMap[ atom.id ] = new LewisDotAtom( atom );
  }

  /**
   * Remove the bonds from an atom
   */
  public breakBondsOfAtom( atom: Atom ): void {
    const dotAtom = this.getLewisDotAtom( atom );

    // disconnect all of its bonds
    Direction.VALUES.forEach( direction => {
      if ( dotAtom && dotAtom.hasConnection( direction ) ) {
        const otherDotAtom = dotAtom.getLewisDotAtom( direction );
        if ( otherDotAtom ) {
          this.breakBond( dotAtom.atom, otherDotAtom.atom );
        }
      }
    } );
  }

  /**
   * Break the bond between A and B (if it exists)
   * @param a - A
   * @param b - B
   */
  public breakBond( a: Atom, b: Atom ): void {
    const dotA = this.getLewisDotAtom( a );
    const dotB = this.getLewisDotAtom( b );
    const direction = this.getBondDirection( a, b );
    dotA.disconnect( direction );
    dotB.disconnect( direction.opposite );
  }

  /**
   * Bond together atoms A and B.
   *
   * @param a       A
   * @param dirAtoB The direction from A to B. So if A is to the left, B is on the right, the direction would be East
   * @param b       B
   */
  public bond( a: Atom, dirAtoB: DirectionValue, b: Atom ): void {
    const dotA = this.getLewisDotAtom( a );
    const dotB = this.getLewisDotAtom( b );
    dotA.connect( dirAtoB, dotB );
    dotB.connect( dirAtoB.opposite, dotA );
  }

  /**
   * Returns all directions that are open (not bonded to another) on the atom
   * @param atom
   */
  public getOpenDirections( atom: Atom ): DirectionValue[] {
    const result: DirectionValue[] = [];
    const dotAtom = this.getLewisDotAtom( atom );
    Direction.VALUES.forEach( direction => {
      if ( dotAtom && !dotAtom.hasConnection( direction ) ) {
        result.push( direction );
      }
    } );
    return result;
  }

  /**
   * Returns the bond direction from A to B. If it doesn't exist an arbitrary direction is returned.
   * @param a - A
   * @param b - B
   */
  public getBondDirection( a: Atom, b: Atom ): DirectionValue {
    const dotA = this.getLewisDotAtom( a );
    let direction: DirectionValue;
    for ( let i = 0; i < 4; i++ ) {
      const testDirection = Direction.VALUES[ i ];
      if ( dotA && dotA.hasConnection( testDirection ) && dotA.getLewisDotAtom( testDirection )!.atom === b ) {
        direction = testDirection;
        break;
      }
    }

    // If the bond wasn't found, assert, and add some additional info to help debug.
    assert && assert( direction!, `Bond not found, atom b in model = ${this.getLewisDotAtom( b ) !== undefined}` );

    // Return the direction found or something arbitrary if nothing was detected.
    return direction! || Direction.VALUES[ 0 ];
  }

  /**
   * Decide whether this bonding would cause any layout issues. Does NOT detect loops, and will
   * fail if given molecules with loops.
   * @param a         A
   * @param direction Direction from A to B
   * @param b         B
   * @returns Whether this bond is considered acceptable
   */
  public willAllowBond( a: Atom, direction: DirectionValue, b: Atom ): boolean {

    /*---------------------------------------------------------------------------*
     * We need to verify that if we bind these two together that no overlaps occur.
     * This can be done by creating a coordinate system where atom A is our origin,
     * and verifying that no atoms share the same coordinates if they are not both
     * hydrogen.
     *----------------------------------------------------------------------------*/

    const coordinateMap: Record<string, Atom> = {};

    // map the molecule on the A side, from the origin
    let success = this.mapMolecule( Vector2.ZERO, a, null, coordinateMap );

    // map the molecule on the B side, with the offset from direction
    success = success && this.mapMolecule( direction.vector, b, null, coordinateMap );

    // we would have false if a conflict was found
    return success;
  }

  /*---------------------------------------------------------------------------*
   * implementation details
   *----------------------------------------------------------------------------*/

  /**
   * Add "atom" to our coordinate map, and all of its neighbors EXCEPT for excludedAtom.
   * This allows mapping a molecule without loops quite easily
   *
   * @param coordinates   Coordinates of "atom"
   * @param atom          Atom to add
   * @param excludedAtom  Atom not to
   * @param coordinateMap Coordinate map to which we add the atoms to
   * @returns Success. Will return false if any heavy atom overlaps on another atom. If it returns false, the coordinate map may be inconsistent
   */
  private mapMolecule( coordinates: Vector2, atom: Atom, excludedAtom: Atom | null, coordinateMap: Record<string, Atom> ): boolean {

    const dotAtom = this.getLewisDotAtom( atom );

    // for sanity and equality (negative zero equals zero, so don't worry about that)
    const point = new Vector2( Utils.roundSymmetric( coordinates.x ), Utils.roundSymmetric( coordinates.y ) );

    const idx = `${point.x},${point.y}`;

    // if we have seen a different atom in this position
    if ( coordinateMap[ idx ] ) {
      // if at least one isn't hydrogen, fail out
      if ( !atom.isHydrogen() || !coordinateMap[ idx ].isHydrogen() ) {
        return false;
      }
      // here, they both must be hydrogen, so we don't need to worry about adding it in
    }
    else {
      coordinateMap[ idx ] = atom;
    }

    let success = true;

    // check all directions so we can explore all other atoms that need to be mapped
    for ( let i = 0; i < 4; i++ ) {
      const direction = Direction.VALUES[ i ];
      if ( dotAtom && dotAtom.hasConnection( direction ) ) {
        const otherDot = dotAtom.getLewisDotAtom( direction );

        // if this atom isn't excluded
        if ( otherDot!.atom !== excludedAtom ) {
          success = this.mapMolecule( coordinates.plus( direction.vector ), otherDot!.atom, atom, coordinateMap );

          // if we had a failure mapping that one, bail out
          if ( !success ) {
            return false;
          }
        }
      }
    }

    // everything worked
    return success;
  }

  private getLewisDotAtom( atom: Atom ): LewisDotAtom {
    return this.atomMap[ atom.id ];
  }
}

class LewisDotAtom {

  public readonly atom: Atom;

  private readonly connections: Record<string, LewisDotAtom | null>;

  public constructor( atom: Atom ) {

    this.atom = atom;

    this.connections = {};
    Direction.VALUES.forEach( ( direction: DirectionValue ) => {
      this.connections[ direction.id ] = null; // nothing in this direction
    } );
  }

  /**
   * Checks if a specific direction has any connections
   * @param direction
   */
  public hasConnection( direction: DirectionValue ): boolean {
    return this.connections[ direction.id ] !== null;
  }

  /**
   * Returns the atom connected in a specific direction
   * @param direction
   */
  public getLewisDotAtom( direction: DirectionValue ): LewisDotAtom | null {
    return this.connections[ direction.id ];
  }

  /**
   * Assign a lewis dot atom connection to a specific direction
   * @param direction
   * @param lewisDotAtom
   */
  public connect( direction: DirectionValue, lewisDotAtom: LewisDotAtom ): void {
    this.connections[ direction.id ] = lewisDotAtom;
  }

  /**
   * Unassign a lewis dot atom connection to a specific direction
   * @param direction
   */
  public disconnect( direction: DirectionValue ): void {
    this.connections[ direction.id ] = null;
  }
}

buildAMolecule.register( 'LewisDotModel', LewisDotModel );
export default LewisDotModel;