// Copyright 2020, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
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

const collectionSinglePatternString = buildAMoleculeStrings.collectionSinglePattern;

class SingleCollectionBoxNode extends CollectionBoxNode {

  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   *
   */
  constructor( box, toModelBounds, showDialogCallback ) {
    super( box, toModelBounds, showDialogCallback );
    assert && assert( box.capacity === 1 );
    this.insertChild( 0, new RichText( StringUtils.fillIn( collectionSinglePatternString, {
      general: box.moleculeType.getGeneralFormulaFragment(),
      display: box.moleculeType.getDisplayName()
    } ), {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } ) );
  }
}

/*---------------------------------------------------------------------------*
 * precomputation of largest single collection box size
 *----------------------------------------------------------------------------*/
let maxBounds = Bounds2.NOTHING;

MoleculeList.collectionBoxMolecules.forEach( molecule => {
  // fake boxes
  const boxBounds = new SingleCollectionBoxNode(
    new CollectionBox( molecule, 1, { initializeAudio: false } ),
    node => {
      return node.bounds;
    },
    () => {} ).bounds;

  maxBounds = maxBounds.union( boxBounds );
} );

SingleCollectionBoxNode.maxWidth = maxBounds.width;
SingleCollectionBoxNode.maxHeight = maxBounds.height;

buildAMolecule.register( 'SingleCollectionBoxNode', SingleCollectionBoxNode );
export default SingleCollectionBoxNode;