// Copyright 2020-2026, University of Colorado Boulder


/**
 * Represents a "Build a Molecule" molecule. Also useful as a type alias for code readability
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import buildAMolecule from '../../buildAMolecule.js';
import Atom2 from './Atom2.js';
import MoleculeStructure from './MoleculeStructure.js';

class Molecule extends MoleculeStructure {
  /**
   * @param numAtoms
   * @param numBonds
   */
  public constructor( numAtoms?: number, numBonds?: number ) {
    super( numAtoms || 0, numBonds || 0 );
  }

  /**
   * Returns the position bounds of the entire molecule
   */
  public get positionBounds(): Bounds2 {
    // mutable way of handling this, so we need to make a copy
    const bounds = Bounds2.NOTHING.copy();
    this.atoms.forEach( atom => {

      affirm( atom instanceof Atom2, 'Expected atom to be an instance of Atom2' );
      bounds.includeBounds( atom.positionBounds );
    } );
    return bounds;
  }

  /**
   * Returns the destination bounds of the entire molecule
   */
  public get destinationBounds(): Bounds2 {

    // mutable way of handling this, so we need to make a copy
    const bounds = Bounds2.NOTHING.copy();
    this.atoms.forEach( atom => {

      affirm( atom instanceof Atom2, 'Expected atom to be an instance of Atom2' );

      bounds.includeBounds( atom.destinationBounds );
    } );
    return bounds;
  }

  /**
   * Add a delta the destination of the molecule
   * @param delta
   */
  public shiftDestination( delta: Vector2 ): void {
    this.atoms.forEach( atom => {

      affirm( atom instanceof Atom2, 'Expected atom to be an instance of Atom2' );

      atom.destinationProperty.value = atom.destinationProperty.value.plus( delta );
    } );
  }
}

buildAMolecule.register( 'Molecule', Molecule );
export default Molecule;