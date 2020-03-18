// Copyright 2020, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import platform from '../../../../phet-core/js/platform.js';
import ButtonListener from '../../../../scenery/js/input/ButtonListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import closedUpCursorImage from '../../../images/scissors-closed-up_cur.js';
import closedUpImage from '../../../images/scissors-closed-up_png.js';
import closedCursorImage from '../../../images/scissors-closed_cur.js';
import closedImage from '../../../images/scissors-closed_png.js';
import upCursorImage from '../../../images/scissors-up_cur.js';
import upImage from '../../../images/scissors-up_png.js';
import cursorImage from '../../../images/scissors_cur.js';
import scissorsImage from '../../../images/scissors_png.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

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
//REVIEW: It would be good to look at the current custom cursor support for supported platforms. Can we get rid of
//REVIEW: the duplication here?

const images = {
  'scissors.png': scissorsImage,
  'scissors-closed.png': closedImage,
  'scissors-up.png': upImage,
  'scissors-closed-up.png': closedUpImage,
  'scissors.cur': cursorImage,
  'scissors-closed.cur': closedCursorImage,
  'scissors-up.cur': upCursorImage,
  'scissors-closed-up.cur': closedUpCursorImage
};
const bondRadius = 6; // "Radius" of the bond target that will break the bond

class MoleculeBondNode extends Node {
  /**
   * @param {Bond} bond
   * @param {Kit} kit
   * @constructor
   */
  constructor( bond, kit ) {
    super( {} );

    // @private
    this.a = bond.a;
    this.b = bond.b;
    this.kit = kit;

    // use the lewis dot model to get our bond direction
    const bondDirection = kit.getBondDirection( this.a, this.b );
    const isHorizontal = bondDirection.id.name === 'WEST' || bondDirection.id.name === 'EAST';

    let openFile = 'scissors';
    let closedFile = 'scissors-closed';
    if ( isHorizontal ) {
      openFile += '-up';
      closedFile += '-up';
    }
    if ( platform.ie || platform.edge ) {
      openFile += '.cur';
      closedFile += '.cur';
    }
    else {
      openFile += '.png';
      closedFile += '.png';
    }

    const scissorsOpen = images[ openFile ]; // 23x20 or 20x23
    const scissorsClosed = images[ closedFile ]; //26x15 or 15x26
    const backup = ( isHorizontal ? 'col-resize' : 'row-resize' );

    // offsets should center this
    let openCursor;
    let closedCursor;
    if ( platform.ie || platform.edge ) {
      openCursor = 'url(' + scissorsOpen.src + '), url(http://phetsims.github.io/build-a-molecule/images/' + openFile + '), ' + backup;
      closedCursor = 'url(' + scissorsClosed.src + '), url(http://phetsims.github.io/build-a-molecule/images/' + closedFile + '), ' + backup;
    }
    else {
      openCursor = 'url(' + scissorsOpen.src + ') ' + ( isHorizontal ? '10 11' : '11 10' ) + ', ' + backup;
      closedCursor = 'url(' + scissorsClosed.src + ') ' + ( isHorizontal ? '7 13' : '13 7' ) + ', ' + backup;
    }

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
      fill: new Color( 'rgb(253,225,49)' ),
      stroke: new Color( 'rgb(253,225,49)' ),
      cursor: openCursor,
      visible: true
    } ) );

    // Add outer circle
    cutTargetNode.addChild( new Circle( bondRadius * 1.5, {
      fill: new Color( 'rgba(253,225,49,0.4)' ),
      cursor: openCursor,
      visible: true
    } ) );

    cutTargetNode.addInputListener( new ButtonListener( {
      fire() {
      },
      up() {
        cutTargetNode.cursor = openCursor;
      },
      down() {
        cutTargetNode.cursor = closedCursor;
        kit.breakBond( bond.a, bond.b );
      }
    } ) );
    this.addChild( cutTargetNode );

    // @private listener that will update the position of our hit target
    this.positionListener = () => {
      const orientation = this.b.positionProperty.value.minus( this.a.positionProperty.value );
      if ( orientation.magnitude > 0 ) {
        orientation.normalize();
      }
      const location = orientation.times( this.a.covalentRadius ).plus( this.a.positionProperty.value );
      this.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( location ) );
    };

    // @private Show the cut targets for the selected atom's bonds
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
    Node.prototype.dispose.call( this );
  }
}

buildAMolecule.register( 'MoleculeBondNode', MoleculeBondNode );
export default MoleculeBondNode;