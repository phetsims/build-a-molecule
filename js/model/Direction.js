// Copyright 2013-2017, University of Colorado Boulder

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
  const DIRECTION = new Enumeration( [ 'NORTH', 'EAST', 'SOUTH', 'WEST' ] );

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
  Direction.North = new Direction( new Vector2( 0, 1 ), DIRECTION.north );
  Direction.East = new Direction( new Vector2( 1, 0 ), DIRECTION.east );
  Direction.South = new Direction( new Vector2( 0, -1 ), DIRECTION.south );
  Direction.West = new Direction( new Vector2( -1, 0 ), DIRECTION.west );

  // Declare direction opposites
  Direction.North.opposite = Direction.South;
  Direction.South.opposite = Direction.North;
  Direction.West.opposite = Direction.East;
  Direction.East.opposite = Direction.West;

  Direction.values = [ Direction.North, Direction.East, Direction.South, Direction.West ];

  return buildAMolecule.register( 'Direction', Direction );
} );
