// Copyright 2013-2017, University of Colorado Boulder

/**
 * Displays an atom and that labels it with the chemical symbol
 *
 * REVIEW: Iodine is unusable as its label is too large (very thin I). If needed, rework the scaling
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Color = require( 'SCENERY/util/Color' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Atom2} atom
   * @param {Object} options
   * @constructor
   */
  function AtomNode( atom, options ) {
    Node.call( this, _.extend( {
      cursor: 'pointer'
    }, options ) );

    this.addChild( AtomNode.getIcon( atom.element ) );

    var self = this;
    //REVIEW: This looks like it may leak memory. Worth checking into
    atom.positionProperty.link( function( modelPosition ) {
      self.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( modelPosition ) );
    } );
    atom.visibleProperty.link( function( visible ) {
      self.visible = visible;
    } );
  }

  buildAMolecule.register( 'AtomNode', AtomNode );

  // map from element symbol => graphical node for the atom, so that we can use the DAG to save overhead and costs
  var elementMap = {};

  /**
   * @param {Element} element
   * @private
   * @returns {Node}
   */
  AtomNode.getIcon = function( element ) {
    var node = elementMap[ element.symbol ];

    if ( !node ) {
      var color = new Color( element.color );
      var radius = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewDeltaX( element.covalentRadius );
      var diameter = radius * 2;

      // The body of the node
      node = new ShadedSphereNode( diameter, {
        mainColor: color,
        highlightColor: color.brighterColor( 0.5 )
      } );

      // The label for the node
      var text = new Text( element.symbol, {
        font: new PhetFont( { size: 50, weight: 'bold' } ),
        fill: AtomNode.getTextColor( color )
      } );
      text.scale( Math.min( 0.75 * diameter / text.getBounds().width, 0.75 * diameter / text.getBounds().height ) );
      text.center = Vector2.ZERO;
      node.addChild( text );

      elementMap[ element.symbol ] = node;
    }

    return node;
  };

  /**
   * Decides whether the atom node needs white text or black text.
   *
   * @param {ColorDef} color
   * @returns {ColorDef}
   * @private
   */
  AtomNode.getTextColor = function( color ) {
    return 0.30 * color.r + 0.59 * color.g + 0.11 * color.b < 125 ? '#fff' : '#000';
  };

  //REVIEW: Looks unused?
  AtomNode.oldGradient = function( radius, color ) {
    var diameter = radius * 2;
    var gCenter = new Vector2( -radius / 3, -radius / 3 );

    // copying ShadedSphereNode
    var middleRadius = diameter / 3;
    var fullRadius = middleRadius + 0.7 * diameter;

    var gradientFill = new RadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );
    gradientFill.addColorStop( 0, '#ffffff' );
    gradientFill.addColorStop( middleRadius / fullRadius, color.toCSS() );
    gradientFill.addColorStop( 1, '#000000' );
    return gradientFill;
  };

  //REVIEW: Is this unused?
  AtomNode.experimentalGradient = function( radius, baseColor ) {
    // var diameter = radius * 2;
    var gCenter = new Vector2( -radius / 5, -radius / 5 );
    var fullRadius = gCenter.minus( new Vector2( 1, 1 ).normalize().multiply( radius ) ).magnitude;
    var gradientFill = new RadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );

    gradientFill.addColorStop( 0, baseColor.colorUtilsBrighter( 0.5 ).toCSS() );
    gradientFill.addColorStop( 0.08, baseColor.colorUtilsBrighter( 0.2 ).toCSS() );
    gradientFill.addColorStop( 0.4, baseColor.colorUtilsDarker( 0.1 ).toCSS() );
    gradientFill.addColorStop( 0.8, baseColor.colorUtilsDarker( 0.4 ).toCSS() );
    gradientFill.addColorStop( 0.95, baseColor.colorUtilsDarker( 0.6 ).toCSS() );
    gradientFill.addColorStop( 1, baseColor.colorUtilsDarker( 0.4 ).toCSS() );
    return gradientFill;
  };

  //REVIEW: Is this unused?
  AtomNode.experimentalBrightGradient = function( radius, baseColor ) {
    // var diameter = radius * 2;
    var gCenter = new Vector2( -radius / 3, -radius / 3 );
    var fullRadius = gCenter.minus( new Vector2( 1, 1 ).normalize().multiply( radius ) ).magnitude;
    var gradientFill = new RadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );

    gradientFill.addColorStop( 0, baseColor.colorUtilsBrightness( 0.5 + 0.2 ).toCSS() );
    gradientFill.addColorStop( 0.08, baseColor.colorUtilsBrightness( 0.2 + 0.2 ).toCSS() );
    gradientFill.addColorStop( 0.4, baseColor.colorUtilsBrightness( -0.1 + 0.1 ).toCSS() );
    gradientFill.addColorStop( 0.8, baseColor.colorUtilsBrightness( -0.4 + 0.1 ).toCSS() );
    gradientFill.addColorStop( 0.95, baseColor.colorUtilsBrightness( -0.6 + 0 ).toCSS() );
    gradientFill.addColorStop( 1, baseColor.colorUtilsBrightness( -0.4 + 0 ).toCSS() );
    return gradientFill;
  };

  //REVIEW: This can be renamed, since it is the main thing being used. Get rid of the other unused options
  AtomNode.experimentalBrighterGradient = function( radius, baseColor ) {
    // var diameter = radius * 2;
    var gCenter = new Vector2( -radius / 3, -radius / 3 );
    var fullRadius = gCenter.minus( new Vector2( 1, 1 ).normalize().multiply( radius ) ).magnitude;
    var gradientFill = new RadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );

    gradientFill.addColorStop( 0, baseColor.colorUtilsBrightness( 0.9 ).toCSS() );
    gradientFill.addColorStop( 0.08, baseColor.colorUtilsBrightness( 0.5 ).toCSS() );
    gradientFill.addColorStop( 0.4, baseColor.colorUtilsBrightness( 0.1 ).toCSS() );
    gradientFill.addColorStop( 0.5, baseColor.toCSS() );
    gradientFill.addColorStop( 0.8, baseColor.colorUtilsBrightness( -0.3 ).toCSS() );
    gradientFill.addColorStop( 0.95, baseColor.colorUtilsBrightness( -0.6 ).toCSS() );
    gradientFill.addColorStop( 1, baseColor.colorUtilsBrightness( -0.4 ).toCSS() );
    return gradientFill;
  };

  return inherit( Node, AtomNode );
} );
