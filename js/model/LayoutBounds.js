// Copyright 2013-2015, University of Colorado Boulder

/**
 * Contains layout information relevant to where the kits are placed, where molecules can exist in the play area, etc.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var Rectangle = require( 'DOT/Rectangle' );

  /**
   * Construct the necessary layout. If isWide is true, the collectionAreaModelWidth is ignored
   *
   * @param isWide                   Whether the kit should take up the entire width
   * @param collectionAreaModelWidth The model width of the collection area (computed, as it varies from tab to tab)
   */
  function LayoutBounds( isWide, collectionAreaModelWidth ) {
    var availableWidth = Constants.modelSize.width - 2 * Constants.modelPadding; // minus padding
    var halfWidth = availableWidth / 2;

    var kitBottom = -Constants.modelSize.height / 2 + Constants.modelPadding; // Y is up, so this is the bottom (min y) value for the rectangle
    var kitHeight = 550;
    var kitTop = kitBottom + kitHeight;

    if ( isWide ) {
      this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth, kitHeight );
    }
    else {
      // leave room for collection area
      this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth - Constants.modelPadding - collectionAreaModelWidth, kitHeight );
      if ( this.availableKitBounds.width < 0 ) {
        console.log( 'TODO: Fix i18n sizing...' ); // workaround for xss test, etc. for now
        this.availableKitBounds = new Rectangle( -halfWidth, kitBottom, availableWidth, kitHeight );
      }
    }

    this.availablePlayAreaBounds = new Rectangle(
      -Constants.modelSize.width / 2, // far left part of model
      kitTop, // top of kit
      this.availableKitBounds.width + Constants.modelPadding * 2, // add in padding, since there is padding in-between the kit and collection area
      Constants.modelSize.height / 2 - kitTop );
  }
  buildAMolecule.register( 'LayoutBounds', LayoutBounds );

  return LayoutBounds;
} );
