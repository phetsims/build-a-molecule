// Copyright 2020, University of Colorado Boulder

/**
 * Contains layout information relevant to where the kits are placed, where molecules can exist in the play area, etc.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Rectangle from '../../../../dot/js/Rectangle.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

class CollectionLayout {
  /**
   * Construct the necessary layout.
   *
   * @param {Boolean} hasCollectionPanel - flag used to scale available bounds width to compensate for collection panel
   * @constructor
   */
  constructor( hasCollectionPanel ) {
    const availableWidth = BAMConstants.MODEL_SIZE.width - 2 * BAMConstants.MODEL_PADDING; // minus padding
    const halfWidth = availableWidth / 2;

    const kitBottom = -BAMConstants.MODEL_SIZE.height / 2 + BAMConstants.MODEL_PADDING; // Y is up, so this is the bottom (min y) value for the rectangle
    const kitHeight = 550;
    const kitTop = kitBottom + kitHeight;

    // scale width to leave room for the collection panel
    const kitAvailableWidth = hasCollectionPanel ? 0.75 : 1;
    this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth * kitAvailableWidth, kitHeight );

    this.availablePlayAreaBounds = new Rectangle(
      -BAMConstants.MODEL_SIZE.width / 2, // far left part of model
      kitTop, // top of kit
      this.availableKitBounds.width + BAMConstants.MODEL_PADDING * 2, // add in padding, since there is padding in-between the kit and collection area
      BAMConstants.MODEL_SIZE.height / 2 - kitTop
    );
  }
}

buildAMolecule.register( 'CollectionLayout', CollectionLayout );
export default CollectionLayout;