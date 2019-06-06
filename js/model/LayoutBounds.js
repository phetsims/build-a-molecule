// Copyright 2013-2017, University of Colorado Boulder

/**
 * Contains layout information relevant to where the kits are placed, where molecules can exist in the play area, etc.
 *
 * REVIEW: If this is kept, a rename might be beneficial, as we now use the term 'layoutBounds' for other things.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var Rectangle = require( 'DOT/Rectangle' );

  class LayoutBounds {
    /**
     * Construct the necessary layout. If isWide is true, the collectionAreaModelWidth is ignoredsim
     *
     * @param {boolean} isWide Whether the kit should take up the entire width
     * @param {number} collectionAreaModelWidth The model width of the collection area (computed, as it varies from tab to tab)
     * @constructor
     */
    constructor( isWide, collectionAreaModelWidth ) {
      const availableWidth = BAMConstants.MODEL_SIZE.width - 2 * BAMConstants.MODEL_PADDING; // minus padding
      const halfWidth = availableWidth / 2;

      const kitBottom = -BAMConstants.MODEL_SIZE.height / 2 + BAMConstants.MODEL_PADDING; // Y is up, so this is the bottom (min y) value for the rectangle
      const kitHeight = 550;
      const kitTop = kitBottom + kitHeight;

      if ( isWide ) {
        this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth, kitHeight );
      }
      else {
        // leave room for collection area
        this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth - BAMConstants.MODEL_PADDING - collectionAreaModelWidth, kitHeight );
        if ( this.availableKitBounds.width < 0 ) {
          console.log( 'TODO: Fix i18n sizing...' ); // workaround for xss test, etc. for now
          this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth, kitHeight );
        }
      }

      this.availablePlayAreaBounds = new Rectangle(
        -BAMConstants.MODEL_SIZE.width / 2, // far left part of model
        kitTop, // top of kit
        this.availableKitBounds.width + BAMConstants.MODEL_PADDING * 2, // add in padding, since there is padding in-between the kit and collection area
        BAMConstants.MODEL_SIZE.height / 2 - kitTop );
    }
  }

  return buildAMolecule.register( 'LayoutBounds', LayoutBounds );

} );
