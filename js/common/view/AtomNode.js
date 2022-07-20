// Copyright 2020-2022, University of Colorado Boulder

/**
 * Displays an atom and labels it with the chemical symbol
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

// constants
// {Object.<symbol:string,Node> element symbol => graphical node for the atom, so that we can use the DAG to save
// overhead and costs
const ELEMENT_MAP = {};
const GRABBABLE_OFFSET = 35;

class AtomNode extends Node {

  /**
   * @param {Atom2} atom
   * @param {Object} [options]
   */
  constructor( atom, options ) {
    const grabbableArea = Shape.circle( 0, 0,
      atom.covalentRadius * 0.65 > GRABBABLE_OFFSET ? GRABBABLE_OFFSET : atom.covalentRadius * 0.65
    );
    super( merge( {
      cursor: 'pointer',
      touchArea: grabbableArea
    }, options ) );

    // @public {Atom2}
    this.atom = atom;

    // @public {DragListener|null}
    this.dragListener = null;

    // Add an atom icon
    this.addChild( AtomNode.createIcon( atom.element ) );

    // @private {function}
    this.translationListener = modelPosition => {
      this.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( modelPosition ) );
    };

    // @private {function}
    this.updateVisibilityListener = visible => {
      this.visible = visible;
    };
    this.atom.positionProperty.link( this.translationListener );
    this.atom.visibleProperty.link( this.updateVisibilityListener );
  }

  /**
   * @override
   * @public
   */
  dispose() {
    this.atom.positionProperty.unlink( this.translationListener );
    this.atom.visibleProperty.unlink( this.updateVisibilityListener );

    super.dispose();
  }

  /**
   * Iconize the atom from a specific element
   *
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
   * @param {Color} color
   *
   * @public
   * @returns {Color}
   */
  static getTextColor( color ) {
    return 0.30 * color.r + 0.59 * color.g + 0.11 * color.b < 125 ? new Color( 225, 225, 255 ) : new Color( 0, 0, 0 );
  }
}

buildAMolecule.register( 'AtomNode', AtomNode );
export default AtomNode;