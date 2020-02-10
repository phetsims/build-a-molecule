// Copyright 2020, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const MultipleCollectionBoxNode = require( 'BUILD_A_MOLECULE/common/view/MultipleCollectionBoxNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Playable = require( 'TAMBO/Playable' );
  const RefreshButton = require( 'SCENERY_PHET/buttons/RefreshButton' );
  const Shape = require( 'KITE/Shape' );
  const SingleCollectionBoxNode = require( 'BUILD_A_MOLECULE/common/view/SingleCollectionBoxNode' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  class CollectionAreaNode extends Node {
    /**
     * @param {KitCollection} collection
     * @param {boolean} isSingleCollectionMode
     * @param {function} toModelBounds
     * @param {function} showDialogCallback
     * @param {function} updateRefillButton
     * @constructor
     */
    constructor( collection, isSingleCollectionMode, toModelBounds, showDialogCallback, updateRefillButton ) {
      super( {} );
      const self = this;

      // Array for the black box for its text
      this.collectionBoxNodes = [];

      // Container for collection boxes and reset collection button.
      const allCollectionItemsVBox = new VBox( { spacing: 15 } );
      this.addChild( allCollectionItemsVBox );

      // Create and add all collection box nodes.
      collection.collectionBoxes.forEach( collectionBox => {
        const collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback ) :
                                  new MultipleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback );
        self.collectionBoxNodes.push( collectionBoxNode );
        allCollectionItemsVBox.addChild( collectionBoxNode );
      } );

      // Reset collection button
      const resetCollectionButton = new RefreshButton( {
        listener() {
          // when clicked, reset the kits and empty collection boxes
          collection.kits.forEach( kit => {
            kit.reset();
          } );
          collection.collectionBoxes.forEach( box => {
            box.reset();
          } );
          updateRefillButton();
        },
        iconScale: 0.5,
        xMargin: 15,
        yMargin: 5,
        baseColor: Color.ORANGE,
        soundPlayer: Playable.NO_SOUND
      } );
      resetCollectionButton.touchArea = Shape.bounds( resetCollectionButton.bounds.dilated( 7 ) );

      // when any collection box quantity changes, re-update whether we are enabled
      collection.collectionBoxes.forEach( box => {
        box.quantityProperty.link( () => {
          let enabled = false;
          collection.collectionBoxes.forEach( box => {
            if ( box.quantityProperty.value > 0 ) {
              enabled = true;
            }
          } );
          resetCollectionButton.enabled = enabled;
        } );
      } );
      allCollectionItemsVBox.addChild( resetCollectionButton );
    }

    /**
     * Update the location of each collection box node
     * @public
     */
    updateCollectionBoxLocations() {
      this.collectionBoxNodes.forEach( collectionBoxNode => {
        collectionBoxNode.updateLocation();
      } );
    }
  }

  return buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
} );
