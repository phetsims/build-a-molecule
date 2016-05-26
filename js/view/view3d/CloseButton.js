// Copyright 2013-2015, University of Colorado Boulder

/**
 * Close button (circle with an X) to close the 3D display
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NodesPushButton = require( 'SUN/buttons/NodesPushButton' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  function CloseButton( callback, options ) {
    var outside = 20;
    var inside = 9;
    var shape = new Shape()
      .circle( 0, 0, outside )    // outside circle
      .moveTo( -inside, -inside ) // X line 1
      .lineTo( inside, inside )
      .moveTo( inside, -inside )  // X line 2
      .lineTo( -inside, inside );
    var commonOptions = {
      lineWidth: 4,
      lineCap: 'round'
    };
    var idleNode = new Path( shape, _.extend( { stroke: '#eee', fill: '#000' }, commonOptions ) );
    var overNode = new Path( shape, _.extend( { stroke: '#fff', fill: '#666' }, commonOptions ) );
    var pressedNode = new Path( shape, _.extend( { stroke: '#fff', fill: '#000' }, commonOptions ) );
    var disabledNode = new Path( shape, _.extend( { stroke: '#444', fill: '#000' }, commonOptions ) );

    options.listener = callback; //TODO consider replacing the constructor callback parameter with an option so we don't need to do this.
    NodesPushButton.call( this, idleNode, overNode, pressedNode, disabledNode, options );
    this.touchArea = new Shape().circle( 0, 0, outside + 40 );
  }
  buildAMolecule.register( 'CloseButton', CloseButton );

  return inherit( NodesPushButton, CloseButton );
} );
