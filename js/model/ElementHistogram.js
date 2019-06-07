// Copyright 2013-2019, University of Colorado Boulder

/**
 * Histogram of each element in a molecule, and allows fast comparison
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );

  class ElementHistogram extends PhetioObject {
    /**
     * @param {MoleculeStructure} molecule
     * @constructor
     */
    constructor( molecule ) {
      super();
      this.quantities = {};
      BAMConstants.SUPPORTED_ELEMENTS.forEach( ( element ) => {
        this.quantities[ element.symbol ] = 0;
      } );

      if ( molecule ) {
        this.addMolecule( molecule );
      }
    }

    /**
     * Returns the amount of a specific element
     * @param {Element} element
     * @public
     *
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
     *
     * @param {MoleculeStructure} molecule
     */
    addMolecule( molecule ) {
      molecule.atoms.forEach( ( atom ) => {
        this.addElement( atom.element );
      } );
    }

    /**
     * A hash string that should be unique for each unique histogram, and the same for each equivalent histogram
     *
     * @returns {string}
     */
    getHashString() {
      let hashString = '';

      BAMConstants.SUPPORTED_ELEMENTS.forEach( ( element ) => {
        hashString += '_' + this.getQuantity( element );
      } );
      return hashString;
    }

    /**
     * Compares elements of each histogram
     *
     * @param {ElementHistogram} otherHistogram
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

  return buildAMolecule.register( 'ElementHistogram', ElementHistogram );
} );
