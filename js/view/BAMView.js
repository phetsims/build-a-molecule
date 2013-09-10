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
  var Rectangle = require( 'DOT/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var KitCollectionNode = require( 'BAM/view/KitCollectionNode' );

  var Shape = require( 'KITE/Shape' );

  var BAMView = namespace.BAMView = function( collectionList ) {
    ScreenView.call( this, { renderer: 'svg' } );
    
    this.collectionList = collectionList;
    
    this.addCollection( collectionList.currentCollection );
    
    collectionList.on( 'addedCollection', this.addCollection.bind( this ) );
  };

  return inherit( ScreenView, BAMView, {
    addCollection: function( collection ) {
      var result = new KitCollectionNode( this.collectionList.currentCollectionProperty, collection, this );
      this.addChild( result );
      
      // supposedly: return this so we can manipulate it in an override....?
      return result;
    },
    
    layoutBounds: new Rectangle( 0, 0, Constants.stageSize.width, Constants.stageSize.height )
  } );
} );
