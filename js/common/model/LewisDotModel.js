// Copyright 2020-2021, University of Colorado Boulder

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
  constructor() {

    // @public {Object.<atomId:number, LewisDotAtom>}
    this.atomMap = {};
  }

  /**
   * Add an atom to the atom map
   * @param {Atom} atom
   *
   * @public
   */
  addAtom( atom ) {
    this.atomMap[ atom.id ] = new LewisDotAtom( atom );
  }

  /**
   * Remove the bonds from an atom
   * @param {Atom} atom
   *
   * @public
   */
  breakBondsOfAtom( atom ) {
    const dotAtom = this.getLewisDotAtom( atom );

    // disconnect all of its bonds
    Direction.VALUES.forEach( direction => {
      if ( dotAtom && dotAtom.hasConnection( direction ) ) {
        const otherDotAtom = dotAtom.getLewisDotAtom( direction );
        this.breakBond( dotAtom.atom, otherDotAtom.atom );
      }
    } );
  }

  /**
   * Break the bond between A and B (if it exists)
   * @param {Atom} a - A
   * @param {Atom} b - B
   *
   * @public
   */
  breakBond( a, b ) {
    const dotA = this.getLewisDotAtom( a );
    const dotB = this.getLewisDotAtom( b );
    const direction = this.getBondDirection( a, b );
    dotA.disconnect( direction );
    dotB.disconnect( direction.opposite );
  }

  /**
   * Bond together atoms A and B.
   *
   * @param {Atom}      a       A
   * @param {Direction} dirAtoB The direction from A to B. So if A is to the left, B is on the right, the direction would be East
   * @param {Atom}      b       B
   *
   * @public
   */
  bond( a, dirAtoB, b ) {
    const dotA = this.getLewisDotAtom( a );
    const dotB = this.getLewisDotAtom( b );
    dotA.connect( dirAtoB, dotB );
    dotB.connect( dirAtoB.opposite, dotA );
  }

  /**
   * Returns all of the directions that are open (not bonded to another) on the atom
   * @param {Atom} atom
   *
   * @public
   * @returns {Array.<Direction>}
   */
  getOpenDirections( atom ) {
    const result = [];
    const dotAtom = this.getLewisDotAtom( atom );
    Direction.VALUES.forEach( direction => {
      if ( dotAtom && !dotAtom.hasConnection( direction ) ) {
        result.push( direction );
      }
    } );
    return result;
  }

  /**
   * Returns the bond direction from A to B. If it doesn't exist, an exception is thrown
   * @param {Atom} a - A
   * @param {Atom} b - B
   *
   * @public
   * @returns {Direction}
   */
  getBondDirection( a, b ) {
    const dotA = this.getLewisDotAtom( a );
    for ( let i = 0; i < 4; i++ ) {
      const direction = Direction.VALUES[ i ];
      if ( dotA && dotA.hasConnection( direction ) && dotA.getLewisDotAtom( direction ).atom === b ) {
        return direction;
      }
    }
    throw new Error( 'Bond not found' );
  }

  /**
   * Decide whether this bonding would cause any layout issues. Does NOT detect loops, and will
   * fail if given molecules with loops.
   * @param {Atom}      a         A
   * @param {Direction} direction Direction from A to B
   * @param {Atom}      b         B
   *
   * @public
   * @returns {boolean} Whether this bond is considered acceptable
   */
  willAllowBond( a, direction, b ) {

    /*---------------------------------------------------------------------------*
     * We need to verify that if we bind these two together that no overlaps occur.
     * This can be done by creating a coordinate system where atom A is our origin,
     * and verifying that no atoms share the same coordinates if they are not both
     * hydrogen.
     *----------------------------------------------------------------------------*/

    const coordinateMap = {};

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
   * @param {Vector2}             coordinates   Coordinates of "atom"
   * @param {Atom}                atom          Atom to add
   * @param {Atom}                excludedAtom  Atom not to
   * @param {Map x+','+y => Atom} coordinateMap Coordinate map to which we add the atoms to
   *
   * @private
   * @returns {boolean} Success. Will return false if any heavy atom overlaps on another atom. If it returns false, the coordinate map may be inconsistent
   */
  mapMolecule( coordinates, atom, excludedAtom, coordinateMap ) {

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
        if ( otherDot.atom !== excludedAtom ) {
          success = this.mapMolecule( coordinates.plus( direction.vector ), otherDot.atom, atom, coordinateMap );

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
   * @param {Atom} atom
   *
   * @private
   * @returns {Atom}
   */
  getLewisDotAtom( atom ) {
    return this.atomMap[ atom.id ];
  }
}

class LewisDotAtom {
  /**
   * @param {Atom} atom
   */
  constructor( atom ) {

    // @private {Atom}
    this.atom = atom;

    // @private {Object.<DirectionID:null|LewisDotAtom>}
    this.connections = {};
    Direction.VALUES.forEach( direction => {
      this.connections[ direction.id ] = null; // nothing in this direction
    } );
  }

  /**
   * Checks if a specific direction has any connections
   * @param {Direction} direction
   *
   * @public
   * @returns {boolean}
   */
  hasConnection( direction ) {
    return this.connections[ direction.id ] !== null;
  }

  /**
   * Returns the atom connected in a specific direction
   * @param {Direction} direction
   *
   * @public
   * @returns {LewisDotAtom}
   */
  getLewisDotAtom( direction ) {
    return this.connections[ direction.id ];
  }

  /**
   * Assign a lewis dot atom connection to a specific direction
   * @param {Direction} direction
   * @param {LewisDotAtom} lewisDotAtom
   * @private
   */
  connect( direction, lewisDotAtom ) {
    this.connections[ direction.id ] = lewisDotAtom;
  }

  /**
   * Unassign a lewis dot atom connection to a specific direction
   * @param {Direction} direction
   * @private
   */
  disconnect( direction ) {
    this.connections[ direction.id ] = null;
  }
}

buildAMolecule.register( 'LewisDotModel', LewisDotModel );
export default LewisDotModel;