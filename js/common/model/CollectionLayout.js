// Copyright 2020-2021, University of Colorado Boulder

/**
 * Contains layout information relevant to where the kits are placed, where molecules can exist in the play area, etc.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

// constants
const KIT_HEIGHT = 550;

class CollectionLayout {
  /**
   * Construct the necessary layout
   *
   * @param {boolean} hasCollectionPanel - flag used to scale available bounds width to compensate for collection panel
   */
  constructor( hasCollectionPanel ) {

    // Dimensions of the layout
    const availableWidth = BAMConstants.MODEL_SIZE.width - 2 * BAMConstants.MODEL_PADDING; // minus padding
    const halfWidth = availableWidth / 2;
    const kitBottom = -BAMConstants.MODEL_SIZE.height / 2 + BAMConstants.MODEL_PADDING; // Y is up, so this is the bottom (min y) value for the rectangle
    const kitTop = kitBottom + KIT_HEIGHT;

    // scale width to leave room for the collection panel
    const kitAvailableWidth = hasCollectionPanel ? 0.75 : 1;

    // @public {Bounds2} Refers to the bucket region
    this.availableKitBounds = Bounds2.rect( -halfWidth, kitBottom, availableWidth * kitAvailableWidth, KIT_HEIGHT );

    // @public {Bounds2} Refers to the play area above the bucket region, where molecules can be built, broken, and moved
    this.availablePlayAreaBounds = Bounds2.rect(
      -BAMConstants.MODEL_SIZE.width / 2, // far left part of model
      kitTop, // top of kit
      this.availableKitBounds.width + BAMConstants.MODEL_PADDING * 2, // add in padding, since there is padding in-between the kit and collection area
      BAMConstants.MODEL_SIZE.height / 2 - kitTop
    );
  }
}

buildAMolecule.register( 'CollectionLayout', CollectionLayout );
export default CollectionLayout;