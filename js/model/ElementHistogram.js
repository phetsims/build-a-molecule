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
      BAMConstants.SUPPORTED_ELEMENTS.map( ( element ) => {
        return thihs.quantities[ element.symbol ] = 0;
      } );

      if ( molecule ) {
        this.addMolecule( molecule );
      }
    }

    getQuantity( element ) {
      return this.quantities[ element.symbol ];
    }

    addElement( element ) {
      this.quantities[ element.symbol ] += 1;
    }

    addMolecule( molecule ) {

      molecule.atoms.forEach( ( atom ) => {
        this.addElement( atom.element );
      } );
    }

    /**
     * @param otherHistogram Another histogram
     * @returns {boolean} Whether otherHistogram is a subset of this histogram (i.e. for all elements e, this.count( e ) >= other.count( e )
     */
    containsAsSubset( otherHistogram ) {

      const length = BAMConstants.SUPPORTED_ELEMENTS.length;
      for ( let i = 0; i < length; i++ ) {
        let element = BAMConstants.SUPPORTED_ELEMENTS[ i ];

        if ( this.getQuantity( element ) < otherHistogram.getQuantity( element ) ) {
          return false;
        }
      }
      return true;
    }

    /**
     * @returns {string} A hash string that should be unique for each unique histogram, and the same for each equivalent histogram
     */
    getHashString() {
      let hashString = '';

      BAMConstants.SUPPORTED_ELEMENTS.forEach( ( element ) => {
        hashString += '_' + self.getQuantity( element );
      } );
      return hashString;
    }

    equals( otherHistogram ) {

      if ( otherHistogram instanceof ElementHistogram ) {
        const length = BAMConstants.SUPPORTED_ELEMENTS.length;
        for ( let i = 0; i < length; i++ ) {
          let element = BAMConstants.SUPPORTED_ELEMENTS[ i ];

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
