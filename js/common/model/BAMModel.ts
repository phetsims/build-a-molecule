// Copyright 2020-2025, University of Colorado Boulder

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
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMBucket from '../model/BAMBucket.js';
import CollectionBox from '../model/CollectionBox.js';
import Kit from '../model/Kit.js';
import CollectionLayout from './CollectionLayout.js';
import CompleteMolecule from './CompleteMolecule.js';
import KitCollection from './KitCollection.js';
import { COLLECTION_BOX_MOLECULES } from './MoleculeList.js';

type SelfOptions = {
  isMultipleCollection: boolean;
};

type BAMModelOptions = SelfOptions;

class BAMModel {

  public readonly currentCollectionProperty: Property<KitCollection>;
  public readonly buttonClickedProperty: BooleanProperty;

  // Fires single parameter of {KitCollection}
  public readonly addedCollectionEmitter: Emitter<[ KitCollection ]>;
  public readonly removedCollectionEmitter: Emitter<[ KitCollection ]>;

  public readonly collectionLayout: CollectionLayout;
  public readonly stepEmitter: Emitter<[ number ]>;

  public collections: KitCollection[]; // Made mutable for reset() method
  public currentIndex: number;
  public readonly dialogMoleculeProperty: Property<CompleteMolecule | null>;

  // Declare the first collection we will add
  public readonly firstCollection: KitCollection;

  // Generates a new kit collection
  public readonly regenerateCallback: () => void;

  private readonly options: BAMModelOptions;

  public constructor( firstCollection: KitCollection, collectionLayout: CollectionLayout, providedOptions: BAMModelOptions ) {
    const options = optionize<BAMModelOptions, SelfOptions, EmptySelfOptions>()( {
      // Empty defaults - isMultipleCollection is required
    }, providedOptions );

    this.options = options;
    this.currentCollectionProperty = new Property( firstCollection );
    this.buttonClickedProperty = new BooleanProperty( false );
    this.addedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );
    this.removedCollectionEmitter = new Emitter( { parameters: [ { valueType: KitCollection } ] } );
    this.collectionLayout = collectionLayout;
    this.stepEmitter = new Emitter( {
      parameters: [ { valueType: 'number' } ],
      disableListenerLimit: true
    } );
    this.collections = [];
    this.currentIndex = 0;
    this.dialogMoleculeProperty = new Property<CompleteMolecule | null>( null );
    this.firstCollection = firstCollection;
    this.addCollection( firstCollection );
    this.regenerateCallback = () => {
      this.addCollection( this.generateKitCollection(
        options.isMultipleCollection,
        this.firstCollection.collectionBoxes.length === 5 ? 5 : 4,
        this.stepEmitter,
        this.collectionLayout
      ) );
    };
  }

  /**
   * @param dt - time elapsed in seconds
   */
  public step( dt: number ): void {
    this.stepEmitter.emit( dt );
  }

  /**
   * Add a kit collection and make it the current collection
   */
  public addCollection( collection: KitCollection ): void {
    this.collections.push( collection );
    this.addedCollectionEmitter.emit( collection );

    // switch to collection
    this.currentIndex = this.collections.indexOf( collection );
    this.currentCollectionProperty.value = collection;
  }


  public reset(): void {

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
   * Checks if there exists a collection that is before the current collection
   */
  public hasPreviousCollection(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Checks if there exists a collection that is after the current collection
   */
  public hasNextCollection(): boolean {
    return this.currentIndex < this.collections.length - 1;
  }

  /**
   * Swap to the collection before the current collection
   */
  public switchToPreviousCollection(): void {
    this.switchTo( this.collections[ this.currentIndex - 1 ] );
  }

  /**
   * Swap to the collection after the current collection
   */
  public switchToNextCollection(): void {
    this.switchTo( this.collections[ this.currentIndex + 1 ] );
  }

  /**
   * Swap to a specific collection
   */
  private switchTo( collection: KitCollection ): void {
    this.currentIndex = this.collections.indexOf( collection );
    this.currentCollectionProperty.value = collection;
  }

  /**
   * Remove a specific collection
   */
  private removeCollection( collection: KitCollection ): void {
    assert && assert( this.currentCollectionProperty.value !== collection );
    this.collections.shift();
    this.removedCollectionEmitter.emit( collection );
  }

  /**
   * Select a random molecule from the data set of possible collection box molecules
   */
  private pickRandomMoleculeNotIn( molecules: CompleteMolecule[] ): CompleteMolecule {
    // Infinite loop. We're living on the edge now, baby!
    // TODO: Maybe we should have a max number of iterations? See https://github.com/phetsims/build-a-molecule/issues/245
    while ( true ) {
      const molecule = COLLECTION_BOX_MOLECULES[ dotRandom.nextIntBetween( 0, COLLECTION_BOX_MOLECULES.length - 1 ) ];
      if ( !molecules.includes( molecule ) ) {
        return molecule;
      }
    }
  }

  /**
   * Generate a group of collection boxes and kits such that the boxes can be filled.
   * @param allowMultipleMolecules Whether collection boxes can have more than 1 molecule
   * @param numBoxes Number of collection boxes
   * @param stepEmitter
   * @param collectionLayout
   * @returns A consistent kitCollection
   */
  public generateKitCollection( allowMultipleMolecules: boolean, numBoxes: number, stepEmitter: Emitter<[ number ]>, collectionLayout: CollectionLayout ): KitCollection {
    const maxInBox = 3;
    const usedMolecules: CompleteMolecule[] = [];
    const kits: Kit[] = [];
    const boxes: CollectionBox[] = [];
    let molecules: CompleteMolecule[] = []; // store all the molecules that will need to be created

    let molecule: CompleteMolecule; // used twice in two different loops :(

    for ( let i = 0; i < numBoxes; i++ ) {
      molecule = this.pickRandomMoleculeNotIn( usedMolecules );
      usedMolecules.push( molecule );

      let numberInBox = allowMultipleMolecules ? dotRandom.nextIntBetween( 1, maxInBox ) : 1;

      // restrict the number of carbon that we can have
      const carbonCount = molecule.getHistogram().getQuantity( Element.C );
      if ( carbonCount > 1 ) {
        numberInBox = Math.min( 2, numberInBox );
      }

      const box = new CollectionBox( molecule, numberInBox, {} );
      boxes.push( box );

      // add in that many molecules
      for ( let j = 0; j < ( box ).capacity; j++ ) {

        molecules.push( molecule.copy() as CompleteMolecule );
      }
    }

    // randomize the molecules that we will pull from
    molecules = dotRandom.shuffle( molecules );

    // while more molecules to construct are left, create another kit
    while ( molecules.length ) {
      const buckets: BAMBucket[] = [];

      // pull off the 1st molecule
      molecule = molecules[ 0 ];

      // NOTE: for the future, we could potentially add another type of atom?

      const targetFormula = molecule.getHillSystemFormulaFragment();
      const equivalentMoleculesRemaining = molecules.filter( moleculeStructure =>
        moleculeStructure.getHillSystemFormulaFragment() === targetFormula
      ).length;

      const ableToIncreaseMultiple = allowMultipleMolecules && equivalentMoleculesRemaining > 1;
      let atomMultiple = 1 + ( ableToIncreaseMultiple ? equivalentMoleculesRemaining : 0 );

      // for each type of atom
      // Remove duplicates from element list
      const uniqueElements = molecule.getElementList().filter( ( element, index, arr ) => arr.indexOf( element ) === index );
      const elementBuckets = this.createBucketsForElements( uniqueElements, molecule, atomMultiple, stepEmitter );
      buckets.push( ...elementBuckets );

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

    const collection = new KitCollection( {} );
    kits.forEach( collection.addKit.bind( collection ) );
    boxes.forEach( collection.addCollectionBox.bind( collection ) );
    return collection;
  }

  /**
   * Helper method to create buckets for a list of elements, avoiding loop function issues
   * @param elements - The elements to create buckets for
   * @param molecule - The molecule containing the elements
   * @param atomMultiple - The multiplier for atom count
   * @param stepEmitter - Step emitter for the buckets
   * @returns Array of created buckets
   */
  private createBucketsForElements( elements: Element[], molecule: CompleteMolecule, atomMultiple: number, stepEmitter: Emitter<[ number ]> ): BAMBucket[] {
    return elements.map( element => this.createBucketForElement( element, molecule, atomMultiple, stepEmitter ) );
  }

  /**
   * Helper method to create a bucket for an element, avoiding loop function issues
   * @param element - The element to create a bucket for
   * @param molecule - The molecule containing the element
   * @param atomMultiple - The multiplier for atom count
   * @param stepEmitter - Step emitter for the bucket
   * @returns The created bucket
   */
  private createBucketForElement( element: Element, molecule: CompleteMolecule, atomMultiple: number, stepEmitter: Emitter<[ number ]> ): BAMBucket {
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

    return new BAMBucket( new Dimension2( bucketWidth, 200 ), stepEmitter, element, atomCount );
  }
}

buildAMolecule.register( 'BAMModel', BAMModel );
export default BAMModel;