/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
require( [
    'DOT/Vector2',
    'SCENERY/Scene',
    'SCENERY/nodes/Node',
    'SCENERY/input/SimpleDragHandler',
    'SCENERY/util/Util',
    'CHEMISTRY/Element',
    'PHETCOMMON/model/Bucket',
    '../scenery-phet/js/bucket/BucketFront.js',
    '../scenery-phet/js/bucket/BucketHole.js',
    'log',
    'view/AtomNode',
    'model/Atom2'
  ], function( Vector2, Scene, Node, SimpleDragHandler, SceneryUtil, Element, Bucket, BucketFront, BucketHole, log, AtomNode, Atom2 ) {
  "use strict";
  
  log( 'All Build a Molecule does is print this line to the console. Yay.' );
  
  var $container = $( '#scene-container' );
  
  var scene = new Scene( $container, {
    // scenery options here
    renderer: 'svg'
  } );
  window.debugScene = scene; // makes debugging easier. not used for actual code
  
  scene.addChild( new AtomNode( Element.O, {
    x: 100,
    y: 100
  } ) );
  
  scene.addChild( new AtomNode( Element.H, {
    x: 250,
    y: 100
  } ) );
  
  scene.addChild( new AtomNode( Element.C, {
    x: 400,
    y: 100
  } ) );
  
  scene.addChild( new AtomNode( Element.N, {
    x: 100,
    y: 300
  } ) );
  
  scene.addChild( new AtomNode( Element.Cl, {
    x: 300,
    y: 300
  } ) );
  
  scene.addChild( new AtomNode( Element.F, {
    x: 600,
    y: 300
  } ) );
  
  scene.addChild( new AtomNode( Element.B, {
    x: 100,
    y: 550
  } ) );
  
  scene.addChild( new AtomNode( Element.Si, {
    x: 400,
    y: 550
  } ) );
  
  scene.addChild( new AtomNode( Element.P, {
    x: 700,
    y: 550
  } ) );
  
  scene.addChild( new AtomNode( Element.Br, {
    x: 1000,
    y: 150
  } ) );
  
  scene.addChild( new AtomNode( Element.I, {
    x: 1000,
    y: 400
  } ) );
  
  var bucket = new Bucket( {
    x: 600,
    y: 100,
    width: 200,
    height: 50,
    baseColor: Element.O.color,
    caption: 'Oxygen'
  } );
  scene.addChild( new Node( { children: [
    new BucketHole( bucket ),
    new BucketFront( bucket )
  ] } ) );
  bucket = new Bucket( {
    x: 600,
    y: 170,
    width: 150,
    height: 50,
    baseColor: Element.N.color,
    caption: 'Nitrogen'
  } );
  scene.addChild( new Node( { children: [
    new BucketHole( bucket ),
    new BucketFront( bucket )
  ] } ) );
  bucket = new Bucket( {
    x: 600,
    y: 30,
    width: 300,
    height: 50,
    baseColor: Element.C.color,
    caption: 'Carbon'
  } );
  scene.addChild( new Node( { children: [
    new BucketHole( bucket ),
    new BucketFront( bucket )
  ] } ) );
  
  _.each( scene.children, function( child ) {
    child.addInputListener( new SimpleDragHandler() );
  } );
  
  var atom = new Atom2( Element.N );
  atom.on( 'change:position', function( value, oldValue ) {
    console.log( 'changed position from ' + oldValue.toString() + ' to ' + value.toString() );
  } );
  atom.on( 'change:destination', function( value, oldValue ) {
    console.log( 'changed destination from ' + oldValue.toString() + ' to ' + value.toString() );
  } );
  atom.position = new Vector2( 4, 7 );
  atom.position = new Vector2( 1, 2 );
  atom.positionAndDestination = new Vector2( -1, -1 );
  
  /*---------------------------------------------------------------------------*
  * Layout
  *----------------------------------------------------------------------------*/
  
  function layout() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    log( 'layout: ' + width + 'x' + height );
    scene.resize( width, height );
  }
  window.addEventListener( 'resize', layout );
  layout();
  
  /*---------------------------------------------------------------------------*
  * Event loop
  *----------------------------------------------------------------------------*/
  
  SceneryUtil.polyfillRequestAnimationFrame();
  
  var lastTime = 0;
  var timeElapsed = 0;
  function tick() {
    window.requestAnimationFrame( tick, $container[0] );
    
    var timeNow = new Date().getTime();
    if ( lastTime != 0 ) {
      timeElapsed = (timeNow - lastTime) / 1000.0;
    }
    lastTime = timeNow;
    
    // stats.begin();
    scene.updateScene(); // repaints dirty regions. use renderScene() to render everything
    // stats.end();
  }
  window.requestAnimationFrame( tick, $container[0] );
  
  scene.initializeStandaloneEvents();
} );
