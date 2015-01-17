// Copyright 2002-2014, University of Colorado

/**
 * An internal list of collections that a user will be able to scroll through using a control on the collection area
 *
 * TODO: rename to 'KitCollectionList'?
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /*
   * @param {KitCollection} firstCollection
   * @param {LayoutBounds}  layoutBounds
   *
   * events:
   * addedCollection: function( kitCollection )
   * removedCollection: function( kitCollection )
   */
  var CollectionList = namespace.CollectionList = function CollectionList( firstCollection, layoutBounds, clock ) {
    PropertySet.call( this, {
      currentCollection: firstCollection
    } );

    this.layoutBounds = layoutBounds;
    this.clock = clock;
    this.collections = [];
    this.currentIndex = 0;
    this.addCollection( firstCollection );
  };

  inherit( PropertySet, CollectionList, {
    switchTo: function( collection ) {
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollection = collection;
    },

    addCollection: function( collection ) {
      this.collections.push( collection );

      // TODO: notifications before changing current collection - is this desired? may be
      this.trigger( 'addedCollection', collection );

      // switch to collection
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollection = collection;
    },

    removeCollection: function( collection ) {
      assert && assert( this.currentCollection !== collection );
      this.collections.splice( this.collections.indexOf( collection ), 1 ); // TODO: use remove() instead of splice()

      this.trigger( 'removedCollection', collection );
    },

    reset: function() {
      var list = this;

      // switch to the first collection
      this.switchTo( this.collections[ 0 ] );

      // reset it
      this.collections[ 0 ].resetAll();

      // remove all the other collections
      _.each( this.collections.slice( 0 ), function( collection ) {
        if ( collection !== list.currentCollection ) {
          list.removeCollection( collection );
        }
      } );
    },

    get availableKitBounds() {
      return this.layoutBounds.availableKitBounds;
    },

    get availablePlayAreaBounds() {
      return this.layoutBounds.availablePlayAreaBounds;
    },

    hasPreviousCollection: function() {
      return this.currentIndex > 0;
    },

    hasNextCollection: function() {
      return this.currentIndex < this.collections.length - 1;
    },

    switchToPreviousCollection: function() {
      this.switchTo( this.collections[ this.currentIndex - 1 ] );
    },

    switchToNextCollection: function() {
      this.switchTo( this.collections[ this.currentIndex + 1 ] );
    }
  } );

  return CollectionList;
} );
