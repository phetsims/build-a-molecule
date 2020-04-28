// Copyright 2020, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Shape from '../../../../kite/js/Shape.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import Playable from '../../../../tambo/js/Playable.js';
import buildAMolecule from '../../buildAMolecule.js';
import MultipleCollectionBoxNode from './MultipleCollectionBoxNode.js';
import SingleCollectionBoxNode from './SingleCollectionBoxNode.js';

class CollectionAreaNode extends Node {
  /**
   * @param {KitCollection} collection
   * @param {boolean} isSingleCollectionMode
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   * @param {function} updateRefillButton
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

    // When any collection box quantity changes, update whether it is enabled
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
   *
   * @public
   */
  updateCollectionBoxLocations() {
    this.collectionBoxNodes.forEach( collectionBoxNode => {
      collectionBoxNode.updateLocation();
    } );
  }
}

buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
export default CollectionAreaNode;