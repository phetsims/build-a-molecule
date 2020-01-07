// Copyright 2020, University of Colorado Boulder

/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const DIRECTION = Enumeration.byKeys( [ 'NORTH', 'EAST', 'SOUTH', 'WEST' ] );

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
  Direction.North = new Direction( new Vector2( 0, 1 ), DIRECTION.NORTH );
  Direction.East = new Direction( new Vector2( 1, 0 ), DIRECTION.EAST );
  Direction.South = new Direction( new Vector2( 0, -1 ), DIRECTION.SOUTH );
  Direction.West = new Direction( new Vector2( -1, 0 ), DIRECTION.WEST );

  // Declare direction opposites
  Direction.North.opposite = Direction.South;
  Direction.South.opposite = Direction.North;
  Direction.West.opposite = Direction.East;
  Direction.East.opposite = Direction.West;

  Direction.values = [ Direction.North, Direction.East, Direction.South, Direction.West ];

  return buildAMolecule.register( 'Direction', Direction );
} );
