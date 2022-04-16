// Copyright 2020-2022, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import { Color, Node, VBox } from '../../../../scenery/js/imports.js';
import nullSoundPlayer from '../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
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
    super();

    // @private {Array.<SingleCollectionBoxNode|MultipleCollectionBoxNode>} Array for the black box for its text
    this.collectionBoxNodes = [];

    // Container for collection boxes and reset collection button.
    const allCollectionItemsVBox = new VBox( { spacing: 15 } );
    this.addChild( allCollectionItemsVBox );

    // Create and add all collection box nodes.
    collection.collectionBoxes.forEach( collectionBox => {
      const collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback ) :
                                new MultipleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback );
      this.collectionBoxNodes.push( collectionBoxNode );
      allCollectionItemsVBox.addChild( collectionBoxNode );
    } );

    // Reset collection button
    const resetCollectionButton = new RefreshButton( {
      listener() {
        collection.resetKitsAndBoxes();
        updateRefillButton();
      },
      iconHeight: 20,
      xMargin: 15,
      yMargin: 5,
      baseColor: Color.ORANGE,
      soundPlayer: nullSoundPlayer
    } );
    resetCollectionButton.touchArea = resetCollectionButton.bounds.dilated( 7 );

    // When any collection box quantity changes, update whether it is enabled
    const updateEnabled = () => { resetCollectionButton.enabled = _.some( collection.collectionBoxes, box => box.quantityProperty.value ); };
    collection.collectionBoxes.forEach( box => box.quantityProperty.link( updateEnabled ) );

    allCollectionItemsVBox.addChild( resetCollectionButton );
  }

  /**
   * Update the positions of each collection box node
   *
   * @public
   */
  updateCollectionBoxPositions() {
    this.collectionBoxNodes.forEach( collectionBoxNode => {
      collectionBoxNode.updatePosition();
    } );
  }
}

buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
export default CollectionAreaNode;
