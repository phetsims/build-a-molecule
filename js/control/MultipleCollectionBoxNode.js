// Copyright 2013-2015, University of Colorado Boulder

/**
 * Displays a collection box that can collect multiple molecules with two text labels above. One shows the "goal", and the other shows the current
 * quantity present in the box.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var CollectionBoxNode = require( 'BUILD_A_MOLECULE/control/CollectionBoxNode' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // strings
  var collectionMultipleGoalFormatString = require( 'string!BUILD_A_MOLECULE/collection.multiple.goalFormat' );
  var collectionMultipleQuantityEmptyString = require( 'string!BUILD_A_MOLECULE/collection.multiple.quantityEmpty' );
  var collectionMultipleQuantityFormatString = require( 'string!BUILD_A_MOLECULE/collection.multiple.quantityFormat' );

  var MultipleCollectionBoxNode = namespace.MultipleCollectionBoxNode = function MultipleCollectionBoxNode( box, toModelBounds ) {
    CollectionBoxNode.call( this, box, toModelBounds );

    this.addHeaderNode( new SubSupText( StringUtils.format( collectionMultipleGoalFormatString,
      box.capacity,
      box.moleculeType.getGeneralFormulaFragment() ), {
      font: new PhetFont( {
        size: 15,
        weight: 'bold'
      } )
    } ) );

    var quantityNode = new SubSupText( '', {
      font: new PhetFont( {
        size: 14
      } )
    } );

    box.quantityProperty.link( function( quantity ) {
      if ( quantity === 0 ) {
        quantityNode.text = collectionMultipleQuantityEmptyString;
      }
      else {
        quantityNode.text = StringUtils.format( collectionMultipleQuantityFormatString, quantity, box.moleculeType.getGeneralFormulaFragment() );
      }
    } );

    this.addHeaderNode( quantityNode );
  };

  inherit( CollectionBoxNode, MultipleCollectionBoxNode );

  /*---------------------------------------------------------------------------*
   * precomputation of largest single collection box size
   *----------------------------------------------------------------------------*/
  // TODO: simplify this code from single/multiple into one
  var maxBounds = Bounds2.NOTHING;

  _.each( MoleculeList.collectionBoxMolecules, function( molecule ) {
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
