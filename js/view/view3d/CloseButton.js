// Copyright 2002-2013, University of Colorado

/**
 * Close button (circle with an X) to close the 3D display
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PushButton = require( 'SUN/PushButton' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  
  var CloseButton = namespace.CloseButton = function CloseButton( callback, options ) {
    var outside = 20;
    var inside = 9;
    var shape = new Shape().circle( 0, 0, outside )      // outside circle
                             .moveTo( -inside, -inside ) // X line 1
                             .lineTo( inside, inside )
                             .moveTo( inside, -inside )  // X line 2
                             .lineTo( -inside, inside );
    var commonOptions = {
      lineWidth: 4,
      lineCap: 'round'
    };
    var upNode = new Path( shape, _.extend( { stroke: '#eee', fill: '#000' }, commonOptions ) );
    var overNode = new Path( shape, _.extend( { stroke: '#fff', fill: '#666' }, commonOptions ) );
    var downNode = new Path( shape, _.extend( { stroke: '#fff', fill: '#000' }, commonOptions ) );
    var disabledNode = new Path( shape, _.extend( { stroke: '#444', fill: '#000' }, commonOptions ) );
    PushButton.call( this, upNode, overNode, downNode, disabledNode, callback, options );
  };
  
  return inherit( PushButton, CloseButton );
} );
