// Copyright 2020-2025, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import Display from '../../../../scenery/js/display/Display.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import KitCollection from '../model/KitCollection.js';
import CompleteMolecule from '../model/CompleteMolecule.js';
import MultipleCollectionBoxNode from './MultipleCollectionBoxNode.js';
import SingleCollectionBoxNode from './SingleCollectionBoxNode.js';

class CollectionAreaNode extends Node {

  // Private properties
  private readonly collectionBoxNodes: ( SingleCollectionBoxNode | MultipleCollectionBoxNode )[] = [];

  /**
   * @param collection - The kit collection
   * @param isSingleCollectionMode - Whether this is single collection mode
   * @param toModelBounds - Function to convert bounds to model coordinates
   * @param showDialogCallback - Callback to show the 3D dialog
   * @param updateRefillButton - Callback to update the refill button state
   */
  public constructor( collection: KitCollection, isSingleCollectionMode: boolean, toModelBounds: ( bounds: any ) => any, showDialogCallback: ( completeMolecule: CompleteMolecule ) => void, updateRefillButton: () => void ) { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when bounds types are available, see https://github.com/phetsims/build-a-molecule/issues/245
    super();

    // Container for collection boxes and reset collection button.
    const allCollectionItemsVBox = new VBox( { spacing: 15 } );
    this.addChild( allCollectionItemsVBox );

    // Create and add all collection box nodes.
    ( collection as any ).collectionBoxes.forEach( ( collectionBox: any ) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when KitCollection types are available, see https://github.com/phetsims/build-a-molecule/issues/245
      const collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback ) :
                                new MultipleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback );
      this.collectionBoxNodes.push( collectionBoxNode );
      allCollectionItemsVBox.addChild( collectionBoxNode );
    } );

    // Reset collection button
    const resetCollectionButton = new RefreshButton( {
      listener() {
        ( collection as any ).resetKitsAndBoxes(); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when KitCollection types are available, see https://github.com/phetsims/build-a-molecule/issues/245
        updateRefillButton();
      },
      interruptListener: Display.INTERRUPT_OTHER_POINTERS as any, // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Display types are available, see https://github.com/phetsims/build-a-molecule/issues/245
      iconHeight: 20,
      xMargin: 15,
      yMargin: 5,
      baseColor: Color.ORANGE,
      soundPlayer: nullSoundPlayer
    } );
    resetCollectionButton.touchArea = resetCollectionButton.bounds.dilated( 7 );

    // When any collection box quantity changes, update whether it is enabled
    const updateEnabled = () => {
      resetCollectionButton.enabled = ( collection as any ).collectionBoxes.some( ( box: any ) => box.quantityProperty.value ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when KitCollection types are available, see https://github.com/phetsims/build-a-molecule/issues/245
    };
    ( collection as any ).collectionBoxes.forEach( ( box: any ) => box.quantityProperty.link( updateEnabled ) ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when KitCollection types are available, see https://github.com/phetsims/build-a-molecule/issues/245

    allCollectionItemsVBox.addChild( resetCollectionButton );
  }

  /**
   * Update the positions of each collection box node
   */
  public updateCollectionBoxPositions(): void {
    this.collectionBoxNodes.forEach( collectionBoxNode => {
      ( collectionBoxNode as any ).updatePosition(); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when CollectionBoxNode types are available, see https://github.com/phetsims/build-a-molecule/issues/245
    } );
  }
}

buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
export default CollectionAreaNode;