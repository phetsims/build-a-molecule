// Copyright 2020-2025, University of Colorado Boulder

/**
 * Stores multiple instances of a single type of molecule. Keeps track of quantity, and has a desired capacity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import CompleteMolecule from './CompleteMolecule.js';
import Molecule from './Molecule.js';
import MoleculeStructure from './MoleculeStructure.js';

type SelfOptions = {
  initializeAudio?: boolean;
};

export type CollectionBoxOptions = SelfOptions;

class CollectionBox {

  public readonly quantityProperty: NumberProperty;
  public readonly cueVisibilityProperty: BooleanProperty;

  // Called with a single molecule parameter
  public readonly addedMoleculeEmitter: Emitter<[ Molecule ]>;
  public readonly removedMoleculeEmitter: Emitter<[ Molecule ]>;

  // An accepted molecule is a molecule that matches the goals in a collection box
  public readonly acceptedMoleculeCreationEmitter: Emitter<[ Molecule ]>;

  public readonly moleculeType: CompleteMolecule;
  public readonly capacity: number;
  private readonly molecules: Molecule[];

  // This is updated in CollectionBoxNode.updatePosition()
  public readonly dropBoundsProperty: Property<Bounds2>;

  /**
   * @param moleculeType
   * @param capacity
   * @param providedOptions
   */
  public constructor( moleculeType: CompleteMolecule, capacity: number, providedOptions?: CollectionBoxOptions ) {
    const options = optionize<CollectionBoxOptions, SelfOptions, EmptySelfOptions>()( {
      initializeAudio: true
    }, providedOptions );

    this.quantityProperty = new NumberProperty( 0 );
    this.cueVisibilityProperty = new BooleanProperty( false );
    this.addedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
    this.removedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
    this.acceptedMoleculeCreationEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
    this.moleculeType = moleculeType;
    this.capacity = capacity;
    this.molecules = [];
    this.dropBoundsProperty = new Property( Bounds2.NOTHING );
    this.addedMoleculeEmitter.addListener( () => {
      if ( this.quantityProperty.value === capacity && options.initializeAudio ) {

        // Audio player for correct sound
        const gameAudioPlayer = new GameAudioPlayer();
        gameAudioPlayer.correctAnswer();
      }
    } );
  }

  /**
   * Checks if the collection box is full.
   */
  public isFull(): boolean {
    return this.capacity === this.quantityProperty.value;
  }

  /**
   * Whether this molecule can be dropped into this collection box (at this point in time)
   * @param moleculeStructure - The molecule's structure
   * @returns Whether it can be dropped in
   */
  public willAllowMoleculeDrop( moleculeStructure: MoleculeStructure ): boolean {
    const equivalent = this.moleculeType.isEquivalent( moleculeStructure );

    // whether the structure is acceptable
    return equivalent && this.quantityProperty.value < this.capacity;
  }

  /**
   * Add a molecule to this box
   * @param molecule
   */
  public addMolecule( molecule: Molecule ): void {
    this.quantityProperty.value++;
    this.molecules.push( molecule );

    this.addedMoleculeEmitter.emit( molecule );
  }

  /**
   * Remove a molecule from this box
   * @param molecule
   */
  public removeMolecule( molecule: Molecule ): void {
    this.quantityProperty.value--;

    const index = this.molecules.indexOf( molecule );
    if ( index !== -1 ) {
      this.molecules.splice( index, 1 );
    }
    this.removedMoleculeEmitter.emit( molecule );
  }

  /**
   * Reset this box
   */
  public reset(): void {
    this.molecules.slice().forEach( this.removeMolecule.bind( this ) );
    this.cueVisibilityProperty.reset();
  }
}

buildAMolecule.register( 'CollectionBox', CollectionBox );
export default CollectionBox;