// Copyright 2013-2019, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
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

  const images = {
    'scissors.png': require( 'image!BUILD_A_MOLECULE/scissors.png' ),
    'scissors-closed.png': require( 'image!BUILD_A_MOLECULE/scissors-closed.png' ),
    'scissors-up.png': require( 'image!BUILD_A_MOLECULE/scissors-up.png' ),
    'scissors-closed-up.png': require( 'image!BUILD_A_MOLECULE/scissors-closed-up.png' ),
    'scissors.cur': require( 'image!BUILD_A_MOLECULE/scissors.cur' ),
    'scissors-closed.cur': require( 'image!BUILD_A_MOLECULE/scissors-closed.cur' ),
    'scissors-up.cur': require( 'image!BUILD_A_MOLECULE/scissors-up.cur' ),
    'scissors-closed-up.cur': require( 'image!BUILD_A_MOLECULE/scissors-closed-up.cur' )
  };

  const bondRadius = 5; // "Radius" of the bond target that will break the bond

  /**
   * @param {Bond} bond
   * @param {Kit} kit
   * @constructor
   */
  function MoleculeBondNode( bond, kit ) {
    const self = this;

    Node.call( this, {} );

    // @private
    this.a = bond.a;
    this.b = bond.b;
    this.selectedAtom = kit.selectedAtomProperty.value;

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
      fire: function() {
      },
      up: function() {
        cutTargetNode.cursor = openCursor;
      },
      down: function() {
        cutTargetNode.cursor = closedCursor;
        kit.breakBond( self.a, self.b );
      }
    } ) );
    this.addChild( cutTargetNode );

    // Show the cut targets for the selected atom's bonds
    kit.selectedAtomProperty.link( selectedAtom => {
      cutTargetNode.visible = selectedAtom === self.a || selectedAtom === self.b;
    } );

    // listener that will update the position of our hit target
    this.positionListener = function() {
      const orientation = self.b.positionProperty.value.minus( self.a.positionProperty.value );
      if ( orientation.magnitude > 0 ) {
        orientation.normalize();
      }
      const location = orientation.times( self.a.covalentRadius ).plus( self.a.positionProperty.value );
      self.setTranslation( BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewPosition( location ) );
    };
    this.a.positionProperty.link( this.positionListener );
    this.b.positionProperty.link( this.positionListener );
  }

  buildAMolecule.register( 'MoleculeBondNode', MoleculeBondNode );

  inherit( Node, MoleculeBondNode, {
    /**
     * @override
     */
    dispose: function() {
      this.a.positionProperty.unlink( this.positionListener );
      this.b.positionProperty.unlink( this.positionListener );
      Node.prototype.dispose.call( this );
    }
  } );

  return MoleculeBondNode;
} );
