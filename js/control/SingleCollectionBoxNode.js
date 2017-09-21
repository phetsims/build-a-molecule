// Copyright 2013-2017, University of Colorado Boulder

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var CollectionBoxNode = require( 'BUILD_A_MOLECULE/control/CollectionBoxNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var collectionSingleFormatString = require( 'string!BUILD_A_MOLECULE/collection.single.format' );

  function SingleCollectionBoxNode( box, toModelBounds ) {
    CollectionBoxNode.call( this, box, toModelBounds );

    assert && assert( box.capacity === 1 );

    this.addHeaderNode( new RichText( StringUtils.format( collectionSingleFormatString,
      box.moleculeType.getGeneralFormulaFragment(),
      box.moleculeType.getDisplayName() ), {
      font: new PhetFont( {
        size: 15,
        weight: 'bold'
      } )
    } ) );
  }
  buildAMolecule.register( 'SingleCollectionBoxNode', SingleCollectionBoxNode );

  inherit( CollectionBoxNode, SingleCollectionBoxNode );

  /*---------------------------------------------------------------------------*
   * precomputation of largest single collection box size
   *----------------------------------------------------------------------------*/
  var maxBounds = Bounds2.NOTHING;

  _.each( MoleculeList.collectionBoxMolecules, function( molecule ) {
    // fake boxes
    var boxBounds = new SingleCollectionBoxNode( new CollectionBox( molecule, 1 ), function( node ) {
      return node.bounds;
    } ).bounds;

    maxBounds = maxBounds.union( boxBounds );
  } );

  SingleCollectionBoxNode.maxWidth = maxBounds.width;
  SingleCollectionBoxNode.maxHeight = maxBounds.height;

  return SingleCollectionBoxNode;
} );
