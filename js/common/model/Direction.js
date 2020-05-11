// Copyright 2020, University of Colorado Boulder

/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import buildAMolecule from '../../buildAMolecule.js';

class DirectionValue {
  /**
   * @param {Vector2} vector
   */
  constructor( vector ) {

    // @public {Vector2}
    this.vector = vector;

    // @public {DirectionValue}
    this.opposite = null;
  }
}

// Declare cardinal direction values
const NORTH = new DirectionValue( new Vector2( 0, 1 ) );
const SOUTH = new DirectionValue( new Vector2( 0, -1 ) );
const EAST = new DirectionValue( new Vector2( 1, 0 ) );
const WEST = new DirectionValue( new Vector2( -1, 0 ) );

// Declare opposites
NORTH.opposite = SOUTH;
SOUTH.opposite = NORTH;
EAST.opposite = WEST;
WEST.opposite = EAST;

const Direction = Enumeration.byMap( {
  NORTH: NORTH,
  SOUTH: SOUTH,
  EAST: EAST,
  WEST: WEST
} );

buildAMolecule.register( 'Direction', Direction );
export default Direction;