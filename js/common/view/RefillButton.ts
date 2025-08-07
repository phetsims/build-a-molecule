// Copyright 2020-2025, University of Colorado Boulder

/**
 * Button that refills the kit buckets with the initial atoms.
 *
 * @author Denzell Barnett
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import Display from '../../../../scenery/js/display/Display.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import replySolidShape from '../../../../sherpa/js/fontawesome-5/replySolidShape.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

// constants
const OFFSET = 3;

type SelfOptions = {
  // No additional options for RefillButton
};

export type RefillButtonOptions = SelfOptions & RectangularPushButtonOptions;

class RefillButton extends RectangularPushButton {
  /**
   * @param buttonListener - Function to call when the button is pressed
   * @param providedOptions - Button options
   */
  public constructor( buttonListener: () => void, providedOptions?: RefillButtonOptions ) {
    const replyIcon = new Path( replySolidShape, {
      fill: 'black', // "safety orange", according to Wikipedia
      scale: 0.05
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

    const options = optionize<RefillButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {
      yMargin: 5,
      content: contentNode,
      listener: buttonListener,
      // @ts-expect-error
      interruptListener: Display.INTERRUPT_OTHER_POINTERS,
      baseColor: 'rgb(234,225,88)',
      soundPlayer: nullSoundPlayer
    }, providedOptions );
    super( options );
  }
}

buildAMolecule.register( 'RefillButton', RefillButton );
export default RefillButton;