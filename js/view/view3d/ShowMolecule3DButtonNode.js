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
  var ScreenView = require( 'JOIST/ScreenView' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  //REVIEW: Could rename the string key so we don't have to disable the lint rule here?
  var threeDString = require( 'string!BUILD_A_MOLECULE/threeD' ); // eslint-disable-line string-require-statement-match

  // constants
  var SQUARE_SIZE = 19; // 19 is a hard-coded constant to make it square


  function ShowMolecule3DButtonNode( completeMolecule, options ) {
    var self = this;
    Node.call( this, _.extend( {
      cursor: 'pointer'
    }, options ) );


    this.addInputListener( new ButtonListener( {
      fire: function() {
        var trail = self.getUniqueTrail();
        //REVIEW: (JO) See if we can just check for a ScreenView, so that we don't use this special check.
        var view = _.find( trail.nodes, function( node ) {
          if ( node instanceof ScreenView ) {
            return node;
          }
        } );
        var dialog = new Molecule3DDialog( completeMolecule, view );

        dialog.show();
      }
    } ) );

    var label = new Text( threeDString, {
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
    var width = Math.ceil( Math.max( SQUARE_SIZE, label.width + 2 * labelPadding ) );
    label.centerX = width / 2;
    label.centerY = SQUARE_SIZE / 2;

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
