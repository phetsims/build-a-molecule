// Copyright 2002-2013, University of Colorado Boulder

/*
 * 2nd screen. Collection boxes take multiple molecules of the same type, and start off with a different kit collection each time
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
define( function( require ) {
  'use strict';
  
  var Strings = require( 'Strings' );
  var Constants = require( 'Constants' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  
  return {
    name: Strings.title_collectMultiple,
    backgroundColor: Constants.canvasBackgroundColor,
    icon: new Rectangle( 0, 0, 548, 373, { fill: 'green' } ),
    // icon: new Image( Images.getImage( 'collectMultiple-thumbnail.png' ) ),
    createModel: function() { return { step: function( timeElapsed ) {} }; },
    createView: function( model ) { return new ScreenView(); }
  };
} );
