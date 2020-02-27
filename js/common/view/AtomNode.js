// Copyright 2020, University of Colorado Boulder

/**
 * Displays an atom and labels it with the chemical symbol
 *
 * REVIEW: Iodine is unusable as its label is too large (very thin I). If needed, rework the scaling
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

// constants
// map from element symbol => graphical node for the atom, so that we can use the DAG to save overhead and costs
const ELEMENT_MAP = {};
const GRABBABLE_OFFSET = 35;

class AtomNode extends Node {

  /**
   * @param {Atom2} atom
   * @param {Object} [options]
   */
  constructor( atom, options ) {
    const grabbableArea = Shape.circle( 0, 0, atom.covalentRadius * 0.65 > GRABBABLE_OFFSET ? GRABBABLE_OFFSET : atom.covalentRadius * 0.65 );
    super( merge( {
      cursor: 'pointer',
      touchArea: grabbableArea
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
    let node = ELEMENT_MAP[ element.symbol ];

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

      ELEMENT_MAP[ element.symbol ] = node;
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

buildAMolecule.register( 'AtomNode', AtomNode );
export default AtomNode;