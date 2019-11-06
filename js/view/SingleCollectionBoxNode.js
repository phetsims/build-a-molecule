// Copyright 2013-2019, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  const CollectionBoxNode = require( 'BUILD_A_MOLECULE/view/CollectionBoxNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  const collectionSinglePatternString = require( 'string!BUILD_A_MOLECULE/collectionSinglePattern' );

  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   *
   * @constructor
   */
  function SingleCollectionBoxNode( box, toModelBounds, showDialogCallback ) {
    CollectionBoxNode.call( this, box, toModelBounds, showDialogCallback );
    assert && assert( box.capacity === 1 );
    this.addChild( new RichText( StringUtils.fillIn( collectionSinglePatternString,
      {
        general: box.moleculeType.getGeneralFormulaFragment(),
        display: box.moleculeType.getDisplayName()
      }, {
        font: new PhetFont( {
          size: 15,
          weight: 'bold'
        } ),
        maxWidth: BAMConstants.TEXT_MAX_WIDTH

      }
    ) ) );
  }

  buildAMolecule.register( 'SingleCollectionBoxNode', SingleCollectionBoxNode );

  inherit( CollectionBoxNode, SingleCollectionBoxNode );

  /*---------------------------------------------------------------------------*
   * precomputation of largest single collection box size
   *----------------------------------------------------------------------------*/
  let maxBounds = Bounds2.NOTHING;

  MoleculeList.collectionBoxMolecules.forEach( function( molecule ) {
    // fake boxes
    const boxBounds = new SingleCollectionBoxNode(
      new CollectionBox( molecule, 1, { initializeAudio: false } ),
      function( node ) {
        return node.bounds;
      },
      () => {} ).bounds;

    maxBounds = maxBounds.union( boxBounds );
  } );

  SingleCollectionBoxNode.maxWidth = maxBounds.width;
  SingleCollectionBoxNode.maxHeight = maxBounds.height;

  return SingleCollectionBoxNode;
} );
