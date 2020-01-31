// Copyright 2020, University of Colorado Boulder

/**
 * Displays a collection box that can collect multiple molecules with two text labels above. One shows the "goal", and the other shows the current
 * quantity present in the box.
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
  const collectionMultipleGoalPatternString = require( 'string!BUILD_A_MOLECULE/collectionMultipleGoalPattern' );
  const collectionMultipleQuantityEmptyString = require( 'string!BUILD_A_MOLECULE/collectionMultipleQuantityEmpty' );
  const collectionMultipleQuantityPatternString = require( 'string!BUILD_A_MOLECULE/collectionMultipleQuantityPattern' );

  class MultipleCollectionBoxNode extends CollectionBoxNode {
    /**
     * @param {CollectionBox} box
     * @param {function} toModelBounds
     * @param {function} showDialogCallback
     *
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

  return buildAMolecule.register( 'MultipleCollectionBoxNode', MultipleCollectionBoxNode );
} );
