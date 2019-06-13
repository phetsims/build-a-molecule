// Copyright 2013-2017, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
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
  //REVIEW: It would be good to look at the current custom cursor support for supported platforms. Can we get rid of
  //REVIEW: the duplication here?

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

  /**
   * @param {Bond} bond
   * @param {Kit} kit
   * @constructor
   */
  function MoleculeBondNode( bond, kit ) {
    var self = this;

    Node.call( this, {} );

    // @private
    this.a = bond.a;
    this.b = bond.b;

    // use the lewis dot model to get our bond direction
    var bondDirection = kit.getBondDirection( this.a, this.b );
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
      fire: function() {
        kit.breakBond( self.a, self.b );
      },
      up: function() {
        target.cursor = openCursor;
      },
      down: function() {
        target.cursor = closedCursor;
      }
    } ) );
    this.addChild( target );

    // listener that will update the position of our hit target
    this.positionListener = function() {
      var orientation = self.b.positionProperty.value.minus( self.a.positionProperty.value );
      if ( orientation.magnitude > 0 ) {
        orientation.normalize();
      }
      var location = orientation.times( self.a.covalentRadius ).plus( self.a.positionProperty.value );
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
