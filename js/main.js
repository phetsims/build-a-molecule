/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
require( [
    'SCENERY/Scene',
    'log',
    'view/AtomNode'
  ], function( Scene, log, AtomNode ) {
  "use strict";
  
  log( 'All Build a Molecule does is print this line to the console. Yay.' );
  
  var $container = $( '#scene-container' );
  
  var scene = new Scene( $container );
  window.debugScene = scene; // makes debugging easier. not used for actual code
  
  scene.addChild( new AtomNode() );
  
  function layout() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    log( 'layout: ' + width + 'x' + height );
    scene.resize( width, height );
  }
  window.addEventListener( 'resize', layout );
  layout();
} );
