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

  /*
   * @param {CompleteMolecule} moleculeType
   * @param {Int}              capacity TODO: Should this be number?
   */
  function CollectionBox( moleculeType, capacity ) {
    // @public {Property.<number>}
    this.quantityProperty = new NumberProperty( 0 );

    // @public {Emitter} - Called with a single molecule parameter
    this.addedMoleculeEmitter = new Emitter( { validators: [ { valueType: Molecule } ] } );
    this.removedMoleculeEmitter = new Emitter( { validators: [ { valueType: Molecule } ] } );
    this.acceptedMoleculeCreationEmitter = new Emitter( { validators: [ { valueType: Molecule } ] } ); // triggered from KitCollection

    var self = this;
    this.moleculeType = moleculeType;
    this.capacity = capacity;
    this.molecules = [];
    this._dropBounds = Bounds2.NOTHING;

    this.addedMoleculeEmitter.addListener( function( molecule ) {
      if ( self.quantityProperty.value === capacity ) {
        Globals.gameAudioPlayer.correctAnswer();
      }
    } );
  }

  buildAMolecule.register( 'CollectionBox', CollectionBox );

  inherit( Object, CollectionBox, {
    set dropBounds( value ) {
      // TODO: consider removing ES5 getter/setter here REVIEW: Just a normal property sounds good
      assert && assert( value );
      this._dropBounds = value;
    },

    get dropBounds() {
      return this._dropBounds;
    },

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

    clear: function() {
      _.each( this.molecules.slice( 0 ), this.removeMolecule.bind( this ) );
    }
  } );

  return CollectionBox;
} );
