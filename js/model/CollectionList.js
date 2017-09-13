// Copyright 2013-2015, University of Colorado Boulder

/**
 * An internal list of collections that a user will be able to scroll through using a control on the collection area
 *
 * TODO: rename to 'KitCollectionList'?
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /*
   * @param {KitCollection} firstCollection
   * @param {LayoutBounds}  layoutBounds
   */
  function CollectionList( firstCollection, layoutBounds, tickEmitter ) {
    PropertySet.call( this, {
      currentCollection: firstCollection
    } );

    // @public {Emitter} - Fires single parameter of {KitCollection}
    this.addedCollectionEmitter = new Emitter();
    this.removedCollectionEmitter = new Emitter();

    this.layoutBounds = layoutBounds;
    this.tickEmitter = tickEmitter;
    this.collections = [];
    this.currentIndex = 0;
    this.addCollection( firstCollection );
  }
  buildAMolecule.register( 'CollectionList', CollectionList );

  inherit( PropertySet, CollectionList, {
    switchTo: function( collection ) {
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollection = collection;
    },

    addCollection: function( collection ) {
      this.collections.push( collection );

      // TODO: notifications before changing current collection - is this desired? may be
      this.addedCollectionEmitter.emit1( collection );

      // switch to collection
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollection = collection;
    },

    removeCollection: function( collection ) {
      assert && assert( this.currentCollection !== collection );
      this.collections.splice( this.collections.indexOf( collection ), 1 ); // TODO: use remove() instead of splice()

      this.removedCollectionEmitter.emit1( collection );
    },

    reset: function() {
      var self = this;

      // switch to the first collection
      this.switchTo( this.collections[ 0 ] );

      // reset it
      this.collections[ 0 ].resetAll();

      // remove all the other collections
      _.each( this.collections.slice( 0 ), function( collection ) {
        if ( collection !== self.currentCollection ) {
          self.removeCollection( collection );
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
