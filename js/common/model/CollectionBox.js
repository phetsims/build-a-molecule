// Copyright 2020-2021, University of Colorado Boulder

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
import merge from '../../../../phet-core/js/merge.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import Molecule from './Molecule.js';

class CollectionBox {
  /**
   * @param {CompleteMolecule} moleculeType
   * @param {number} capacity
   * @param {Object} [options]
   */
  constructor( moleculeType, capacity, options ) {
    options = merge( {
      initializeAudio: true
    }, options );

    // @public {NumberProperty}
    this.quantityProperty = new NumberProperty( 0 );

    // @public {BooleanProperty}
    this.cueVisibilityProperty = new BooleanProperty( false );

    // @public {Emitter} Called with a single molecule parameter
    this.addedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
    this.removedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );

    // @public {Emitter} An accepted molecule is a molecule that matches the goals in a collection box
    this.acceptedMoleculeCreationEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );

    // @public {CompleteMolecule}
    this.moleculeType = moleculeType;

    // @public {number}
    this.capacity = capacity;

    // @private {Array.<Molecule>}
    this.molecules = [];

    // @private {Property.<Bounds2>} This is updated in CollectionBoxNode.updatePosition()
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
   *
   * @public
   * @returns {boolean}
   */
  isFull() {
    return this.capacity === this.quantityProperty.value;
  }

  /**
   * Whether this molecule can be dropped into this collection box (at this point in time)
   * @param {MoleculeStructure} moleculeStructure - The molecule's structure
   *
   * @public
   * @returns {boolean} Whether it can be dropped in
   */
  willAllowMoleculeDrop( moleculeStructure ) {
    const equivalent = this.moleculeType.isEquivalent( moleculeStructure );

    // whether the structure is acceptable
    return equivalent && this.quantityProperty.value < this.capacity;
  }

  /**
   * Add a molecule to this box
   * @param {Molecule} molecule
   *
   * @public
   */
  addMolecule( molecule ) {
    this.quantityProperty.value++;
    this.molecules.push( molecule );

    this.addedMoleculeEmitter.emit( molecule );
  }

  /**
   * Remove a molecule from this box
   * @param {Molecule} molecule
   *
   * @public
   */
  removeMolecule( molecule ) {
    this.quantityProperty.value--;

    _.remove( this.molecules, moleculeEntry => {
      return moleculeEntry === molecule ? molecule : null;
    } );
    this.removedMoleculeEmitter.emit( molecule );
  }

  /**
   * Reset this box
   *
   * @public
   */
  reset() {
    this.molecules.slice().forEach( this.removeMolecule.bind( this ) );
    this.cueVisibilityProperty.reset();
  }
}

buildAMolecule.register( 'CollectionBox', CollectionBox );
export default CollectionBox;
