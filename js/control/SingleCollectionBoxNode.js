// Copyright 2002-2013, University of Colorado

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var collection_single_formatString = require( 'string!BAM/collection.single.format' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );
  var CollectionBoxNode = require( 'BAM/control/CollectionBoxNode' );
  var MoleculeList = require( 'BAM/model/MoleculeList' );
  var CollectionBox = require( 'BAM/model/CollectionBox' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  
  var SingleCollectionBoxNode = namespace.SingleCollectionBoxNode = function SingleCollectionBoxNode( box, toModelBounds ) {
    CollectionBoxNode.call( this, box, toModelBounds );
    
    assert && assert( box.capacity === 1 );
    
    this.addHeaderNode( new HTMLText( StringUtils.format( collection_single_formatString,
                                                          box.moleculeType.getGeneralFormulaFragment(),
                                                          box.moleculeType.getDisplayName() ), {
      font: new PhetFont( {
        size: 15,
        weight: 'bold'
      } )
    } ) );
  };
  
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
