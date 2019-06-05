// Copyright 2013-2017, University of Colorado Boulder

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Molecule3DDialog = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DDialog' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  //REVIEW: Could rename the string key so we don't have to disable the lint rule here?
  var threeDString = require( 'string!BUILD_A_MOLECULE/threeD' ); // eslint-disable-line string-require-statement-match

  function ShowMolecule3DButtonNode( completeMolecule, options ) {
    var self = this;
    RectangularPushButton.call( this, _.extend( {
      content: new Text( threeDString, {
        font: new PhetFont( {
          size: 12,
          weight: 'bold'
        } ),
        fill: 'white'
      } ),
      baseColor: new Color( 112, 177, 84 ),
      xMargin: 3,  //
      yMargin: 3,  //
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
  }

  buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );

  return inherit( Node, ShowMolecule3DButtonNode );
} );
