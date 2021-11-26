// Copyright 2020-2021, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import { FireListener } from '../../../../scenery/js/imports.js';
import { Circle } from '../../../../scenery/js/imports.js';
import { Line } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import scissorsClosedUpCursorImage from '../../../images/scissors-closed-up_cur.js';
import scissorsClosedUpImage from '../../../images/scissors-closed-up_png.js';
import scissorsClosedCursorImage from '../../../images/scissors-closed_cur.js';
import scissorsClosedImage from '../../../images/scissors-closed_png.js';
import scissorsUpCursorImage from '../../../images/scissors-up_cur.js';
import scissorsUpImage from '../../../images/scissors-up_png.js';
import scissorsCursorImage from '../../../images/scissors_cur.js';
import scissorsImage from '../../../images/scissors_png.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import Direction from '../model/Direction.js';

/* Notes on .cur file generation, all from the images directory, with "sudo apt-get install icoutils" for icotool:
 icotool -c -o scissors.ico scissors.png
 icotool -c -o scissors-closed.ico scissors-closed.png
 icotool -c -o scissors-up.ico scissors-up.png
 icotool -c -o scissors-closed-up.ico scissors-closed-up.png

 ./ico2cur.py scissors.ico -x 11 -y 10
 ./ico2cur.py scissors-closed.ico -x 13 -y 7
 ./ico2cur.py scissors-up.ico -x 10 -y 11
 ./ico2cur.py scissors-closed-up.ico -x 7 -y 13
 */

const images = {
  'scissors.png': scissorsImage,
  'scissors-closed.png': scissorsClosedImage,
  'scissors-up.png': scissorsUpImage,
  'scissors-closed-up.png': scissorsClosedUpImage,
  'scissors.cur': scissorsCursorImage,
  'scissors-closed.cur': scissorsClosedCursorImage,
  'scissors-up.cur': scissorsUpCursorImage,
  'scissors-closed-up.cur': scissorsClosedUpCursorImage
};
const bondRadius = 6; // "Radius" of the bond target that will break the bond

class MoleculeBondNode extends Node {
  /**
   * @param {Bond} bond
   * @param {Kit} kit
   */
  constructor( bond, kit ) {
    super( {} );

    // @private {Atom2}
    this.a = bond.a;

    // @private {Atom2}
    this.b = bond.b;

    // @private {Kit}
    this.kit = kit;

    // Use the lewis dot model to get our bond direction
    const bondDirection = kit.getBondDirection( this.a, this.b );
    const isHorizontal = bondDirection === Direction.WEST || bondDirection === Direction.EAST;

    // Define images for opened and closed scissors
    let openFile = 'scissors';
    let closedFile = 'scissors-closed';
    if ( isHorizontal ) {
      openFile += '-up';
      closedFile += '-up';
    }
    openFile += '.png';
    closedFile += '.png';

    const scissorsOpen = images[ openFile ]; // 23x20 or 20x23
    const scissorsClosed = images[ closedFile ]; //26x15 or 15x26
    const backup = ( isHorizontal ? 'col-resize' : 'row-resize' );

    // Offsets should center this
    const openCursor = `url(${scissorsOpen.src}) ${isHorizontal ? '10 11' : '11 10'}, ${backup}`;
    const closedCursor = `url(${scissorsClosed.src}) ${isHorizontal ? '7 13' : '13 7'}, ${backup}`;

    // Cut here icon is subject to change. See https://github.com/phetsims/build-a-molecule/issues/113
    const cutTargetNode = new Node();

    // Add dashed line
    const dashedLine = new Line( -15, 0, 15, 0, {
      stroke: 'black',
      lineDash: [ 4.5, 2 ],
      lineWidth: 1
    } );
    cutTargetNode.addChild( dashedLine );
    if ( isHorizontal ) {
      dashedLine.rotate( Math.PI / 2 );
    }

    // Add inner circle
    cutTargetNode.addChild( new Circle( bondRadius, {
      fill: 'rgb(253,225,49)',
      stroke: 'rgb(253,225,49)',
      cursor: openCursor,
      visible: true
    } ) );

    // Add outer circle
    cutTargetNode.addChild( new Circle( bondRadius * 1.5, {
      fill: 'rgba(253,225,49,0.4)',
      cursor: openCursor,
      visible: true
    } ) );

    cutTargetNode.addInputListener( new FireListener( {
      fireOnDown: true,
      fire() {
        cutTargetNode.cursor = closedCursor;
        kit.breakBond( bond.a, bond.b );
      }
    } ) );
    this.addChild( cutTargetNode );

    // @private {function} Listener that will update the position of our hit target
    this.positionListener = () => {
      const orientation = this.b.positionProperty.value.minus( this.a.positionProperty.value );
      if ( orientation.magnitude > 0 ) {
        orientation.normalize();
      }
      const position = orientation.times( this.a.covalentRadius ).plus( this.a.positionProperty.value );
      this.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( position ) );
    };

    // @private {function(Atom2)}
    this.toggleTargetVisibility = selectedAtom => {
      cutTargetNode.visible = selectedAtom === this.a || selectedAtom === this.b;
    };

    // Link relevant elements
    this.kit.selectedAtomProperty.link( this.toggleTargetVisibility );
    this.a.positionProperty.link( this.positionListener );
    this.b.positionProperty.link( this.positionListener );
  }

  /**
   * @override
   * @public
   */
  dispose() {
    this.kit.selectedAtomProperty.unlink( this.toggleTargetVisibility );
    this.a.positionProperty.unlink( this.positionListener );
    this.b.positionProperty.unlink( this.positionListener );

    super.dispose();
  }
}

buildAMolecule.register( 'MoleculeBondNode', MoleculeBondNode );
export default MoleculeBondNode;
