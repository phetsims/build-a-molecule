// Copyright 2002-2014, University of Colorado Boulder

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var MeterBodyNode = require( 'SCENERY_PHET/MeterBodyNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Molecule3DDialog = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DDialog' );

  // images
  var greenLeft = require( 'image!BUILD_A_MOLECULE/green-left.png' );
  var greenMiddle = require( 'image!BUILD_A_MOLECULE/green-middle.png' );
  var greenRight = require( 'image!BUILD_A_MOLECULE/green-right.png' );

  // strings
  var iconString = require( 'string!BUILD_A_MOLECULE/3d.icon' );

  var ShowMolecule3DButtonNode = namespace.ShowMolecule3DButtonNode = function ShowMolecule3DButtonNode( completeMolecule, options ) {
    var that = this;
    Node.call( this, _.extend( {
      cursor: 'pointer'
    }, options ) );

    this.addInputListener( new ButtonListener( {
      fire: function( evt ) {
        var trail = that.getUniqueTrail();
        var view = _.find( trail.nodes, function( node ) { return node.isBAMView; } );
        view.addChild( new Molecule3DDialog( completeMolecule, trail, view ) );
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
    label.centerX = width / 2;
    label.centerY = sqSize / 2;

    var base = new MeterBodyNode( width, greenLeft, greenMiddle, greenRight, {} );

    this.addChild( base );
    this.addChild( label );
  };

  return inherit( Node, ShowMolecule3DButtonNode );
} );
