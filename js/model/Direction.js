// Copyright 2002-2013, University of Colorado

/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var Vector2 = require( 'DOT/Vector2' );
  
  var Direction = namespace.Direction = function Direction( vector ) {
    this.vector = vector;
  };
  
  Direction.prototype = {
    constructor: Direction,
    
    
  };
  
  Direction.North = new Direction( new Vector2( 0, 1 ) );
  Direction.East = new Direction( new Vector2( 1, 0 ) );
  Direction.South = new Direction( new Vector2( 0, -1 ) );
  Direction.West = new Direction( new Vector2( -1, 0 ) );
  
  Direction.North.opposite = Direction.South;
  Direction.South.opposite = Direction.North;
  Direction.West.opposite = Direction.East;
  Direction.East.opposite = Direction.West;
  
  return Direction;
} );
