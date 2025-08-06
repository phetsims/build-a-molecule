// Copyright 2020-2025, University of Colorado Boulder

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
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';
import CollectionBoxNode from './CollectionBoxNode.js';

export default class SingleCollectionBoxNode extends CollectionBoxNode {

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public constructor( box: any, toModelBounds: any, showDialogCallback: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when CollectionBox is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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