// Copyright 2020-2022, University of Colorado Boulder

/**
 * Displays a collection box that can collect multiple molecules with two text labels above. One shows the "goal", and the other shows the current
 * quantity present in the box.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { RichText } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import CollectionBoxNode from './CollectionBoxNode.js';

class MultipleCollectionBoxNode extends CollectionBoxNode {
  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   */
  constructor( box, toModelBounds, showDialogCallback ) {
    super( box, toModelBounds, showDialogCallback );

    // Number of molecules that can be collected
    const quantityNode = new RichText( '', {
      font: new PhetFont( {
        size: 14
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } );

    // Update the number of collections available
    box.quantityProperty.link( quantity => {
      if ( quantity === 0 ) {
        quantityNode.string = BuildAMoleculeStrings.collectionMultipleQuantityEmpty;
      }
      else {
        quantityNode.string = StringUtils.fillIn( BuildAMoleculeStrings.collectionMultipleQuantityPattern, {
          number: quantity,
          formula: box.moleculeType.getGeneralFormulaFragment()
        } );
      }
    } );
    this.insertChild( 0, quantityNode );

    // General formula for the molecule goal
    this.insertChild( 0, new RichText( StringUtils.fillIn( BuildAMoleculeStrings.collectionMultipleGoalPattern, {
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


buildAMolecule.register( 'MultipleCollectionBoxNode', MultipleCollectionBoxNode );
export default MultipleCollectionBoxNode;