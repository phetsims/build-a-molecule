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

  public readonly vector: Vector2;

  public readonly id: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when EnumerationDeprecated is converted, see https://github.com/phetsims/build-a-molecule/issues/245

  public opposite: DirectionValue | null;

  /**
   * @param vector
   * @param id
   */
  public constructor( vector: Vector2, id: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when EnumerationDeprecated is converted, see https://github.com/phetsims/build-a-molecule/issues/245

    this.vector = vector;

    this.id = id;

    this.opposite = null;
  }
}

// Declare cardinal direction values
const NORTH = new DirectionValue( new Vector2( 0, 1 ), ( DirectionOrientation as any ).NORTH ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when EnumerationDeprecated is converted, see https://github.com/phetsims/build-a-molecule/issues/245
const SOUTH = new DirectionValue( new Vector2( 0, -1 ), ( DirectionOrientation as any ).SOUTH ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when EnumerationDeprecated is converted, see https://github.com/phetsims/build-a-molecule/issues/245
const EAST = new DirectionValue( new Vector2( 1, 0 ), ( DirectionOrientation as any ).EAST ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when EnumerationDeprecated is converted, see https://github.com/phetsims/build-a-molecule/issues/245
const WEST = new DirectionValue( new Vector2( -1, 0 ), ( DirectionOrientation as any ).WEST ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when EnumerationDeprecated is converted, see https://github.com/phetsims/build-a-molecule/issues/245

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