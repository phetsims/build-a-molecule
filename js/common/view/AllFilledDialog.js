// Copyright 2020, University of Colorado Boulder

/**
 * Displays a node that tells the user that all collection boxes are full. Allows the user
 * to create a new collection.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const Dialog = require( 'SUN/Dialog' );
  const FaceNode = require( 'SCENERY_PHET/FaceNode' );
  const merge = require( 'PHET_CORE/merge' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Playable = require( 'TAMBO/Playable' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const nextCollectionString = require( 'string!BUILD_A_MOLECULE/nextCollection' );
  const youCompletedYourCollectionString = require( 'string!BUILD_A_MOLECULE/youCompletedYourCollection' );

  class AllFilledDialog extends Dialog {
    /**
     * @param {BooleanProperty} buttonClickedProperty
     * @param {Function} regenerateCallback
     * @param {object} options
     * @constructor
     */
    constructor( buttonClickedProperty, regenerateCallback, options ) {
      options = merge( {
        stroke: 'black',
        fill: BAMConstants.COMPLETE_BACKGROUND_COLOR,
        center: new Vector2( 0, 0 ),
        bottomMargin: 10,
        cornerRadius: BAMConstants.CORNER_RADIUS
      }, options );
      const contentVBox = new VBox( { spacing: 7, align: 'center' } );

      // Add smiley face
      const smiley = new FaceNode( 120 ).smile();
      contentVBox.addChild( smiley );

      // Add text
      const text = new Text( youCompletedYourCollectionString, {
        font: new PhetFont( {
          size: 20,
          weight: 'bold',
          maxWidth: BAMConstants.TEXT_MAX_WIDTH
        } )
      } );
      contentVBox.addChild( text );

      // Add button
      const button = new TextPushButton( nextCollectionString, {
        font: new PhetFont( {
          size: 18,
          weight: 'bold',
          maxWidth: BAMConstants.TEXT_MAX_WIDTH
        } ),
        baseColor: Color.ORANGE,
        soundPlayer: Playable.NO_SOUND
      } );
      button.touchArea = Shape.bounds( button.localBounds.dilated( 20 ) );
      contentVBox.addChild( button );
      super( contentVBox, options );

      // @private
      button.addListener( () => {
        buttonClickedProperty.value = true;
        regenerateCallback();
        this.hide();
      } );
    }
  }

  return buildAMolecule.register( 'AllFilledDialog', AllFilledDialog );
} );
