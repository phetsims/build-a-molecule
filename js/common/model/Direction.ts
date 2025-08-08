// Copyright 2020-2025, University of Colorado Boulder


/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildAMolecule from '../../buildAMolecule.js';

// Direction enumeration class with vector and opposite properties
class Direction extends EnumerationValue {
  public readonly vector: Vector2;
  public readonly id: string;
  public opposite!: Direction;

  // Define the enumeration values
  public static readonly NORTH = new Direction( new Vector2( 0, 1 ), 'NORTH' );
  public static readonly SOUTH = new Direction( new Vector2( 0, -1 ), 'SOUTH' );
  public static readonly EAST = new Direction( new Vector2( 1, 0 ), 'EAST' );
  public static readonly WEST = new Direction( new Vector2( -1, 0 ), 'WEST' );

  public static readonly enumeration = new Enumeration( Direction );

  // Legacy compatibility - provide VALUES array
  public static readonly VALUES = [ Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST ];

  public constructor( vector: Vector2, id: string ) {
    super();
    this.vector = vector;
    this.id = id;
  }
}

// Set up the opposite relationships
Direction.NORTH.opposite = Direction.SOUTH;
Direction.SOUTH.opposite = Direction.NORTH;
Direction.EAST.opposite = Direction.WEST;
Direction.WEST.opposite = Direction.EAST;

// Export DirectionValue as a type alias for backward compatibility
export type DirectionValue = Direction;

buildAMolecule.register( 'Direction', Direction );
export default Direction;