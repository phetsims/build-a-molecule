// Copyright 2013-2019, University of Colorado Boulder

/**
 * An internal list of collections that a user will be able to scroll through using a control on the collection area
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Emitter = require( 'AXON/Emitter' );
  const KitCollection = require( 'BUILD_A_MOLECULE/common/model/KitCollection' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Property = require( 'AXON/Property' );

  class KitCollectionList {

    /**
     * @param {KitCollection} firstCollection
     * @param {CollectionLayout} collectionLayout
     * @param {Emitter} stepEmitter
     * @param {function} createKitCollection
     */
    constructor( firstCollection, collectionLayout, stepEmitter, createKitCollection ) {

      // @public {Property.<KitCollection>}
      this.currentCollectionProperty = new Property( firstCollection );

      // @public {Emitter} - Fires single parameter of {KitCollection}
      this.addedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );
      this.removedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );

      // @public
      this.atomsInPlayArea = new ObservableArray();
      this.createKitCollection = createKitCollection;
      this.collectionLayout = collectionLayout;
      this.stepEmitter = stepEmitter;
      this.collections = [];
      this.currentIndex = 0;
      this.firstCollection = firstCollection;
      this.addCollection( firstCollection );
    }

    step( timeElapsed ) {
      this.stepEmitter.emit( timeElapsed );
    }

    generateKitCollection() {
      return this.createKitCollection( this.collectionLayout, this.stepEmitter );
    }

    switchTo( collection ) {
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollectionProperty.value = collection;
    }

    addCollection( collection ) {
      this.collections.push( collection );

      // TODO: notifications before changing current collection - is this desired? may be
      this.addedCollectionEmitter.emit( collection );

      // switch to collection
      this.currentIndex = this.collections.indexOf( collection );
      this.currentCollectionProperty.value = collection;
    }

    removeCollection( collection ) {
      assert && assert( this.currentCollectionProperty.value !== collection );
      this.collections.shift();
      this.removedCollectionEmitter.emit( collection );
    }

    reset() {

      // switch to the first collection
      this.switchTo( this.collections[ 0 ] );

      // reset it
      this.collections[ 0 ].resetAll();

      // remove all the other collections
      this.collections.slice( 0 ).forEach( collection => {
        if ( collection !== this.currentCollectionProperty.value ) {
          this.removeCollection( collection );
        }
      } );
      this.collections = [ this.firstCollection ];
    }

    availableKitBounds() {
      return this.collectionLayout.availableKitBounds;
    }

    availablePlayAreaBounds() {
      return this.collectionLayout.availablePlayAreaBounds;
    }

    hasPreviousCollection() {
      return this.currentIndex > 0;
    }

    hasNextCollection() {
      return this.currentIndex < this.collections.length - 1;
    }

    switchToPreviousCollection() {
      this.switchTo( this.collections[ this.currentIndex - 1 ] );
    }

    switchToNextCollection() {
      this.switchTo( this.collections[ this.currentIndex + 1 ] );
    }
  }

  return buildAMolecule.register( 'KitCollectionList', KitCollectionList );
} );
