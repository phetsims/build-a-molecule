// Copyright 2002-2013, University of Colorado

/**
 * Build a Molecule configuration file for development purposes, NOT for production deployments.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

// if has.js is included, set assertion flags to true (so we can catch errors during development)
if ( window.has ) {
  window.has.add( 'development', function( global, document, anElement ) {
    return true;
  } );
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
  
  config: {
    i18n: {
      locale: "en_us" // default for development
    }
  },
  
  paths: {
    // Common repos
    SCENERY: '../../scenery/js',
    // SCENERY: '../common/scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    // SCENERY_PHET: '../common/scenery-phet/js',
    KITE: '../../kite/js',
    // KITE: '../common/kite/js',
    DOT: '../../dot/js',
    // DOT: '../common/dot/js',
    PHET_CORE: '../../phet-core/js',
    // PHET_CORE: '../common/phet-core/js',
    ASSERT: '../../assert/js',
    // ASSERT: '../common/assert/js',
    AXON: '../../axon/js',
    //AXON: '../../common/axon/js',
    PHETCOMMON: '../../phetcommon/js',
    // PHETCOMMON: '../common/phetcommon/js',
    CHEMISTRY: '../../chemistry/js', // temporarily not using chemistry repo, using model version instead
    // CHEMISTRY: '../common/chemistry/js',
    FORT: '../../fort/js',
    // FORT: '../common/fort/js',
    
    underscore: '../contrib/lodash.min-1.0.0-rc.3',
    jquery: '../contrib/jquery-1.8.3.min',
    backbone: '../contrib/backbone-0.9.10',
    i18n: "../contrib/i18n-2.0.2",
    tpl: "../contrib/tpl-0.2"
  },
  
  shim: {
    underscore: { exports: '_' },
    jquery: { exports: '$' },
    backbone: { exports: 'Backbone' }
  },
  
  urlArgs: new Date().getTime() // add cache buster query string to make browser refresh actually reload everything
} );
