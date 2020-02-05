// Copyright 2020, University of Colorado Boulder

/**
 * Button that refills the kit buckets with the intial atoms.
 *
 * @author Denzell Barnett
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  const BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const merge = require( 'PHET_CORE/merge' );
  const Playable = require( 'TAMBO/Playable' );
  const SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Node = require( 'SCENERY/nodes/Node' );

  // constants
  const OFFSET = 3;

  class RefillButton extends RectangularPushButton {
    /**
     * @param {Function} buttonListener
     * @param {Object} [options]
     * @constructor
     */
    constructor( buttonListener, options ) {
      const replyIcon = new FontAwesomeNode( 'reply', {
        fill: 'black', // "safety orange", according to Wikipedia
        scale: 0.55
      } );
      const sphereBucket = new SphereBucket( {
        sphereRadius: 1,
        size: new Dimension2( 130, 60 ),
        baseColor: 'rgb(222,222,222)' // Light-gray color
      } );
      const bucketView = {
        bucketFront: new BucketFront( sphereBucket, BAMConstants.MODEL_VIEW_TRANSFORM ),
        bucketHole: new BucketHole( sphereBucket, BAMConstants.MODEL_VIEW_TRANSFORM )
      };
      const contentNode = new Node( {
        children: [ replyIcon, bucketView.bucketHole, bucketView.bucketFront ],
        scale: 0.60
      } );

      // Placement adjustments and arrow rotation
      replyIcon.rotate( -Math.PI / 4 );
      replyIcon.centerX = contentNode.centerX;
      bucketView.bucketHole.centerX = replyIcon.centerX;
      bucketView.bucketFront.centerX = bucketView.bucketHole.centerX;
      bucketView.bucketHole.top = replyIcon.bottom - OFFSET * 2;
      bucketView.bucketFront.top = bucketView.bucketHole.bottom - OFFSET;

      options = merge( {
        yMargin: 5,
        content: contentNode,
        listener: buttonListener,
        baseColor: 'rgb(234,225,88)',
        soundPlayer: Playable.NO_SOUND
      }, options );
      super( options );
    }
  }

  return buildAMolecule.register( 'RefillButton', RefillButton );
} );
