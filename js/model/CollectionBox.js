// Copyright 2013-2015, University of Colorado Boulder

/**
 * Stores multiple instances of a single type of molecule. Keeps track of quantity, and has a desired capacity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Globals = require( 'BUILD_A_MOLECULE/Globals' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /*
   * @param {CompleteMolecule} moleculeType
   * @param {Int}              capacity
   *
   * events:
   * addedMolecule: function( molecule )
   * removedMolecule: function( molecule )
   * acceptedMoleculeCreation: function( molecule )       // triggered from KitCollection
   */
  function CollectionBox( moleculeType, capacity ) {
    PropertySet.call( this, {
      quantity: 0
    } );

    var self = this;
    this.moleculeType = moleculeType;
    this.capacity = capacity;
    this.molecules = [];
    this._dropBounds = Bounds2.NOTHING;

    this.on( 'addedMolecule', function( molecule ) {
      if ( self.quantity === capacity ) {
        Globals.gameAudioPlayer.correctAnswer();
      }
    } );
  }
  buildAMolecule.register( 'CollectionBox', CollectionBox );

  inherit( PropertySet, CollectionBox, {
    set dropBounds( value ) {
      // TODO: consider removing ES5 getter/setter here
      assert && assert( value );
      this._dropBounds = value;
    },

    get dropBounds() {
      return this._dropBounds;
    },

    isFull: function() {
      return this.capacity === this.quantity;
    },

    /**
     * Whether this molecule can be dropped into this collection box (at this point in time)
     *
     * @param moleculeStructure The molecule's structure
     * @return Whether it can be dropped in
     */
    willAllowMoleculeDrop: function( moleculeStructure ) {
      var equivalent = this.moleculeType.isEquivalent( moleculeStructure );

      // whether the structure is acceptable
      return equivalent && this.quantity < this.capacity;
    },

    addMolecule: function( molecule ) {
      this.quantity++;
      this.molecules.push( molecule );

      this.trigger( 'addedMolecule', molecule );
    },

    removeMolecule: function( molecule ) {
      this.quantity--;
      this.molecules.splice( this.molecules.indexOf( molecule ), 1 ); // TODO: remove() instead of splice()

      this.trigger( 'removedMolecule', molecule );
    },

    clear: function() {
      _.each( this.molecules.slice( 0 ), this.removeMolecule.bind( this ) );
    }
  } );

  return CollectionBox;
} );
