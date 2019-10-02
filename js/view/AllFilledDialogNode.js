// Copyright 2013-2019, University of Colorado Boulder

/**
 * Displays a dialog that tells the user that all collection boxes are full.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const Dialog = require( 'SUN/Dialog' );
  const FaceNode = require( 'SCENERY_PHET/FaceNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );


  // strings
  const youCompletedYourCollectionString = require( 'string!BUILD_A_MOLECULE/youCompletedYourCollection' );
  const nextCollectionString = require( 'string!BUILD_A_MOLECULE/nextCollection' );

  /**
   * @param {Bounds2} availablePlayAreaBounds
   * @param {Function} regenerateCallback
   * @constructor
   */
  function AllFilledDialogNode( regenerateCallback ) {
    const contentVBox = new VBox( { spacing: 5, align: 'center' } );
    const self = this;

    // Add smiley face
    const smiley = new FaceNode( 120 ).smile();
    contentVBox.addChild( smiley );

    // Add text
    const text = new Text( youCompletedYourCollectionString, {
      font: new PhetFont( {
        size: 20,
        weight: 'bold'
      } )
    } );
    contentVBox.addChild( text );

    // Add button
    const button = new TextPushButton( nextCollectionString, {
      listener: function() {
        regenerateCallback();
        self.hide();
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
