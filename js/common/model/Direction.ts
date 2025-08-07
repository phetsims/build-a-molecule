// Copyright 2020-2022, University of Colorado Boulder


/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import buildAMolecule from '../../buildAMolecule.js';

// constants
const DirectionOrientation = EnumerationDeprecated.byKeys( [ 'NORTH', 'EAST', 'SOUTH', 'WEST' ] ) as IntentionalAny;

export class DirectionValue {

  public readonly vector: Vector2;

  public readonly id: string;

  public opposite: DirectionValue | null;

  public constructor( vector: Vector2, id: string ) {

    this.vector = vector;

    this.id = id;

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
} ) as unknown as {
  NORTH: DirectionValue;
  SOUTH: DirectionValue;
  EAST: DirectionValue;
  WEST: DirectionValue;
  VALUES: DirectionValue[];
};

buildAMolecule.register( 'Direction', Direction );
export default Direction;