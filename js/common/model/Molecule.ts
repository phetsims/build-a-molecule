// Copyright 2020-2021, University of Colorado Boulder

/**
 * Represents a "Build a Molecule" molecule. Also useful as a type alias for code readability
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import buildAMolecule from '../../buildAMolecule.js';
import MoleculeStructure from './MoleculeStructure.js';

class Molecule extends MoleculeStructure {
  /**
   * @param {number} [numAtoms]
   * @param {number} [numBonds]
   */
  constructor( numAtoms, numBonds ) {
    super( numAtoms || 0, numBonds || 0 );
  }

  /**
   * Returns the position bounds of the entire molecule
   *
   * @public
   * @returns {Bounds2}
   */
  get positionBounds() {
    // mutable way of handling this, so we need to make a copy
    const bounds = Bounds2.NOTHING.copy();
    this.atoms.forEach( atom => {
      bounds.includeBounds( atom.positionBounds );
    } );
    return bounds;
  }

  /**
   * Returns the destination bounds of the entire molecule
   *
   * @public
   * @returns {Bounds2}
   */
  get destinationBounds() {

    // mutable way of handling this, so we need to make a copy
    const bounds = Bounds2.NOTHING.copy();
    this.atoms.forEach( atom => {
      bounds.includeBounds( atom.destinationBounds );
    } );
    return bounds;
  }

  /**
   * Add a delta the destination of the molecule
   * @param {Vector2} delta
   *
   * @public
   */
  shiftDestination( delta ) {
    this.atoms.forEach( atom => {
      atom.destinationProperty.value = atom.destinationProperty.value.plus( delta );
    } );
  }
}

buildAMolecule.register( 'Molecule', Molecule );
export default Molecule;