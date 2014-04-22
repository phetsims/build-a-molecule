// Copyright 2002-2014, University of Colorado

/**
 * Build a Molecule configuration file.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

// flag is set so we can ensure that the config has executed. This prevents various Require.js dynamic loading timeouts and script errors
window.loadedBuildAMoleculeConfig = true;

require.config( {
  // just depends on BAM dependencies. strip out parts from our dependencies that we don't need.
  deps: [ 'build-a-molecule-main' ],

  paths: {
    // require.js plugins
    image: '../../chipper/requirejs-plugins/image',
    audio: '../../chipper/requirejs-plugins/audio',
    string: '../../chipper/requirejs-plugins/string',
    text: '../../sherpa/text',

    // PhET libs, uppercase names to identify them in require.js imports
    ASSERT: '../../assert/js',
    AXON: '../../axon/js',
    BRAND: '../../brand/js',
    DOT: '../../dot/js',
    JOIST: '../../joist/js',
    KITE: '../../kite/js',
    NITROGLYCERIN: '../../nitroglycerin/js',
    PHET_CORE: '../../phet-core/js',
    PHETCOMMON: '../../phetcommon/js',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    SHERPA: '../../sherpa',
    SUN: '../../sun/js',
    VEGAS: '../../vegas/js',
    VIBE: '../../vibe/js',

    BAM: '.'
  },
  
  waitSeconds: 30, // because the sim's data files are big

  urlArgs: new Date().getTime() // add cache buster query string to make browser refresh actually reload everything
} );
