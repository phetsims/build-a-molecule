// Copyright 2002-2013, University of Colorado

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var MeterBodyNode = require( 'SCENERY_PHET/MeterBodyNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var greenLeft = require( 'image!BAM/../images/green-left.png' );
  var greenMiddle = require( 'image!BAM/../images/green-middle.png' );
  var greenRight = require( 'image!BAM/../images/green-right.png' );
  var iconString = require( 'string!BAM/3d.icon' );
  var Molecule3DNode = require( 'BAM/view/view3d/Molecule3DNode' );

  var ShowMolecule3DButtonNode = namespace.ShowMolecule3DButtonNode = function ShowMolecule3DButtonNode( completeMolecule, options ) {
    var that = this;
    Node.call( this, _.extend( {
      cursor: 'pointer'
    }, options ) );
    
    this.addInputListener( new ButtonListener( {
      fire: function( evt ) {
        new Molecule3DNode( completeMolecule, that.getUniqueTrail() );
      }
    } ) );
    
    var sqSize = 19; // 19 is a hard-coded constant to make it square
    
    var label = new Text( iconString, {
      font: new PhetFont( {
        size: 12,
        weight: 'bold'
      } ),
      fill: 'white'
    } );
    
    // if the label is too wide, override it
    if ( label.width > 35 ) {
      label.text = '3D';
    }
    
    var labelPadding = 2;
    var width = Math.ceil( Math.max( sqSize, label.width + 2 * labelPadding ) );
    label.centerX = label.width / 2;
    label.centerY = sqSize / 2;
    
    var base = new MeterBodyNode( width, greenLeft, greenMiddle, greenRight, {} );
    
    this.addChild( base );
    this.addChild( label );
  };

  return inherit( Node, ShowMolecule3DButtonNode );
} );
