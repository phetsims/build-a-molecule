/*global module:false*/
module.exports = function( grunt ) {
  
  // print this immediately, so it is clear what project grunt is building
  grunt.log.writeln( 'Build a Molecule' );
  
  // Project configuration.
  grunt.initConfig( {
    pkg: '<json:package.json>',
    
    jshint: {
      all: [
        'Gruntfile.js', 'js/**/*.js', 'common/scenery/js/**/*.js', 'common/kite/js/**/*.js', 'common/dot/js/**/*.js', 'common/phet-core/js/**/*.js', 'common/assert/js/**/*.js'
      ],
      // adjust with options from http://www.jshint.com/docs/
      options: {
        // enforcing options
        curly: true, // brackets for conditionals
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        // noempty: true,
        nonew: true,
        // quotmark: 'single',
        undef: true,
        // unused: true, // certain layer APIs not used in cases
        // strict: true,
        // trailing: true,
        
        // relaxing options
        es5: true, // we use ES5 getters and setters for now
        loopfunc: true, // we know how not to shoot ourselves in the foot, and this is useful for _.each
        
        expr: true, // so we can use assert && assert( ... )
        
        globals: {
          // for require.js
          define: true,
          require: true,
          
          Uint16Array: false,
          Uint32Array: false,
          document: false,
          window: false,
          console: false,
          Float32Array: true, // we actually polyfill this, so allow it to be set
          
          HTMLImageElement: false,
          HTMLCanvasElement: false,
          
          $: false,
          _: false,
          clearTimeout: false,
          
          // for DOM.js
          Image: false,
          Blob: false,
          
          canvg: false
        }
      },
    }
  } );
  
  // Default task.
  grunt.registerTask( 'default', [ 'jshint' ] );
  grunt.loadNpmTasks( 'grunt-requirejs' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
};
