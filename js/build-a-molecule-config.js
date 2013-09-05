// Copyright 2002-2013, University of Colorado

/**
 * Build a Molecule configuration file.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

// flag is set so we can ensure that the config has executed. This prevents various Require.js dynamic loading timeouts and script errors
window.loadedBuildAMoleculeConfig = true;

require.config( {
  // just depends on BAM dependencies. strip out parts from our dependencies that we don't need.
  deps: [ 'build-a-molecule-main' ],
  
  config: {
    i18n: {
      locale: "en_us" // default for development
    }
  },
  
  paths: {
    // third-party libs
    i18n: '../lib/i18n-2.0.2',
    
    // PhET libs, uppercase names to identify them in require.js imports
    ASSERT: '../../assert/js',
    AXON: '../../axon/js',
    DOT: '../../dot/js',
    JOIST: '../../joist/js',
    KITE: '../../kite/js',
    NITROGLYCERIN: '../../nitroglycerin/js',
    PHET_CORE: '../../phet-core/js',
    PHETCOMMON: '../../phetcommon/js',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    SUN: '../../sun/js'
  },
  
  urlArgs: new Date().getTime() // add cache buster query string to make browser refresh actually reload everything
} );
