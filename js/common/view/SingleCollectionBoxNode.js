// Copyright 2020, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import buildAMolecule from '../../buildAMolecule.js';
import buildAMoleculeStrings from '../../buildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import CollectionBox from '../model/CollectionBox.js';
import CollectionBoxNode from './CollectionBoxNode.js';

class SingleCollectionBoxNode extends CollectionBoxNode {

  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   */
  constructor( box, toModelBounds, showDialogCallback ) {
    super( box, toModelBounds, showDialogCallback );
    assert && assert( box.capacity === 1 );
    this.insertChild( 0, new RichText( StringUtils.fillIn( buildAMoleculeStrings.collectionSinglePattern, {
      general: box.moleculeType.getGeneralFormulaFragment(),
      display: box.moleculeType.getDisplayName()
    } ), {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } ) );
  }
}

// Precomputation of largest single collection box size
CollectionBoxNode.getPsuedoBoxBounds( SingleCollectionBoxNode, CollectionBox );

buildAMolecule.register( 'SingleCollectionBoxNode', SingleCollectionBoxNode );
export default SingleCollectionBoxNode;