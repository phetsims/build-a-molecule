// Copyright 2020, University of Colorado Boulder

/**
 * Histogram of each element in a molecule, and allows fast comparison
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

class ElementHistogram extends PhetioObject {
  /**
   * @param {MoleculeStructure} moleculeStructure
   */
  constructor( moleculeStructure ) {
    super();

    // @private {Object} element => element quantity
    this.quantities = {};
    BAMConstants.SUPPORTED_ELEMENTS.forEach( element => {
      this.quantities[ element.symbol ] = 0;
    } );

    //REVIEW: The constructor parameter is not marked as optional, why do we have this conditional?
    //REVIEW: Doesn't look like it's used. Also... since it's only used in MoleculeStructure, should this be integrated
    //REVIEW: into that code? I'm happy to keep it separate
    if ( moleculeStructure ) {
      this.addMolecule( moleculeStructure );
    }
  }

  /**
   * Returns the amount of a specific element
   * @param {Element} element
   *
   * @public
   * @returns {number}
   */
  getQuantity( element ) {
    return this.quantities[ element.symbol ];
  }

  /**
   * @param {Element} element
   * @public
   *
   * @returns {number}
   */
  addElement( element ) {
    this.quantities[ element.symbol ] += 1;
  }

  /**
   * Adds elements from molecule
   * @param {MoleculeStructure} molecule
   *
   * @public
   */
  addMolecule( molecule ) {
    molecule.atoms.forEach( atom => {
      this.addElement( atom.element );
    } );
  }

  /**
   * A hash string that should be unique for each unique histogram, and the same for each equivalent histogram
   *
   * @public
   * @returns {string}
   */
  getHashString() {
    let hashString = '';

    BAMConstants.SUPPORTED_ELEMENTS.forEach( element => {
      hashString += '_' + this.getQuantity( element );
    } );
    return hashString;
  }

  /**
   * Compares elements of each histogram
   * @param {ElementHistogram} otherHistogram
   *
   * @public
   * @returns {boolean}
   */
  equals( otherHistogram ) {
    if ( otherHistogram instanceof ElementHistogram ) {
      const length = BAMConstants.SUPPORTED_ELEMENTS.length;
      for ( let i = 0; i < length; i++ ) {
        const element = BAMConstants.SUPPORTED_ELEMENTS[ i ];

        if ( this.getQuantity( element ) !== otherHistogram.getQuantity( element ) ) {
          return false;
        }
      }
      return true;
    }
    else {
      return false;
    }
  }
}

buildAMolecule.register( 'ElementHistogram', ElementHistogram );
export default ElementHistogram;