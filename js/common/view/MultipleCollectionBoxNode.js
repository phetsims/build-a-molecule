// Copyright 2020, University of Colorado Boulder

/**
 * Displays a collection box that can collect multiple molecules with two text labels above. One shows the "goal", and the other shows the current
 * quantity present in the box.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import buildAMoleculeStrings from '../../build-a-molecule-strings.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import CollectionBox from '../model/CollectionBox.js';
import MoleculeList from '../model/MoleculeList.js';
import CollectionBoxNode from './CollectionBoxNode.js';

const collectionMultipleGoalPatternString = buildAMoleculeStrings.collectionMultipleGoalPattern;
const collectionMultipleQuantityEmptyString = buildAMoleculeStrings.collectionMultipleQuantityEmpty;
const collectionMultipleQuantityPatternString = buildAMoleculeStrings.collectionMultipleQuantityPattern;

class MultipleCollectionBoxNode extends CollectionBoxNode {
  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   *
   */
  constructor( box, toModelBounds, showDialogCallback ) {
    super( box, toModelBounds, showDialogCallback, { spacing: 2 } );

    // Number of molecules that can be collected
    const quantityNode = new RichText( '', {
      font: new PhetFont( {
        size: 14
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } );

    box.quantityProperty.link( quantity => {
      if ( quantity === 0 ) {
        quantityNode.text = collectionMultipleQuantityEmptyString;
      }
      else {
        quantityNode.text = StringUtils.fillIn( collectionMultipleQuantityPatternString, {
          number: quantity,
          formula: box.moleculeType.getGeneralFormulaFragment()
        } );
      }
    } );
    this.insertChild( 0, quantityNode );

    // General formula for the molecule goal
    this.insertChild( 0, new RichText( StringUtils.fillIn( collectionMultipleGoalPatternString, {
      number: box.capacity,
      formula: box.moleculeType.getGeneralFormulaFragment()
    } ), {
      font: new PhetFont( {
        size: 15,
        weight: 'bold'
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } ) );
  }
}

/*---------------------------------------------------------------------------*
 * precomputation of largest single collection box size
 *----------------------------------------------------------------------------*/
// TODO: simplify this code from single/multiple into one
let maxBounds = Bounds2.NOTHING;

MoleculeList.collectionBoxMolecules.forEach( molecule => {
  // fake boxes
  const boxBounds = new MultipleCollectionBoxNode(
    new CollectionBox( molecule, 1, { initializeAudio: false } ),
    node => {
      return node.bounds;
    },
    () => {} ).bounds;

  maxBounds = maxBounds.union( boxBounds );
} );

MultipleCollectionBoxNode.maxWidth = maxBounds.width;
MultipleCollectionBoxNode.maxHeight = maxBounds.height;

buildAMolecule.register( 'MultipleCollectionBoxNode', MultipleCollectionBoxNode );
export default MultipleCollectionBoxNode;