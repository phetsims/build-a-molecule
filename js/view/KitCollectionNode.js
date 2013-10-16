// Copyright 2002-2013, University of Colorado

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var namespace = require( 'BAM/namespace' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Constants = require( 'BAM/Constants' );
  var KitView = require( 'BAM/view/KitView' );
  var KitPanel = require( 'BAM/control/KitPanel' );
  var Node = require( 'SCENERY/nodes/Node' );
  
  var KitCollectionNode = namespace.KitCollectionNode = function KitCollectionNode( collectionList, collection, view ) {
    Node.call( this, {} );
    var that = this;
    
    this.addChild( new KitPanel( collection, collectionList.availableKitBounds ) );

    _.each( collection.kits, function( kit ) {
      var kitView = new KitView( kit, view );
      that.addChild( kitView );
    } );
    
    // set visibility based on whether our collection is the current one
    collectionList.currentCollectionProperty.link( function( newCollection ) {
      that.visible = newCollection === collection;
    } );
  };
  
  inherit( Node, KitCollectionNode );
  
  return KitCollectionNode;
} );
