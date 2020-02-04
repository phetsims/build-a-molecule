// Copyright 2020, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionBox = require( 'BUILD_A_MOLECULE/common/model/CollectionBox' );
  const CollectionBoxNode = require( 'BUILD_A_MOLECULE/common/view/CollectionBoxNode' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/common/model/MoleculeList' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  const collectionSinglePatternString = require( 'string!BUILD_A_MOLECULE/collectionSinglePattern' );

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

  return buildAMolecule.register( 'SingleCollectionBoxNode', SingleCollectionBoxNode );
} );
