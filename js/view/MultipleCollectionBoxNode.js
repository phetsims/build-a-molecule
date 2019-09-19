// Copyright 2013-2019, University of Colorado Boulder

/**
 * Displays a collection box that can collect multiple molecules with two text labels above. One shows the "goal", and the other shows the current
 * quantity present in the box.
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
  const collectionMultipleGoalPatternString = require( 'string!BUILD_A_MOLECULE/collectionMultipleGoalPattern' );
  const collectionMultipleQuantityEmptyString = require( 'string!BUILD_A_MOLECULE/collectionMultipleQuantityEmpty' );
  const collectionMultipleQuantityPatternString = require( 'string!BUILD_A_MOLECULE/collectionMultipleQuantityPattern' );

  /**
   * @param {CollectionBox} box
   * @param {Function} toModelBounds
   * @constructor
   */
  function MultipleCollectionBoxNode( box, toModelBounds ) {
    CollectionBoxNode.call( this, box, toModelBounds );

    this.addChild( new RichText( StringUtils.fillIn( collectionMultipleGoalPatternString, {
      number: box.capacity,
      formula: box.moleculeType.getGeneralFormulaFragment()
    } ), {
      font: new PhetFont( {
        size: 15,
        weight: 'bold'
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } ) );

    var quantityNode = new RichText( '', {
      font: new PhetFont( {
        size: 14
      } ),
      maxWidth: BAMConstants.TEXT_MAX_WIDTH
    } );

    box.quantityProperty.link( function( quantity ) {
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

    this.addChild( quantityNode );
  }
  buildAMolecule.register( 'MultipleCollectionBoxNode', MultipleCollectionBoxNode );

  inherit( CollectionBoxNode, MultipleCollectionBoxNode );

  /*---------------------------------------------------------------------------*
   * precomputation of largest single collection box size
   *----------------------------------------------------------------------------*/
  // TODO: simplify this code from single/multiple into one
  var maxBounds = Bounds2.NOTHING;

  MoleculeList.collectionBoxMolecules.forEach( function( molecule ) {
    // fake boxes
    var boxBounds = new MultipleCollectionBoxNode( new CollectionBox( molecule, 1 ), function( node ) {
      return node.bounds;
    } ).bounds;

    maxBounds = maxBounds.union( boxBounds );
  } );

  MultipleCollectionBoxNode.maxWidth = maxBounds.width;
  MultipleCollectionBoxNode.maxHeight = maxBounds.height;

  return MultipleCollectionBoxNode;
} );
