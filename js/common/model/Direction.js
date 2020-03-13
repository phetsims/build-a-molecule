// Copyright 2020, University of Colorado Boulder

/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import buildAMolecule from '../../buildAMolecule.js';

// constants
const DirectionOrientation = Enumeration.byKeys( [ 'NORTH', 'EAST', 'SOUTH', 'WEST' ] );

class Direction {
  /**
   * @param {Vector2} vector
   * @param {string} id
   * @constructor
   */
  constructor( vector, id ) {
    this.vector = vector;
    this.id = id;
  }
}

// Declare directions
Direction.North = new Direction( new Vector2( 0, 1 ), DirectionOrientation.NORTH );
Direction.East = new Direction( new Vector2( 1, 0 ), DirectionOrientation.EAST );
Direction.South = new Direction( new Vector2( 0, -1 ), DirectionOrientation.SOUTH );
Direction.West = new Direction( new Vector2( -1, 0 ), DirectionOrientation.WEST );

// Declare direction opposites
Direction.North.opposite = Direction.South;
Direction.South.opposite = Direction.North;
Direction.West.opposite = Direction.East;
Direction.East.opposite = Direction.West;

Direction.values = [ Direction.North, Direction.East, Direction.South, Direction.West ];

buildAMolecule.register( 'Direction', Direction );
export default Direction;