// Copyright 2002-2012, University of Colorado

/**
 * Build a Molecule configuration file for development purposes, NOT for production deployments.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

// if has.js is included, set assertion flags to true (so we can catch errors during development)
if ( window.has ) {
  window.has.add( 'assert.build-a-molecule', function( global, document, anElement ) {
    return true;
  } );
  window.has.add( 'assert.kite', function( global, document, anElement ) {
    return true;
  } );
  window.has.add( 'assert.kite.extra', function( global, document, anElement ) {
    return true;
  } );
  window.has.add( 'assert.scenery', function( global, document, anElement ) {
    return true;
  } );
  window.has.add( 'assert.scenery.extra', function( global, document, anElement ) {
    return true;
  } );
}

// flag is set so we can ensure that the config has executed. This prevents various Require.js dynamic loading timeouts and script errors
window.loadedBuildAMoleculeConfig = true;

require.config( {
  // just depends on BAM dependencies. strip out parts from our dependencies that we don't need.
  deps: [ 'main' ],
  
  paths: {
    underscore: '../contrib/lodash.min-1.0.0-rc.3',
    jquery: '../contrib/jquery-1.8.3.min',
    SCENERY: '../common/scenery/js',
    KITE: '../common/kite/js',
    DOT: '../common/dot/js',
    ASSERT: '../common/assert/js',
    PHETCOMMON: '../common/phetcommon/js',
    CHEMISTRY: '../common/chemistry/js',
    i18n: "../contrib/i18n-2.0.2",
    tpl: "../contrib/tpl-0.2"
  },
  
  shim: {
    underscore: { exports: '_' },
    jquery: { exports: '$' }
  },
  
  urlArgs: new Date().getTime() // add cache buster query string to make browser refresh actually reload everything
} );
