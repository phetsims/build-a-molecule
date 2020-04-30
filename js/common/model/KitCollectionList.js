// Copyright 2020, University of Colorado Boulder

/**
 * An internal list of collections that a user will be able to scroll through using a control on the collection area
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import buildAMolecule from '../../buildAMolecule.js';
import KitCollection from './KitCollection.js';

class KitCollectionList {

  /**
   * @param {KitCollection} firstCollection
   * @param {CollectionLayout} collectionLayout
   * @param {Emitter} stepEmitter
   * @param {function} createKitCollection REVIEW: I can find no evidence of this ever being called? Can we remove this parameter?
   */
  constructor( firstCollection, collectionLayout, stepEmitter, createKitCollection ) {

    // @public {Property.<KitCollection>}
    this.currentCollectionProperty = new Property( firstCollection );

    // @public {BooleanProperty}
    this.buttonClickedProperty = new BooleanProperty( false );

    // @public {Emitter} - Fires single parameter of {KitCollection}
    this.addedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );
    this.removedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );

    // @public {function}
    //REVIEW: I can find no evidence of this ever being called?
    this.createKitCollection = createKitCollection;

    // @public {CollectionLayout}
    this.collectionLayout = collectionLayout;

    // @public {Emitter}
    this.stepEmitter = stepEmitter;

    // @public {Array.<Collection>}
    this.collections = [];

    // @public {number}
    this.currentIndex = 0;

    // @public {KitCollection} Declare the first collection we will add
    this.firstCollection = firstCollection;
    this.addCollection( firstCollection );
  }

  /**
   * @param {number} dt
   *
   * @public
   */
  step( dt ) {
    this.stepEmitter.emit( dt );
  }

  /**
   * Generate the kit collection
   * @public
   *
   * REVIEW: I don't see any usage of this
   *
   * @returns {function} REVIEW: Are we SURE that this would return a function anyway? Seems like a KitCollection?
   */
  generateKitCollection() {
    return this.createKitCollection( this.collectionLayout, this.stepEmitter );
  }

  /**
   * Add a kit collection and make it the current collection
   * @param {KitCollection} collection
   *
   * @public
   */
  addCollection( collection ) {
    this.collections.push( collection );
    this.addedCollectionEmitter.emit( collection );

    // switch to collection
    this.currentIndex = this.collections.indexOf( collection );
    this.currentCollectionProperty.value = collection;
  }

  /**
   * @public
   */
  reset() {

    // switch to the first collection
    this.switchTo( this.collections[ 0 ] );

    // reset it
    this.collections[ 0 ].reset();

    // remove all the other collections
    this.collections.slice().forEach( collection => {
      if ( collection !== this.currentCollectionProperty.value ) {
        this.removeCollection( collection );
      }
    } );
    this.collections = [ this.firstCollection ];
  }

  /**
   * Returns kit bounds within the collection layout
   *
   * @public
   * @returns {Bounds2}
   */
  availableKitBounds() {
    return this.collectionLayout.availableKitBounds;
  }

  /**
   * Returns play area bounds bounds within the collection layout
   *
   * @public
   * @returns {Bounds2}
   */
  availablePlayAreaBounds() {

    return this.collectionLayout.availablePlayAreaBounds;
  }

  /**
   * Checks if there exists a collection that is before the current collection
   *
   * @public
   * @returns {boolean}
   */
  hasPreviousCollection() {
    return this.currentIndex > 0;
  }

  /**
   * Checks if there exists a collection that is after the current collection
   *
   * @public
   * @returns {boolean}
   */
  hasNextCollection() {
    return this.currentIndex < this.collections.length - 1;
  }

  /**
   * Swap to the collection before the current collection
   *
   * @public
   */
  switchToPreviousCollection() {
    this.switchTo( this.collections[ this.currentIndex - 1 ] );
  }

  /**
   * Swap to the collection before the current collection
   *
   * @public
   */
  switchToNextCollection() {
    this.switchTo( this.collections[ this.currentIndex + 1 ] );
  }

  /**
   * Swap to a specific collection
   * @param {KitCollection} collection
   *
   * @private
   */
  switchTo( collection ) {
    this.currentIndex = this.collections.indexOf( collection );
    this.currentCollectionProperty.value = collection;
  }

  /**
   * Remove a specific collection
   * @param {KitCollection} collection
   * @private
   */
  removeCollection( collection ) {
    assert && assert( this.currentCollectionProperty.value !== collection );
    this.collections.shift();
    this.removedCollectionEmitter.emit( collection );

    // Remove listeners for collection boxes.
    collection.collectionBoxes.forEach( collectionBox => {
      //REVIEW: CollectionBox adds its own listener... we really shouldn't be removing all listeners, especially ones that are "private" no?
      collectionBox.addedMoleculeEmitter.removeAllListeners();
      collectionBox.removedMoleculeEmitter.removeAllListeners();
      collectionBox.acceptedMoleculeCreationEmitter.removeAllListeners();
    } );
  }
}

buildAMolecule.register( 'KitCollectionList', KitCollectionList );
export default KitCollectionList;