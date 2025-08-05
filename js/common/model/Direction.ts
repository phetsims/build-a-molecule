// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import buildAMolecule from '../../buildAMolecule.js';

// constants
const DirectionOrientation = EnumerationDeprecated.byKeys( [ 'NORTH', 'EAST', 'SOUTH', 'WEST' ] );

class DirectionValue {
  /**
   * @param {Vector2} vector
   * @param {string} id
   */
  constructor( vector, id ) {

    // @public {Vector2}
    this.vector = vector;

    // @public {number}
    this.id = id;

    // @public {DirectionValue}
    this.opposite = null;
  }
}

// Declare cardinal direction values
const NORTH = new DirectionValue( new Vector2( 0, 1 ), DirectionOrientation.NORTH );
const SOUTH = new DirectionValue( new Vector2( 0, -1 ), DirectionOrientation.SOUTH );
const EAST = new DirectionValue( new Vector2( 1, 0 ), DirectionOrientation.EAST );
const WEST = new DirectionValue( new Vector2( -1, 0 ), DirectionOrientation.WEST );

// Declare opposites
NORTH.opposite = SOUTH;
SOUTH.opposite = NORTH;
EAST.opposite = WEST;
WEST.opposite = EAST;

const Direction = EnumerationDeprecated.byMap( {
  NORTH: NORTH,
  SOUTH: SOUTH,
  EAST: EAST,
  WEST: WEST
} );

buildAMolecule.register( 'Direction', Direction );
export default Direction;