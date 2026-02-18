// Copyright 2020-2026, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import Display from '../../../../scenery/js/display/Display.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import CollectionBox from '../model/CollectionBox.js';
import CompleteMolecule from '../model/CompleteMolecule.js';
import KitCollection from '../model/KitCollection.js';
import CollectionBoxNode from './CollectionBoxNode.js';
import MultipleCollectionBoxNode from './MultipleCollectionBoxNode.js';
import SingleCollectionBoxNode from './SingleCollectionBoxNode.js';

class CollectionAreaNode extends Node {

  // Private properties
  private readonly collectionBoxNodes: CollectionBoxNode[] = [];

  /**
   * @param collection - The kit collection
   * @param isSingleCollectionMode - Whether this is single collection mode
   * @param toModelBounds - Function to convert bounds to model coordinates
   * @param showDialogCallback - Callback to show the 3D dialog
   * @param updateRefillButton - Callback to update the refill button state
   */
  public constructor( collection: KitCollection, isSingleCollectionMode: boolean, toModelBounds: ( node: Node ) => Bounds2, showDialogCallback: ( completeMolecule: CompleteMolecule ) => void, updateRefillButton: () => void ) {
    super();

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

      interruptListener: Display.INTERRUPT_OTHER_POINTERS,
      iconHeight: 20,
      xMargin: 15,
      yMargin: 5,
      baseColor: Color.ORANGE,
      soundPlayer: nullSoundPlayer
    } );
    resetCollectionButton.touchArea = resetCollectionButton.bounds.dilated( 7 );

    // When any collection box quantity changes, update whether it is enabled
    const updateEnabled = () => {
      resetCollectionButton.enabled = collection.collectionBoxes.some( ( box: CollectionBox ) => box.quantityProperty.value );
    };
    collection.collectionBoxes.forEach( ( box: CollectionBox ) => box.quantityProperty.link( updateEnabled ) );

    allCollectionItemsVBox.addChild( resetCollectionButton );
  }

  /**
   * Update the positions of each collection box node
   */
  public updateCollectionBoxPositions(): void {
    this.collectionBoxNodes.forEach( collectionBoxNode => {
      collectionBoxNode.updatePosition();
    } );
  }
}

buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
export default CollectionAreaNode;