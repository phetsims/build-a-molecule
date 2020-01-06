// Copyright 2013-2019, University of Colorado Boulder

/**
 * Contains layout information relevant to where the kits are placed, where molecules can exist in the play area, etc.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const Rectangle = require( 'DOT/Rectangle' );

  class CollectionLayout {
    /**
     * Construct the necessary layout.
     *
     * @constructor
     */
    constructor() {
      const availableWidth = BAMConstants.MODEL_SIZE.width - 2 * BAMConstants.MODEL_PADDING; // minus padding
      const halfWidth = availableWidth / 2;

      const kitBottom = -BAMConstants.MODEL_SIZE.height / 2 + BAMConstants.MODEL_PADDING; // Y is up, so this is the bottom (min y) value for the rectangle
      const kitHeight = 550;
      const kitTop = kitBottom + kitHeight;

      // leave room for collection area
      this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth * .75, kitHeight );

      this.availablePlayAreaBounds = new Rectangle(
        -BAMConstants.MODEL_SIZE.width / 2, // far left part of model
        kitTop, // top of kit
        this.availableKitBounds.width + BAMConstants.MODEL_PADDING * 2, // add in padding, since there is padding in-between the kit and collection area
        BAMConstants.MODEL_SIZE.height / 2 - kitTop );
    }
  }

  return buildAMolecule.register( 'CollectionLayout', CollectionLayout );

} );
