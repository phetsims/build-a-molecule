// Copyright 2020, University of Colorado Boulder

/**
 * Represents a "Build a Molecule" molecule. Also useful as a type alias for code readability
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import buildAMolecule from '../../buildAMolecule.js';
import MoleculeStructure from './MoleculeStructure.js';

class Molecule extends MoleculeStructure {
  //REVIEW: Do we really want default parameters here?
  /**
   * @param numAtoms
   * @param numBonds
   * @constructor
   */
  constructor( numAtoms, numBonds ) {
    super( numAtoms || 0, numBonds || 0 );
  }

  // Where the molecule is right now
  get positionBounds() {
    // mutable way of handling this, so we need to make a copy
    const bounds = Bounds2.NOTHING.copy();
    this.atoms.forEach( atom => {
      bounds.includeBounds( atom.positionBounds );
    } );
    return bounds;
  }

  // Where the molecule will end up
  get destinationBounds() {
    // mutable way of handling this, so we need to make a copy
    const bounds = Bounds2.NOTHING.copy();
    this.atoms.forEach( atom => {
      bounds.includeBounds( atom.destinationBounds );
    } );
    return bounds;
  }

  /**
   * @param {Vector2} delta
   * @public
   */
  shiftDestination( delta ) {
    this.atoms.forEach( atom => {
      // TODO: memory: consider alternate mutable form atom.destination.add( delta )
      atom.isSeparatingProperty.value = true;
      atom.destinationProperty.value = atom.destinationProperty.value.plus( delta );
    } );
  }
}


buildAMolecule.register( 'Molecule', Molecule );
export default Molecule;