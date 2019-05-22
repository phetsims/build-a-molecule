// Copyright 2013-2019, University of Colorado Boulder

/**
 * Stores multiple instances of a single type of molecule. Keeps track of quantity, and has a desired capacity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Emitter = require( 'AXON/Emitter' );
  var Globals = require( 'BUILD_A_MOLECULE/Globals' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Molecule = require( 'BUILD_A_MOLECULE/model/Molecule' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {CompleteMolecule} moleculeType
   * @param {number} capacity
   */
  function CollectionBox( moleculeType, capacity ) {
    var self = this;

    // @public {Property.<number>}
    this.quantityProperty = new NumberProperty( 0 );

    // @public {Emitter} - Called with a single molecule parameter
    this.addedMoleculeEmitter = new Emitter( { validators: [ { valueType: Molecule } ] } );
    this.removedMoleculeEmitter = new Emitter( { validators: [ { valueType: Molecule } ] } );
    this.acceptedMoleculeCreationEmitter = new Emitter( { validators: [ { valueType: Molecule } ] } ); // triggered from KitCollection

    // @public {CompleteMolecule}
    this.moleculeType = moleculeType;

    // @public {number}
    this.capacity = capacity;

    // @private
    this.molecules = [];
    this.dropBoundsProperty = new Property( Bounds2.NOTHING );
    this.addedMoleculeEmitter.addListener( function() {
      if ( self.quantityProperty.value === capacity ) {
        Globals.gameAudioPlayer.correctAnswer();
      }
    } );
  }

  buildAMolecule.register( 'CollectionBox', CollectionBox );

  inherit( Object, CollectionBox, {
    isFull: function() {
      return this.capacity === this.quantityProperty.value;
    },

    /**
     * Whether this molecule can be dropped into this collection box (at this point in time)
     *
     * @param moleculeStructure The molecule's structure
     * @returns {boolean} Whether it can be dropped in
     */
    willAllowMoleculeDrop: function( moleculeStructure ) {
      var equivalent = this.moleculeType.isEquivalent( moleculeStructure );

      // whether the structure is acceptable
      return equivalent && this.quantityProperty.value < this.capacity;
    },

    addMolecule: function( molecule ) {
      this.quantityProperty.value++;
      this.molecules.push( molecule );

      this.addedMoleculeEmitter.emit( molecule );
    },

    removeMolecule: function( molecule ) {
      this.quantityProperty.value--;
      this.molecules.splice( this.molecules.indexOf( molecule ), 1 ); // TODO: remove() instead of splice()

      this.removedMoleculeEmitter.emit( molecule );
    },

    //REVIEW: Should this be called `reset`?
    clear: function() {
      this.molecules.slice( 0 ).forEach( this.removeMolecule.bind( this ) );
    }
  } );

  return CollectionBox;
} );
