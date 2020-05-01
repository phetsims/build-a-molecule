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

// constants
const DirectionOrientation = Enumeration.byKeys( [ 'NORTH', 'EAST', 'SOUTH', 'WEST' ] );

//REVIEW: a rich-style enumeration should probably be used here, using Enumeration.byMap() so that we can provide the
//REVIEW: directions. We'll then get Direction.values for free, and this is essentially an enumeration.
//REVIEW: Probably will need to use beforeFreeze to specify the connecting data, e.g. in that callback, you can
//REVIEW: execute the "opposite direction" setters, etc.

class Direction {
  /**
   * @param {Vector2} vector
   * @param {string} id REVIEW: Currently doesn't seem to be a string, seems like it's enumeration values
   */
  constructor( vector, id ) {

    // @public {Vector2}
    this.vector = vector;

    // @public {number} REVIEW: Doesn't seem to be a string (as above) or a number (here), currently an enumeration value
    this.id = id;
  }
}

//REVIEW: If we're using a class, these would require visibilities/types. Prefer the Enumeration above significantly

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