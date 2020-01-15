// Copyright 2020, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Color = require( 'SCENERY/util/Color' );
  const Node = require( 'SCENERY/nodes/Node' );
  const platform = require( 'PHET_CORE/platform' );

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
  const scissorsImage = require( 'image!BUILD_A_MOLECULE/scissors.png' );
  const closedImage = require( 'image!BUILD_A_MOLECULE/scissors-closed.png' );
  const upImage = require( 'image!BUILD_A_MOLECULE/scissors-up.png' );
  const closedUpImage = require( 'image!BUILD_A_MOLECULE/scissors-closed-up.png' );
  const cursorImage = require( 'image!BUILD_A_MOLECULE/scissors.cur' );
  const closedCursorImage = require( 'image!BUILD_A_MOLECULE/scissors-closed.cur' );
  const upCursorImage = require( 'image!BUILD_A_MOLECULE/scissors-up.cur' );
  const closedUpCursorImage = require( 'image!BUILD_A_MOLECULE/scissors-closed-up.cur' );

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
  const bondRadius = 5; // "Radius" of the bond target that will break the bond

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
      cutTargetNode.addChild( new Circle( bondRadius, {
        fill: new Color( 'rgb(253,225,49)' ),
        stroke: new Color( 'rgb(253,225,49)' ),
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

      // Show the cut targets for the selected atom's bonds
      kit.selectedAtomProperty.link( selectedAtom => {
        cutTargetNode.visible = selectedAtom === this.a || selectedAtom === this.b;
      } );

      // listener that will update the position of our hit target
      this.positionListener = () => {
        const orientation = this.b.positionProperty.value.minus( this.a.positionProperty.value );
        if ( orientation.magnitude > 0 ) {
          orientation.normalize();
        }
        const location = orientation.times( this.a.covalentRadius ).plus( this.a.positionProperty.value );
        this.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( location ) );
      };
      this.a.positionProperty.link( this.positionListener );
      this.b.positionProperty.link( this.positionListener );
    }

    /**
     * @override
     * @public
     */
    dispose() {
      this.a.positionProperty.unlink( this.positionListener );
      this.b.positionProperty.unlink( this.positionListener );
      Node.prototype.dispose.call( this );
    }
  }

  return buildAMolecule.register( 'MoleculeBondNode', MoleculeBondNode );
} );