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
import buildAMolecule from '../../buildAMolecule.js';
import Direction from './Direction.js';

class LewisDotModel {

  public readonly atomMap: Record<number, LewisDotAtom>;

  public constructor() {

    this.atomMap = {};
  }

  /**
   * Add an atom to the atom map
   * @param atom
   */
  public addAtom( atom: any ): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    this.atomMap[ atom.id ] = new LewisDotAtom( atom );
  }

  /**
   * Remove the bonds from an atom
   * @param atom
   */
  public breakBondsOfAtom( atom: any ): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    const dotAtom = this.getLewisDotAtom( atom );

    // disconnect all of its bonds
    ( Direction as any ).VALUES.forEach( ( direction: any ) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
  public breakBond( a: any, b: any ): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
  public bond( a: any, dirAtoB: any, b: any ): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- TODO: Fix when Atom and Direction are converted, see https://github.com/phetsims/build-a-molecule/issues/245
    const dotA = this.getLewisDotAtom( a );
    const dotB = this.getLewisDotAtom( b );
    dotA.connect( dirAtoB, dotB );
    dotB.connect( dirAtoB.opposite, dotA );
  }

  /**
   * Returns all of the directions that are open (not bonded to another) on the atom
   * @param atom
   */
  public getOpenDirections( atom: any ): any[] { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- TODO: Fix when Atom and Direction are converted, see https://github.com/phetsims/build-a-molecule/issues/245
    const result: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    const dotAtom = this.getLewisDotAtom( atom );
    ( Direction as any ).VALUES.forEach( ( direction: any ) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
  public getBondDirection( a: any, b: any ): any { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- TODO: Fix when Atom and Direction are converted, see https://github.com/phetsims/build-a-molecule/issues/245
    const dotA = this.getLewisDotAtom( a );
    let direction: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    for ( let i = 0; i < 4; i++ ) {
      const testDirection = ( Direction as any ).VALUES[ i ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      if ( dotA && dotA.hasConnection( testDirection ) && dotA.getLewisDotAtom( testDirection )!.atom === b ) {
        direction = testDirection;
        break;
      }
    }

    // If the bond wasn't found, assert, and add some additional info to help debug.
    assert && assert( direction, `Bond not found, atom b in model = ${this.getLewisDotAtom( b ) !== undefined}` );

    // Return the direction found or something arbitrary if nothing was detected.
    return direction || ( Direction as any ).VALUES[ 0 ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
  }

  /**
   * Decide whether this bonding would cause any layout issues. Does NOT detect loops, and will
   * fail if given molecules with loops.
   * @param a         A
   * @param direction Direction from A to B
   * @param b         B
   * @returns Whether this bond is considered acceptable
   */
  public willAllowBond( a: any, direction: any, b: any ): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- TODO: Fix when Atom and Direction are converted, see https://github.com/phetsims/build-a-molecule/issues/245

    /*---------------------------------------------------------------------------*
     * We need to verify that if we bind these two together that no overlaps occur.
     * This can be done by creating a coordinate system where atom A is our origin,
     * and verifying that no atoms share the same coordinates if they are not both
     * hydrogen.
     *----------------------------------------------------------------------------*/

    const coordinateMap: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245

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
  private mapMolecule( coordinates: Vector2, atom: any, excludedAtom: any, coordinateMap: Record<string, any> ): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245

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
      const direction = ( Direction as any ).VALUES[ i ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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

  /**
   * @param atom
   */
  private getLewisDotAtom( atom: any ): LewisDotAtom { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.atomMap[ atom.id ];
  }
}

class LewisDotAtom {

  public readonly atom: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245

  private readonly connections: Record<any, LewisDotAtom | null>; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245

  /**
   * @param atom
   */
  public constructor( atom: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Atom is converted, see https://github.com/phetsims/build-a-molecule/issues/245

    this.atom = atom;

    this.connections = {};
    ( Direction as any ).VALUES.forEach( ( direction: any ) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      this.connections[ direction.id ] = null; // nothing in this direction
    } );
  }

  /**
   * Checks if a specific direction has any connections
   * @param direction
   */
  public hasConnection( direction: any ): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.connections[ direction.id ] !== null;
  }

  /**
   * Returns the atom connected in a specific direction
   * @param direction
   */
  public getLewisDotAtom( direction: any ): LewisDotAtom | null { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.connections[ direction.id ];
  }

  /**
   * Assign a lewis dot atom connection to a specific direction
   * @param direction
   * @param lewisDotAtom
   */
  public connect( direction: any, lewisDotAtom: LewisDotAtom ): void { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    this.connections[ direction.id ] = lewisDotAtom;
  }

  /**
   * Unassign a lewis dot atom connection to a specific direction
   * @param direction
   */
  public disconnect( direction: any ): void { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Direction is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    this.connections[ direction.id ] = null;
  }
}

buildAMolecule.register( 'LewisDotModel', LewisDotModel );
export default LewisDotModel;