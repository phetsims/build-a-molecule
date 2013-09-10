// Copyright 2002-2013, University of Colorado

/**
 * Common canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var KitCollectionNode = require( 'BAM/view/KitCollectionNode' );

  var Shape = require( 'KITE/Shape' );

  var BAMView = namespace.BAMView = function( collectionList ) {
    Node.call( this, { renderer: 'svg' } );
    
    this.collectionList = collectionList;
    
    this.addCollection( collectionList.currentCollection );
    
    collectionList.on( 'addedCollection', this.addCollection.bind( this ) );
  };

  return inherit( Node, BAMView, {
    addCollection: function( collection ) {
      var result = new KitCollectionNode( this.collectionList.currentCollectionProperty, collection, this );
      this.addChild( result );
      
      // supposedly: return this so we can manipulate it in an override....?
      return result;
    },
    
    layout: function( width, height ) {
      
    }
  } );
} );
