// Copyright 2002-2014, University of Colorado

/**
 * Build a Molecule configuration file.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

require.config( {
  // just depends on BAM dependencies. strip out parts from our dependencies that we don't need.
  deps: [ 'build-a-molecule-main' ],

  paths: {

    // require.js plugins
    audio: '../../chipper/js/requirejs-plugins/audio',
    image: '../../chipper/js/requirejs-plugins/image',
    mipmap: '../../chipper/js/requirejs-plugins/mipmap',
    string: '../../chipper/js/requirejs-plugins/string',

    // third-party libs
    text: '../../sherpa/lib/text-2.0.12',

    // PhET libs, uppercase names to identify them in require.js imports
    AXON: '../../axon/js',
    BRAND: '../../brand/' + phet.chipper.getBrandName() + '/js',
    DOT: '../../dot/js',
    JOIST: '../../joist/js',
    KITE: '../../kite/js',
    NITROGLYCERIN: '../../nitroglycerin/js',
    PHET_CORE: '../../phet-core/js',
    PHETCOMMON: '../../phetcommon/js',
    REPOSITORY: '..',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    SHERPA: '../../sherpa',
    SUN: '../../sun/js',
    VEGAS: '../../vegas/js',
    VIBE: '../../vibe/js',

    BUILD_A_MOLECULE: '.'
  },

  waitSeconds: 30, // because the sim's data files are big

  // optional cache buster to make browser refresh load all included scripts, can be disabled with ?cacheBuster=false
  urlArgs: phet.chipper.getCacheBusterArgs()
} );
