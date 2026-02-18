// Copyright 2020-2026, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
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

export default class SingleCollectionBoxNode extends CollectionBoxNode {

  public constructor( box: CollectionBox, toModelBounds: ( node: Node ) => Bounds2, showDialogCallback: ( completeMolecule: CompleteMolecule ) => void ) {
    super( box, toModelBounds, showDialogCallback );
    assert && assert( box.capacity === 1 );
    this.insertChild( 0, new RichText( StringUtils.fillIn( BuildAMoleculeStrings.collectionSinglePattern, {
      general: StringUtils.wrapLTR( box.moleculeType.getGeneralFormulaFragment() ),
      display: box.moleculeType.getDisplayName()
    } ), {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } ) );
  }
}

buildAMolecule.register( 'SingleCollectionBoxNode', SingleCollectionBoxNode );