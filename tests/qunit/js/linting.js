(function() {
  'use strict';

  module( 'Build a Molecule: JSHint' );

  unitTestLintFilesMatching( function( src ) {
    return src.indexOf( 'build-a-molecule/js' ) !== -1;
  } );
})();
