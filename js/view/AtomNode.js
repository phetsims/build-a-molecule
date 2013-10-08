// Copyright 2002-2013, University of Colorado

/**
 * Displays an atom and that labels it with the chemical symbol
 *
 * NOTE: Iodine is unusable as its label is too large (very thin I). If needed, rework the scaling
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );

  var Shape = require( 'KITE/Shape' );

  var AtomNode = namespace.AtomNode = function AtomNode( atom, options ) {
    Node.call( this, _.extend( {
      cursor: 'pointer'
    }, options ) );
    
    this.addChild( AtomNode.getGraphics( atom.element ) );
    
    var that = this;
    atom.positionProperty.link( function( modelPosition ) {
      that.setTranslation( Constants.modelViewTransform.modelToViewPosition( modelPosition ) );
    } );
    atom.visibleProperty.link( function( visible ) {
      that.visible = visible;
    } );
    atom.on( 'removedFromModel', function() {
      that.detach(); // removes us from all parents
    } );
  };
  
  // map from element symbol => graphical node for the atom, so that we can use the DAG to save overhead and costs
  var elementMap = {};
  AtomNode.getGraphics = function( element ) {
    var node = elementMap[element.symbol];
    if ( node ) {
      return node;
    }
    
    var color = new Color( element.color );
    var radius = Constants.modelViewTransform.modelToViewDeltaX( element.radius );
    var diameter = radius * 2;

    var gCenter = new Vector2( -radius / 3, -radius / 3 );

    // copying ShadedSphereNode
    var middleRadius = diameter / 3;
    var fullRadius = middleRadius + 0.7 * diameter;

    var gradientFill = new RadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );
    gradientFill.addColorStop( 0, '#ffffff' );
    gradientFill.addColorStop( middleRadius / fullRadius, color.toCSS() );
    gradientFill.addColorStop( 1, '#000000' );
    
    node = new Path( Shape.circle( 0, 0, radius ), {
      fill: gradientFill
    } );

    var isTextWhite = AtomNode.needsWhiteColor( color );

    var text = new Text( element.symbol, {
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      fontSize: 50,
      fill: isTextWhite ? '#fff' : '#000',
      boundsMethod: 'fast'
    } );
    text.scale( Math.min( 0.75 * diameter / text.getBounds().width, 0.75 * diameter / text.getBounds().height ) );
    text.centerX = 0;
    text.centerY = 0;
    node.addChild( text );
    
    elementMap[element.symbol] = node;
    return node;
  };
  
  AtomNode.needsWhiteColor = function( color ) {
    return 0.30 * color.r + 0.59 * color.g + 0.11 * color.b < 125;
  };

  return inherit( Node, AtomNode );
} );
