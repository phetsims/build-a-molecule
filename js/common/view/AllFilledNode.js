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
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const Dialog = require( 'SUN/Dialog' );
  const FaceNode = require( 'SCENERY_PHET/FaceNode' );
  const merge = require( 'PHET_CORE/merge' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const youCompletedYourCollectionString = require( 'string!BUILD_A_MOLECULE/youCompletedYourCollection' );

  class AllFilledNode extends Dialog {
    /**
     * @param {object} options
     * @constructor
     */
    constructor( options ) {
      options = merge( {
        stroke: 'black',
        fill: BAMConstants.COMPLETE_BACKGROUND_COLOR,
        center: new Vector2( 0, 0 ),
        cornerRadius: 0
      }, options );
      const contentVBox = new VBox( { spacing: 5, align: 'center' } );

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
      super( contentVBox, options );
    }
  }

  return buildAMolecule.register( 'AllFilledNode', AllFilledNode );
} );
