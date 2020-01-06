// Copyright 2013-2019, University of Colorado Boulder

/**
 * Represents a "Build a Molecule" molecule. Also useful as a type alias for code readability
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MoleculeStructure = require( 'BUILD_A_MOLECULE/common/model/MoleculeStructure' );

  //REVIEW: Do we really want default parameters here?
  /**
   * @param numAtoms
   * @param numBonds
   * @constructor
   */
  function Molecule( numAtoms, numBonds ) {
    MoleculeStructure.call( this, numAtoms || 0, numBonds || 0 );
  }
  buildAMolecule.register( 'Molecule', Molecule );

  inherit( MoleculeStructure, Molecule, {
    // Where the molecule is right now
    get positionBounds() {
      // mutable way of handling this, so we need to make a copy
      const bounds = Bounds2.NOTHING.copy();
      this.atoms.forEach( function( atom ) {
        bounds.includeBounds( atom.positionBounds );
      } );
      return bounds;
    },

    // Where the molecule will end up
    get destinationBounds() {
      // mutable way of handling this, so we need to make a copy
      const bounds = Bounds2.NOTHING.copy();
      this.atoms.forEach( function( atom ) {
        bounds.includeBounds( atom.destinationBounds );
      } );
      return bounds;
    },

    // @param {Vector2}
    shiftDestination: function( delta ) {
      this.atoms.forEach( function( atom ) {
        // TODO: memory: consider alternate mutable form atom.destination.add( delta )
        atom.isSeparatingProperty.value = true;
        atom.destinationProperty.value = atom.destinationProperty.value.plus( delta );
      } );
    }
  } );

  return Molecule;
} );
