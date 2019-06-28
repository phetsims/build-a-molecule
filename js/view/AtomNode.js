// Copyright 2013-2019, University of Colorado Boulder

/**
 * Displays an atom and labels it with the chemical symbol
 *
 * REVIEW: Iodine is unusable as its label is too large (very thin I). If needed, rework the scaling
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Color = require( 'SCENERY/util/Color' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
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

    this.addChild( AtomNode.createIcon( atom.element ) );

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
   * @returns {Node}
   * @private
   */
  AtomNode.createIcon = function( element ) {
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
   * @public
   */
  AtomNode.getTextColor = function( color ) {
    return 0.30 * color.r + 0.59 * color.g + 0.11 * color.b < 125 ? 'white' : 'black';
  };

  return inherit( Node, AtomNode );
} );
