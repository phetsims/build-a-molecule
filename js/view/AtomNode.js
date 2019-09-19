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

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // map from element symbol => graphical node for the atom, so that we can use the DAG to save overhead and costs
  const elementMap = {};

  class AtomNode extends Node {

    /**
     * @param {Atom2} atom
     * @param {Object} options
     */
    constructor( atom, options ) {
      super( _.extend( {
        cursor: 'pointer'
      }, options ) );

      // @public
      this.atom = atom;
      this.addChild( AtomNode.createIcon( atom.element ) );

      //REVIEW: This looks like it may leak memory. Worth checking into
      atom.positionProperty.link( modelPosition => {
        this.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( modelPosition ) );
      } );
      atom.visibleProperty.link( visible => {
        this.visible = visible;
      } );
    }

    /**
     * @param {Element} element
     * @returns {Node}
     * @private
     */
    static createIcon( element ) {
      let node = elementMap[ element.symbol ];

      if ( !node ) {
        const color = new Color( element.color );
        const radius = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewDeltaX( element.covalentRadius );
        const diameter = radius * 2;

        // The body of the node
        node = new ShadedSphereNode( diameter, {
          mainColor: color,
          highlightColor: color.brighterColor( 0.5 )
        } );

        // The label for the node
        const text = new Text( element.symbol, {
          font: new PhetFont( { size: 50, weight: 'bold' } ),
          fill: AtomNode.getTextColor( color )
        } );
        text.scale( Math.min( 0.75 * diameter / text.getBounds().width, 0.75 * diameter / text.getBounds().height ) );
        text.center = Vector2.ZERO;
        node.addChild( text );

        elementMap[ element.symbol ] = node;
      }

      return node;
    }

    /**
     * Decides whether the atom node needs white text or black text.
     *
     * @param {ColorDef} color
     * @returns {ColorDef}
     * @public
     */
    static getTextColor( color ) {
      return 0.30 * color.r + 0.59 * color.g + 0.11 * color.b < 125 ? 'white' : 'black';
    }
  }

  return buildAMolecule.register( 'AtomNode', AtomNode );
} );
