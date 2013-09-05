// Copyright 2002-2013, University of Colorado Boulder

/*
 * 1st screen: collection boxes only take 1 molecule, and our 1st kit collection is always the same
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
define( function( require ) {
  'use strict';
  
  var Strings = require( 'Strings' );
  var Constants = require( 'Constants' );
  var ScreenView = require( 'JOIST/ScreenView' );
  
  return {
    name: Strings.title_makeMolecule,
    backgroundColor: Constants.canvasBackgroundColor,
    icon: new Rectangle( 0, 0, 100, 100, { fill: 'red' } ),
    // icon: new Image( Images.getImage( 'makeMolecule-thumbnail.png' ) ),
    createModel: function() { return {}; },
    createView: function( model ) { return new ScreenView(); }
  };
} );
