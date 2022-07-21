// Copyright 2020-2022, University of Colorado Boulder

/**
 * An internal list of collections that a user will be able to scroll through using a control on the collection area
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMBucket from '../model/BAMBucket.js';
import CollectionBox from '../model/CollectionBox.js';
import Kit from '../model/Kit.js';
import MoleculeList from '../model/MoleculeList.js';
import KitCollection from './KitCollection.js';

class BAMModel {

  /**
   * @param {KitCollection} firstCollection
   * @param {CollectionLayout} collectionLayout
   * @param {Object} config
   */
  constructor( firstCollection, collectionLayout, config ) {
    config = merge( {

      // {boolean} Determines whether the collection is built for a single or multiple collection box
      isMultipleCollection: required( config.isMultipleCollection )

    }, config );
    assert && assert( config.isMultipleCollection !== null, 'isSingleCollection is required' );


    // @public {Property.<KitCollection>}
    this.currentCollectionProperty = new Property( firstCollection );

    // @public {BooleanProperty}
    this.buttonClickedProperty = new BooleanProperty( false );

    // @public {Emitter} - Fires single parameter of {KitCollection}
    this.addedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );
    this.removedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );

    // @public {CollectionLayout}
    this.collectionLayout = collectionLayout;

    // @public {Emitter}
    this.stepEmitter = new Emitter( { parameters: [ { valueType: 'number' } ] } );

    // @public {Array.<Collection>}
    this.collections = [];

    // @public {number}
    this.currentIndex = 0;

    // @public {Property.<CompleteMolecule|null>}
    this.dialogMolecule = new Property( null );

    // @public {KitCollection} Declare the first collection we will add
    this.firstCollection = firstCollection;
    this.addCollection( firstCollection );

    // @public {function} Generates a new kit collection
    this.regenerateCallback = () => {
      this.addCollection( this.generateKitCollection(
        config.isMultipleCollection,
        this.firstCollection.collectionBoxes.length === 5 ? 5 : 4, // The Multiple Screen requires only 4 collection boxes.
        this.stepEmitter,
        this.collectionLayout
      ), true );
    };
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
  }

  /**
   * Select a random molecule from the data set of possible collection box molecules
   * @param {Array.<Molecules>}molecules
   *
   * @private
   * @returns {CompleteMolecule}
   */
  pickRandomMoleculeNotIn( molecules ) {
    // Infinite loop. We're living on the edge now, baby!
    while ( true ) { // eslint-disable-line no-constant-condition
      const molecule = MoleculeList.collectionBoxMolecules[
        dotRandom.nextIntBetween( 0, MoleculeList.collectionBoxMolecules.length - 1 )
        ];
      if ( !_.includes( molecules, molecule ) ) {
        return molecule;
      }
    }
  }

  /**
   * Generate a group of collection boxes and kits such that the boxes can be filled.
   * @param {boolean} allowMultipleMolecules Whether collection boxes can have more than 1 molecule
   * @param {number} numBoxes               Number of collection boxes
   * @param {Emitter} stepEmitter
   * @param {CollectionLayout} collectionLayout
   *
   * @public
   * @returns {KitCollection} A consistent kitCollection
   */
  generateKitCollection( allowMultipleMolecules, numBoxes, stepEmitter, collectionLayout ) {
    const maxInBox = 3;
    const usedMolecules = []; // [CompleteMolecule]
    const kits = [];
    const boxes = [];
    let molecules = []; // store all the molecules that will need to be created

    let molecule; // used twice in two different loops :(

    for ( let i = 0; i < numBoxes; i++ ) {
      molecule = this.pickRandomMoleculeNotIn( usedMolecules );
      usedMolecules.push( molecule );

      let numberInBox = allowMultipleMolecules ? dotRandom.nextIntBetween( 1, maxInBox ) : 1;

      // restrict the number of carbon that we can have
      const carbonCount = molecule.getHistogram().getQuantity( Element.C );
      if ( carbonCount > 1 ) {
        numberInBox = Math.min( 2, numberInBox );
      }

      const box = new CollectionBox( molecule, numberInBox );
      boxes.push( box );

      // add in that many molecules
      for ( let j = 0; j < box.capacity; j++ ) {
        molecules.push( molecule.copy() );
      }
    }

    // randomize the molecules that we will pull from
    molecules = dotRandom.shuffle( molecules );

    // while more molecules to construct are left, create another kit
    while ( molecules.length ) {
      const buckets = [];

      // pull off the 1st molecule
      molecule = molecules[ 0 ];

      // NOTE: for the future, we could potentially add another type of atom?

      let equivalentMoleculesRemaining = 0;
      molecules.forEach( moleculeStructure => {
        if ( moleculeStructure.getHillSystemFormulaFragment() === molecule.getHillSystemFormulaFragment() ) {
          equivalentMoleculesRemaining++;
        }
      } );

      const ableToIncreaseMultiple = allowMultipleMolecules && equivalentMoleculesRemaining > 1;
      let atomMultiple = 1 + ( ableToIncreaseMultiple ? equivalentMoleculesRemaining : 0 );

      // for each type of atom
      _.uniq( molecule.getElementList() ).forEach( element => {
        // find out how many atoms of this type we need
        let requiredAtomCount = 0;
        molecule.atoms.forEach( atom => {
          if ( atom.element.isSameElement( element ) ) {
            requiredAtomCount++;
          }
        } );

        // create a multiple of the required number of atoms, so they can construct 'atomMultiple' molecules with this
        let atomCount = requiredAtomCount * atomMultiple;

        // possibly add more, if we can only have 1 molecule per box
        if ( !element.isCarbon() && ( element.isHydrogen() || atomCount < 4 ) ) {
          atomCount += dotRandom.nextIntBetween( 0, 1 );
        }

        // funky math part. sqrt scales it so that we can get two layers of atoms if the atom count is above 2
        const bucketWidth = BAMBucket.calculateIdealBucketWidth( element.covalentRadius, atomCount );

        buckets.push( new BAMBucket( new Dimension2( bucketWidth, 200 ), stepEmitter, element, atomCount ) );
      } );

      // add the kit
      kits.push( new Kit( collectionLayout, buckets ) );

      // remove our 1 main molecule
      molecules.shift();
      atomMultiple -= 1;

      // NOTE: for the future, we could sort through and find out if we can construct another whole atom within our larger margins

      // if we can remove others (due to an atom multiple), remove the others
      while ( atomMultiple > 0 ) {
        for ( let k = 0; k < molecules.length; k++ ) {
          if ( molecules[ k ].getHillSystemFormulaFragment() === molecule.getHillSystemFormulaFragment() ) {
            molecules.splice( k, 1 );
            break;
          }
        }
        atomMultiple -= 1;
      }
    }

    const collection = new KitCollection();
    kits.forEach( collection.addKit.bind( collection ) );
    boxes.forEach( collection.addCollectionBox.bind( collection ) );
    return collection;
  }
}

buildAMolecule.register( 'BAMModel', BAMModel );
export default BAMModel;