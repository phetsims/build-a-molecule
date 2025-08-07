// Copyright 2020-2025, University of Colorado Boulder

/**
 * Displays a collection box that can collect multiple molecules with two text labels above. One shows the "goal", and the other shows the current
 * quantity present in the box.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import CollectionBox from '../model/CollectionBox.js';
import CompleteMolecule from '../model/CompleteMolecule.js';
import CollectionBoxNode from './CollectionBoxNode.js';

class MultipleCollectionBoxNode extends CollectionBoxNode {

  private readonly quantityNode: RichText;

  /**
   * @param box - CollectionBox model
   * @param toModelBounds - Used to update position of the collection box
   * @param showDialogCallback - Callback for showing 3D dialog
   */
  public constructor( box: CollectionBox, toModelBounds: ( node: Node ) => Bounds2, showDialogCallback: ( completeMolecule: CompleteMolecule ) => void ) {
    super( box, toModelBounds, showDialogCallback );

    // Number of molecules that can be collected
    this.quantityNode = new RichText( '', {
      font: new PhetFont( {
        size: 14
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } );

    // Update the number of collections available
    box.quantityProperty.link( ( quantity: number ) => {
      if ( quantity === 0 ) {
        this.quantityNode.string = BuildAMoleculeStrings.collectionMultipleQuantityEmpty;
      }
      else {
        this.quantityNode.string = StringUtils.fillIn( BuildAMoleculeStrings.collectionMultipleQuantityPattern, {
          number: quantity,
          formula: StringUtils.wrapLTR( box.moleculeType.getGeneralFormulaFragment() )
        } );
      }
    } );
    this.insertChild( 0, this.quantityNode );

    // General formula for the molecule goal
    this.insertChild( 0, new RichText( StringUtils.fillIn( BuildAMoleculeStrings.collectionMultipleGoalPattern, {
      number: box.capacity,
      formula: StringUtils.wrapLTR( box.moleculeType.getGeneralFormulaFragment() )
    } ), {
      font: new PhetFont( {
        size: 15,
        weight: 'bold'
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } ) );
  }
}


buildAMolecule.register( 'MultipleCollectionBoxNode', MultipleCollectionBoxNode );
export default MultipleCollectionBoxNode;