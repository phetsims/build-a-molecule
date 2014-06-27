// Copyright 2002-2014, University of Colorado

/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Vector2 = require( 'DOT/Vector2' );

  var Direction = namespace.Direction = function Direction( vector, id ) {
    this.vector = vector;
    this.id = id;
  };

  Direction.North = new Direction( new Vector2( 0, 1 ), 'north' );
  Direction.East = new Direction( new Vector2( 1, 0 ), 'east' );
  Direction.South = new Direction( new Vector2( 0, -1 ), 'south' );
  Direction.West = new Direction( new Vector2( -1, 0 ), 'west' );

  Direction.North.opposite = Direction.South;
  Direction.South.opposite = Direction.North;
  Direction.West.opposite = Direction.East;
  Direction.East.opposite = Direction.West;

  Direction.values = [Direction.North, Direction.East, Direction.South, Direction.West];

  return Direction;
} );
