// Copyright 2013-2019, University of Colorado Boulder

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
  const FaceNode = require( 'SCENERY_PHET/FaceNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Playable = require( 'TAMBO/Playable' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const youCompletedYourCollectionString = require( 'string!BUILD_A_MOLECULE/youCompletedYourCollection' );
  const nextCollectionString = require( 'string!BUILD_A_MOLECULE/nextCollection' );

  /**
   * @param {Function} regenerateCallback
   * @constructor
   */
  function AllFilledNode( regenerateCallback, options ) {
    options = merge( {
      stroke: 'black',
      fill: BAMConstants.COMPLETE_BACKGROUND_COLOR,
      center: BAMConstants.STAGE_SIZE.center,
      cornerRadius: 0,
      xMargin: 15,
      yMargin: 10
    }, options );
    const contentVBox = new VBox( { spacing: 5, align: 'center' } );
    const self = this;

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
      listener: function() {
        regenerateCallback();
        self.dispose();
      },
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

    Panel.call( this, contentVBox, options );
  }

  buildAMolecule.register( 'AllFilledNode', AllFilledNode );

  return inherit( Panel, AllFilledNode );
} );
