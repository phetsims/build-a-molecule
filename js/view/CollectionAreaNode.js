// Copyright 2013-2019, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MultipleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/MultipleCollectionBoxNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Shape = require( 'KITE/Shape' );
  const SingleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/SingleCollectionBoxNode' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const resetCollectionString = require( 'string!BUILD_A_MOLECULE/resetCollection' );

  /**
   * @param {KitCollection} collection
   * @param {boolean} isSingleCollectionMode
   * @param {Function} toModelBounds
   * @constructor
   */
  function CollectionAreaNode( collection, isSingleCollectionMode, toModelBounds ) {
    Node.call( this, {} );
    const self = this;

    // Array for the black box for its text
    this.collectionBoxNodes = [];

    // Container for collection boxes and reset collection button.
    const allCollectionItemsVBox = new VBox( { spacing: 10 } );
    this.addChild( allCollectionItemsVBox );

    // Create and add all collection box nodes.
    collection.collectionBoxes.forEach( function( collectionBox ) {
      const collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds ) : new MultipleCollectionBoxNode( collectionBox, toModelBounds );
      self.collectionBoxNodes.push( collectionBoxNode );
      allCollectionItemsVBox.addChild( collectionBoxNode );
    } );

    // Reset Collection Button
    const resetCollectionButton = new TextPushButton( resetCollectionString, {
      listener: function() {
        // when clicked, empty collection boxes
        collection.collectionBoxes.forEach( function( box ) {
          box.reset();
        } );
        collection.kits.forEach( function( kit ) {
          kit.reset();
        } );
      },
      font: new PhetFont( 14 ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH,
      baseColor: Color.ORANGE
    } );
    resetCollectionButton.touchArea = Shape.bounds( resetCollectionButton.bounds.dilated( 7 ) );
    allCollectionItemsVBox.addChild( resetCollectionButton );

    /**
     * Toggles whether our reset collection button is enabled.
     * @private
     */
    function updateEnabled() {
      let enabled = false;
      collection.collectionBoxes.forEach( function( box ) {
        if ( box.quantityProperty.value > 0 ) {
          enabled = true;
        }
      } );
      resetCollectionButton.enabled = enabled;
    }

    // when any collection box quantity changes, re-update whether we are enabled
    collection.collectionBoxes.forEach( function( box ) {
      box.quantityProperty.link( updateEnabled );
    } );
  }

  buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
  return inherit( Node, CollectionAreaNode, {

    // REVIEW: Add doc
    updateCollectionBoxLocations: function() {
      this.collectionBoxNodes.forEach( function( collectionBoxNode ) {
        collectionBoxNode.updateLocation();
      } );
    }
  } );
} );
