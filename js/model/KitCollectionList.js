// Copyright 2013-2019, University of Colorado Boulder

/**
 * An internal list of collections that a user will be able to scroll through using a control on the collection area
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {KitCollection} firstCollection
   * @param {CollectionLayout} collectionLayout
   * @param {Emitter} stepEmitter
   * @param {function} createKitCollection
   */
  function KitCollectionList( firstCollection, collectionLayout, stepEmitter, createKitCollection ) {

    // @public {Property.<KitCollection>}
    this.currentCollectionProperty = new Property( firstCollection );

    // @public {Emitter} - Fires single parameter of {KitCollection}
    this.addedCollectionEmitter = new Emitter( { validators: [ { valueType: KitCollection } ] } );
    this.removedCollectionEmitter = new Emitter( { validators: [ { valueType: KitCollection } ] } );

    this.createKitCollection = createKitCollection;
    this.collectionLayout = collectionLayout;
    this.stepEmitter = stepEmitter;
    this.collections = [];
    this.currentIndex = 0;
    this.addCollection( firstCollection );
  }

  buildAMolecule.register( 'KitCollectionList', KitCollectionList );

  inherit( Object, KitCollectionList, {
    step: function step( timeElapsed ) {
      this.stepEmitter.emit( timeElapsed );
    },
    generateKitCollection: function generateKitCollection() {
      return this.createKitCollection( this.collectionLayout, this.stepEmitter );
    },
    switchTo: function( collection ) {
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollectionProperty.value = collection;
    },

    addCollection: function( collection ) {
      this.collections.push( collection );

      // TODO: notifications before changing current collection - is this desired? may be
      this.addedCollectionEmitter.emit( collection );

      // switch to collection
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollectionProperty.value = collection;
    },

    removeCollection: function( collection ) {
      assert && assert( this.currentCollectionProperty.value !== collection );
      this.collections.shift();

      this.removedCollectionEmitter.emit( collection );
    },

    reset: function() {
      var self = this;

      // switch to the first collection
      this.switchTo( this.collections[ 0 ] );

      // reset it
      this.collections[ 0 ].resetAll();

      // remove all the other collections
      this.collections.slice( 0 ).forEach( function( collection ) {
        if ( collection !== self.currentCollectionProperty.value ) {
          self.removeCollection( collection );
        }
      } );
    },

    get availableKitBounds() {
      return this.collectionLayout.availableKitBounds;
    },

    get availablePlayAreaBounds() {
      return this.collectionLayout.availablePlayAreaBounds;
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

  return KitCollectionList;
} );
