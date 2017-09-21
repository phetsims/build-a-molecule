// Copyright 2013-2017, University of Colorado Boulder

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Molecule3DDialog = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DDialog' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var iconString = require( 'string!BUILD_A_MOLECULE/3d.icon' ); // eslint-disable-line string-require-statement-match

  function ShowMolecule3DButtonNode( completeMolecule, options ) {
    var self = this;
    Node.call( this, _.extend( {
      cursor: 'pointer'
    }, options ) );

    this.addInputListener( new ButtonListener( {
      fire: function( evt ) {
        var trail = self.getUniqueTrail();
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

    var base = new ShadedRectangle( new Bounds2( 0, 0, width, 19 ), {
      baseColor: new Color( 112, 177, 84 ),
      cornerRadius: 3
    } );

    this.addChild( base );
    this.addChild( label );
  }
  buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );

  return inherit( Node, ShowMolecule3DButtonNode );
} );
