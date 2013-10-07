// Copyright 2002-2013, University of Colorado

/**
 * 3D Molecule display that takes up the entire screen
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );

  var Molecule3DNode = namespace.Molecule3DNode = function Molecule3DNode( completeMolecule, trail ) {
    var that = this;
    Node.call( this, {} );
    
    var useHighRes = false;
    
    
    var scene = trail.rootNode();
    var view = _.find( trail.nodes, function( node ) { return node.isBAMView; } );
    
    var background = new Rectangle( 0, 0, 50, 50, { fill: 'rgba(0,0,0,0.7)' } );
    this.addChild( background );
    
    var width = 0;
    var height = 0;
    var matrix = trail.getMatrix();
    
    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( '2d' );
    
    var backingScale = 1;
    if ( useHighRes ) {
      backingScale = Util.backingScale( context );
    }
    
    canvas.className = 'canvas-3d';
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    var dom = new DOM( canvas );
    this.addChild( dom );
    
    function updateLayout() {
      var sceneWidth = window.innerWidth;
      var sceneHeight = window.innerHeight;
      var newMatrix = trail.getMatrix();
      if ( sceneWidth === width && sceneHeight === height && matrix.equals( newMatrix ) ) {
        return;
      }
      width = sceneWidth;
      height = sceneHeight;
      matrix = newMatrix;
      
      background.rectWidth = width;
      background.rectHeight = height;
      
      var radius = 200;
      var centerX = Constants.stageSize.width / 2;
      var centerY = Constants.stageSize.height / 2;
      var bounds = new Bounds2( centerX - radius, centerY - radius, centerX + radius, centerY + radius );
      var globalBounds = view.localToGlobalBounds( bounds ).roundedOut();
      
      canvas.width = globalBounds.width * backingScale;
      canvas.height = globalBounds.height * backingScale;
      canvas.style.width = globalBounds.width + 'px';
      canvas.style.height = globalBounds.height + 'px';
      canvas.style.left = globalBounds.x + 'px';
      canvas.style.top = globalBounds.y + 'px';
      context.clearRect( 0, 0, canvas.width, canvas.height );
      context.fillStyle = 'rgba(0,255,0,0.5)';
      context.fillRect( 0, 0, canvas.width, canvas.height );
      dom.invalidateSelf( globalBounds );
    }
    updateLayout();
    scene.addEventListener( 'resize', updateLayout );
    view.addEventListener( 'bounds', updateLayout );
    
    scene.addChild( this );
    
    this.addInputListener( {
      up: function( evt ) {
        scene.removeEventListener( 'resize', updateLayout );
        view.removeEventListener( 'bounds', updateLayout );
        scene.removeChild( that );
      }
    } );
  };

  return inherit( Node, Molecule3DNode );
} );
