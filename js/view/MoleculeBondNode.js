// Copyright 2013-2015, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var platform = require( 'PHET_CORE/platform' );
  var Shape = require( 'KITE/Shape' );

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

  var images = {
    'scissors.png': require( 'image!BUILD_A_MOLECULE/scissors.png' ),
    'scissors-closed.png': require( 'image!BUILD_A_MOLECULE/scissors-closed.png' ),
    'scissors-up.png': require( 'image!BUILD_A_MOLECULE/scissors-up.png' ),
    'scissors-closed-up.png': require( 'image!BUILD_A_MOLECULE/scissors-closed-up.png' ),
    'scissors.cur': require( 'image!BUILD_A_MOLECULE/scissors.cur' ),
    'scissors-closed.cur': require( 'image!BUILD_A_MOLECULE/scissors-closed.cur' ),
    'scissors-up.cur': require( 'image!BUILD_A_MOLECULE/scissors-up.cur' ),
    'scissors-closed-up.cur': require( 'image!BUILD_A_MOLECULE/scissors-closed-up.cur' )
  };

  var bondRadius = 5; // "Radius" of the bond target that will break the bond

  function MoleculeBondNode( bond, kit, view ) {
    var self = this;

    Node.call( this, {} );

    var a = this.a = bond.a;
    var b = this.b = bond.b;

    // use the lewis dot model to get our bond direction
    var bondDirection = kit.getBondDirection( a, b );
    var isHorizontal = bondDirection.id === 'west' || bondDirection.id === 'east';

    var openFile = 'scissors';
    var closedFile = 'scissors-closed';
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

    var scissorsOpen = images[ openFile ]; // 23x20 or 20x23
    var scissorsClosed = images[ closedFile ]; //26x15 or 15x26
    var backup = ( isHorizontal ? 'col-resize' : 'row-resize' );

    // offsets should center this
    var openCursor;
    var closedCursor;
    if ( platform.ie || platform.edge ) {
      openCursor = 'url(' + scissorsOpen.src + '), url(http://phetsims.github.io/build-a-molecule/images/' + openFile + '), ' + backup;
      closedCursor = 'url(' + scissorsClosed.src + '), url(http://phetsims.github.io/build-a-molecule/images/' + closedFile + '), ' + backup;
    }
    else {
      openCursor = 'url(' + scissorsOpen.src + ') ' + ( isHorizontal ? '10 11' : '11 10' ) + ', ' + backup;
      closedCursor = 'url(' + scissorsClosed.src + ') ' + ( isHorizontal ? '7 13' : '13 7' ) + ', ' + backup;
    }

    // hit target
    var target = new Circle( bondRadius, {
      // no fill or stroke
      cursor: openCursor,
      touchArea: new Shape() // these areas don't respond to touch events
    } );
    target.addInputListener( new ButtonListener( {
      fire: function( evt ) {
        kit.breakBond( a, b );
      },
      up: function( evt ) {
        target.cursor = openCursor;
      },
      down: function( evt ) {
        target.cursor = closedCursor;
      }
    } ) );
    this.addChild( target );

    // listener that will update the position of our hit target
    this.positionListener = function() {
      var orientation = b.position.minus( a.position );
      if ( orientation.magnitude() > 0 ) {
        orientation.normalize();
      }
      var location = orientation.times( a.covalentRadius ).plus( a.position );
      self.setTranslation( Constants.modelViewTransform.modelToViewPosition( location ) );
    };
    a.positionProperty.link( this.positionListener );
    b.positionProperty.link( this.positionListener );
  }
  buildAMolecule.register( 'MoleculeBondNode', MoleculeBondNode );

  inherit( Node, MoleculeBondNode, {
    destruct: function() {
      this.a.positionProperty.unlink( this.positionListener );
      this.b.positionProperty.unlink( this.positionListener );
    }
  } );

  return MoleculeBondNode;
} );
