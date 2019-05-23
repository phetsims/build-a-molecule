// Copyright 2013-2017, University of Colorado Boulder

/**
 * Displays a collection box that can collect multiple molecules with two text labels above. One shows the "goal", and the other shows the current
 * quantity present in the box.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var CollectionBoxNode = require( 'BUILD_A_MOLECULE/view/CollectionBoxNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var collectionMultipleGoalPatternString = require( 'string!BUILD_A_MOLECULE/collectionMultipleGoalPattern' );
  var collectionMultipleQuantityEmptyString = require( 'string!BUILD_A_MOLECULE/collectionMultipleQuantityEmpty' );
  var collectionMultipleQuantityPatternString = require( 'string!BUILD_A_MOLECULE/collectionMultipleQuantityPattern' );

  /**
   * @param {CollectionBox} box
   * @param {Function} toModelBounds
   * @constructor
   */
  function MultipleCollectionBoxNode( box, toModelBounds ) {
    CollectionBoxNode.call( this, box, toModelBounds );

    this.addHeaderNode( new RichText( StringUtils.fillIn( collectionMultipleGoalPatternString, {
      number: box.capacity,
      formula: box.moleculeType.getGeneralFormulaFragment()
    } ), {
      font: new PhetFont( {
        size: 15,
        weight: 'bold'
      } )
    } ) );

    var quantityNode = new RichText( '', {
      font: new PhetFont( {
        size: 14
      } )
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

    this.addHeaderNode( quantityNode );
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
