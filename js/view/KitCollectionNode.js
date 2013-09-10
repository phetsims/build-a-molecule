// Copyright 2002-2013, University of Colorado

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Constants = require( 'BAM/Constants' );
  var KitView = require( 'BAM/view/KitView' );
  var Node = require( 'SCENERY/nodes/Node' );
  
  var KitCollectionNode = namespace.KitCollectionNode = function KitCollectionNode( currentColletionProperty, collection, view ) {
    Node.call( this, {} );
    var that = this;
    
    /*---------------------------------------------------------------------------*
    * layers
    *----------------------------------------------------------------------------*/
    var bottomLayer = new Node();
    var metadataLayer = new Node();
    var atomLayer = new Node();
    var topLayer = new Node();

    this.addChild( bottomLayer );
    this.addChild( atomLayer );
    this.addChild( metadataLayer );
    this.addChild( topLayer );

    // TODO: incomplete: add in KitPanel
    // bottomLayer.addChild( new KitPanel( collection, collectionList.getAvailableKitBounds() ) );
    
    _.each( collection.kits, function( kit ) {
      var kitView = new KitView( kit, view );
      bottomLayer.addChild( kitView.getBottomLayer() );
      atomLayer.addChild( kitView.getAtomLayer() );
      metadataLayer.addChild( kitView.getMetadataLayer() );
      topLayer.addChild( kitView.getTopLayer() );
    } );
    
    // set visibility based on whether our collection is the current one
    currentColletionProperty.link( function( newCollection ) {
      that.visible = newCollection === collection;
    } );
  };
  
  inherit( Node, KitCollectionNode );
  
  return KitCollectionNode;
} );
