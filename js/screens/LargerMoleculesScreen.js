// Copyright 2002-2013, University of Colorado Boulder

/*
 * 3rd screen. Shows kits below as normal, but without collection boxes. Instead, the user is presented with an option of a 3D view
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
    name: Strings.title_largerMolecules,
    backgroundColor: Constants.canvasBackgroundColor,
    icon: new Rectangle( 0, 0, 548, 373, { fill: 'blue' } ),
    // icon: new Image( Images.getImage( 'largerMolecules-thumbnail.png' ) ),
    createModel: function() { return { step: function( timeElapsed ) {} }; },
    createView: function( model ) { return new ScreenView(); }
  };
} );
