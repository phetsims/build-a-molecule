// Copyright 2020-2025, University of Colorado Boulder

/**
 * Displays an atom and labels it with the chemical symbol
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import Atom2 from '../model/Atom2.js';

// constants
// {Object.<symbol:string,Node> element symbol => graphical node for the atom, so that we can use the DAG to save
// overhead and costs
const ELEMENT_MAP: Record<string, Node> = {};
const GRABBABLE_OFFSET = 35;

type SelfOptions = {
  // No additional options for AtomNode
};

export type AtomNodeOptions = SelfOptions;

class AtomNode extends Node {

  // Public fields assigned in constructor
  public readonly atom: Atom2;
  public dragListener: DragListener | null;

  // Private fields
  private readonly translationListener: ( modelPosition: Vector2 ) => void;
  private readonly updateVisibilityListener: ( visible: boolean ) => void;

  /**
   * @param atom - The atom to display
   * @param providedOptions - Node options
   */
  public constructor( atom: Atom2, providedOptions?: AtomNodeOptions ) {
    const grabbableArea = Shape.circle( 0, 0,
      atom.covalentRadius * 0.65 > GRABBABLE_OFFSET ? GRABBABLE_OFFSET : atom.covalentRadius * 0.65
    );

    const options = optionize<AtomNodeOptions, SelfOptions>()( {
      cursor: 'pointer',
      touchArea: grabbableArea
    }, providedOptions );

    super( options );

    this.atom = atom;
    this.dragListener = null;

    // Add an atom icon
    this.addChild( AtomNode.createIcon( atom.element ) );

    this.translationListener = ( modelPosition: Vector2 ) => {
      this.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( modelPosition ) );
    };

    this.updateVisibilityListener = ( visible: boolean ) => {
      this.visible = visible;
    };
    this.atom.positionProperty.link( this.translationListener );
    this.atom.visibleProperty.link( this.updateVisibilityListener );
  }

  public override dispose(): void {
    this.atom.positionProperty.unlink( this.translationListener );
    this.atom.visibleProperty.unlink( this.updateVisibilityListener );

    super.dispose();
  }

  /**
   * Iconize the atom from a specific element
   *
   * @param element - The element to create an icon for
   * @returns The node representing the element icon
   */
  public static createIcon( element: Element ): Node {
    let node = ELEMENT_MAP[ element.symbol ];

    if ( !node ) {
      const color = element.color instanceof Color ? element.color : new Color( element.color );
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
   * @param color - The background color
   * @returns The appropriate text color (light or dark)
   */
  public static getTextColor( color: Color ): Color {
    return 0.30 * color.r + 0.59 * color.g + 0.11 * color.b < 125 ? new Color( 225, 225, 255 ) : new Color( 0, 0, 0 );
  }
}

buildAMolecule.register( 'AtomNode', AtomNode );
export default AtomNode;