// Copyright 2020, University of Colorado Boulder

/**
 * Button that refills the kit buckets with the intial atoms.
 *
 * @author Denzell Barnett
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import Playable from '../../../../tambo/js/Playable.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

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

buildAMolecule.register( 'RefillButton', RefillButton );
export default RefillButton;