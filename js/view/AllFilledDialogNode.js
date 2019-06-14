// Copyright 2013-2017, University of Colorado Boulder

/**
 * Displays a dialog that tells the user that all collection boxes are full.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Color = require( 'SCENERY/util/Color' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var Dialog = require( 'SUN/Dialog' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );


  // strings
  var youCompletedYourCollectionString = require( 'string!BUILD_A_MOLECULE/youCompletedYourCollection' );
  var nextCollectionString = require( 'string!BUILD_A_MOLECULE/nextCollection' );

  /**
   * @param {Bounds2} availablePlayAreaBounds
   * @param {Function} regenerateCallback
   * @constructor
   */
  function AllFilledDialogNode( regenerateCallback ) {
    var contentVBox = new VBox( { spacing: 5, align: 'center' } );
    var self = this;

    // Add smiley face
    var smiley = new FaceNode( 120 ).smile();
    contentVBox.addChild( smiley );

    // Add text
    var text = new Text( youCompletedYourCollectionString, {
      font: new PhetFont( {
        size: 20,
        weight: 'bold'
      } )
    } );
    contentVBox.addChild( text );

    // Add button
    var button = new TextPushButton( nextCollectionString, {
      listener: function() {
        regenerateCallback();
        self.visible = false;
      },
      font: new PhetFont( {
        size: 18,
        weight: 'bold'
      } ),
      baseColor: Color.ORANGE
    } );
    button.touchArea = Shape.bounds( button.localBounds.dilated( 20 ) );
    contentVBox.addChild( button );

    Dialog.call( this, contentVBox, {
      stroke: 'black',
      fill: BAMConstants.COMPLETE_BACKGROUND_COLOR,
      center: new Vector2( 0, 0 )
    } );
  }

  buildAMolecule.register( 'AllFilledDialogNode', AllFilledDialogNode );

  return inherit( Dialog, AllFilledDialogNode );
} );
