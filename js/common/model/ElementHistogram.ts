// Copyright 2020-2025, University of Colorado Boulder


/**
 * Histogram of each element in a molecule, and allows fast comparison
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Element from '../../../../nitroglycerin/js/Element.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import type MoleculeStructure from './MoleculeStructure.js';

class ElementHistogram extends PhetioObject {

  private readonly quantities: Record<string, number>;

  public constructor( moleculeStructure: MoleculeStructure ) {
    super();

    this.quantities = {};
    BAMConstants.SUPPORTED_ELEMENTS.forEach( element => {
      this.quantities[ element.symbol ] = 0;
    } );

    this.addMolecule( moleculeStructure );
  }

  /**
   * Returns the amount of a specific element
   * @param element
   */
  public getQuantity( element: Element ): number {
    return this.quantities[ element.symbol ];
  }

  /**
   * @param element
   */
  public addElement( element: Element ): void {
    this.quantities[ element.symbol ] += 1;
  }

  /**
   * Adds elements from molecule
   * @param molecule
   */
  public addMolecule( molecule: MoleculeStructure ): void {
    molecule.atoms.forEach( atom => {
      this.addElement( atom.element );
    } );
  }

  /**
   * A hash string that should be unique for each unique histogram, and the same for each equivalent histogram
   */
  public getHashString(): string {
    let hashString = '';

    BAMConstants.SUPPORTED_ELEMENTS.forEach( element => {
      hashString += `_${this.getQuantity( element )}`;
    } );
    return hashString;
  }

  /**
   * Compares elements of each histogram
   * @param otherHistogram
   */
  public equals( otherHistogram: ElementHistogram ): boolean {
    const length = BAMConstants.SUPPORTED_ELEMENTS.length;
    for ( let i = 0; i < length; i++ ) {
      const element = BAMConstants.SUPPORTED_ELEMENTS[ i ];

      if ( this.getQuantity( element ) !== otherHistogram.getQuantity( element ) ) {
        return false;
      }
    }
    return true;
  }
}

buildAMolecule.register( 'ElementHistogram', ElementHistogram );
export default ElementHistogram;