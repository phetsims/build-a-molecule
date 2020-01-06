// Copyright 2013-2019, University of Colorado Boulder

/**
 * Stores multiple instances of a single type of molecule. Keeps track of quantity, and has a desired capacity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Emitter = require( 'AXON/Emitter' );
  const GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Molecule = require( 'BUILD_A_MOLECULE/common/model/Molecule' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );

  class CollectionBox {
    /**
     * @param {CompleteMolecule} moleculeType
     * @param {number} capacity
     * @param {object} options
     */
    constructor( moleculeType, capacity, options ) {
      options = merge( {
        initializeAudio: true
      }, options );

      const self = this;

      // @public
      this.quantityProperty = new NumberProperty( 0 );
      this.cueVisibilityProperty = new BooleanProperty( false );

      // @public {Emitter} - Called with a single molecule parameter
      this.addedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
      this.removedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
      this.acceptedMoleculeCreationEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } ); // triggered from KitCollection

      // @public {CompleteMolecule}
      this.moleculeType = moleculeType;

      // @public {number}
      this.capacity = capacity;

      // @private
      this.molecules = [];
      this.dropBoundsProperty = new Property( Bounds2.NOTHING );
      this.addedMoleculeEmitter.addListener( () => {
        if ( self.quantityProperty.value === capacity && options.initializeAudio ) {

          // Audio player for correct sound
          const gameAudioPlayer = new GameAudioPlayer();
          gameAudioPlayer.correctAnswer();
        }
      } );
    }

    isFull() {
      return this.capacity === this.quantityProperty.value;
    }

    /**
     * Whether this molecule can be dropped into this collection box (at this point in time)
     *
     * @param moleculeStructure The molecule's structure
     * @returns {boolean} Whether it can be dropped in
     */
    willAllowMoleculeDrop( moleculeStructure ) {
      const equivalent = this.moleculeType.isEquivalent( moleculeStructure );

      // whether the structure is acceptable
      return equivalent && this.quantityProperty.value < this.capacity;
    }

    addMolecule( molecule ) {
      this.quantityProperty.value++;
      this.molecules.push( molecule );

      this.addedMoleculeEmitter.emit( molecule );
    }

    removeMolecule( molecule ) {
      this.quantityProperty.value--;
      this.molecules.shift();
      this.removedMoleculeEmitter.emit( molecule );
    }

    /**
     * @public
     */
    reset() {
      this.molecules.slice( 0 ).forEach( this.removeMolecule.bind( this ) );
      this.cueVisibilityProperty.reset();
    }
  }

  return buildAMolecule.register( 'CollectionBox', CollectionBox );
} );
