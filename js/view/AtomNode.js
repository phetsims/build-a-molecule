// Copyright 2002-2012, University of Colorado

/**
 * Displays an atom and that labels it with the chemical symbol
 *
 * NOTE: Iodine is unusable as its label is too large (very thin I). If needed, rework the scaling
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var Vector2        = require( 'DOT/Vector2' );
  
  var Inheritance    = require( 'PHETCOMMON/util/Inheritance' );
  
  var Node           = require( 'SCENERY/nodes/Node' );
  var Path           = require( 'SCENERY/nodes/Path' );
  var Text           = require( 'SCENERY/nodes/Text' );
  var Color          = require( 'SCENERY/util/Color' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  
  var Shape          = require( 'KITE/Shape' );
  
  var AtomNode = function( element, options ) {
    Node.call( this, options );
    
    this.color = new Color( element.color );
    this.radius = element.radius;
    this.diameter = this.radius * 2;
    
    var gCenter = new Vector2( -this.radius / 3, -this.radius / 3 );
    
    // copying ShadedSphereNode
    var middleRadius = this.diameter / 3;
    var fullRadius = middleRadius + 0.7 * this.diameter;
    
    var gradientFill = new RadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );
    gradientFill.addColorStop( 0, '#ffffff' );
    gradientFill.addColorStop( middleRadius / fullRadius, this.color.getCSS() );
    gradientFill.addColorStop( 1, '#000000' );
    
    this.addChild( new Path( {
      shape: Shape.circle( 0, 0, this.radius ),
      fill: gradientFill
    } ) );
    
    var isTextWhite = 0.30 * this.color.r + 0.59 * this.color.g + 0.11 * this.color.b < 125;
    
    var text = new Text( element.symbol, {
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      fontSize: 50,
      fill: isTextWhite ? '#fff' : '#000'
    } );
    text.scaleBy( Math.min( 0.65 * this.diameter / text.getBounds().width, 0.65 * this.diameter / text.getBounds().height ) );
    text.centerX = 0;
    text.centerY = 0;
    this.addChild( text );
    
    // PText labelNode = new PText() {{
    //     setText( atom.getSymbol() );
    //     setFont( new PhetFont( 10, true ) );
    //     setScale( sphericalNode.getFullBoundsReference().width * 0.65 / getFullBoundsReference().width );
    //     if ( 0.30 * atom.getColor().getRed() + 0.59 * atom.getColor().getGreen() + 0.11 * atom.getColor().getBlue() < 125 ) {
    //         setTextPaint( Color.WHITE );
    //     }
    //     setOffset( -getFullBoundsReference().width / 2, -getFullBoundsReference().height / 2 );
    // }};
    // sphericalNode.addChild( labelNode );
  };
  
  Inheritance.inheritPrototype( AtomNode, Node );
  
  return AtomNode;
} );
