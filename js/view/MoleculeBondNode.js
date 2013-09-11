// Copyright 2002-2013, University of Colorado

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Images = require( 'BAM/Images' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var platform = require( 'PHET_CORE/platform' );
  
  var bondRadius = 5; // "Radius" of the bond target that will break the bond
  
  var MoleculeBondNode = namespace.MoleculeBondNode = function MoleculeBondNode( bond, kit, view ) {
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
    if ( platform.ie ) {
      openFile += '.cur';
      closedFile += '.cur';
    } else {
      openFile += '.png';
      closedFile += '.png';
    }
    
    var scissorsOpen = Images.getImage( openFile ); // 23x20 or 20x23
    var scissorsClosed = Images.getImage( closedFile ); //26x15 or 15x26
    
    // offsets should center this
    var openCursor, closedCursor;
    if ( platform.ie ) {
      openCursor = 'url(' + scissorsOpen.src + '), auto';
      closedCursor = 'url(' + scissorsClosed.src + '), auto';
    } else {
      openCursor = 'url(' + scissorsOpen.src + ') ' + ( isHorizontal ? '10 11' : '11 10' ) + ', auto';
      closedCursor = 'url(' + scissorsClosed.src + ') ' + ( isHorizontal ? '7 13' : '13 7' ) + ', auto';
    }
    
    // hit target
    var target = new Circle( bondRadius, {
      // no fill or stroke
      cursor: openCursor
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
      var location = b.position.minus( a.position ).normalized().times( a.radius ).plus( a.position );
      self.setTranslation( Constants.modelViewTransform.modelToViewPosition( location ) );
    };
    a.positionProperty.link( this.positionListener );
    b.positionProperty.link( this.positionListener );
  };
  
  inherit( Node, MoleculeBondNode, {
    destruct: function() {
      this.a.positionProperty.unlink( this.positionListener );
      this.b.positionProperty.unlink( this.positionListener );
    }
  } );
  
  return MoleculeBondNode;
} );
