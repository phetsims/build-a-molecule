// Copyright 2013-2019, University of Colorado Boulder

/**
 * Histogram of each element in a molecule, and allows fast comparison
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );

  /**
   * @param {MoleculeStructure} molecule
   * @constructor
   */
  function ElementHistogram( molecule ) {
    var self = this;

    // REVIEW: map from element.symbol => count?
    this.quantities = {};
    BAMConstants.SUPPORTED_ELEMENTS.forEach( function( element ) {
      self.quantities[ element.symbol ] = 0;
    } );

    // REVIEW: Note the optional parameter in jsdoc
    if ( molecule ) {
      this.addMolecule( molecule );
    }
  }

  buildAMolecule.register( 'ElementHistogram', ElementHistogram );

  return inherit( PhetioObject, ElementHistogram, {

    getQuantity: function( element ) {
      return this.quantities[ element.symbol ];
    },

    addElement: function( element ) {
      this.quantities[ element.symbol ] += 1;
    },

    addMolecule: function( molecule ) {
      var self = this;

      molecule.atoms.forEach( function( atom ) {
        self.addElement( atom.element );
      } );
    },

    /**
     * @param otherHistogram Another histogram
     * @returns {boolean} Whether otherHistogram is a subset of this histogram (i.e. for all elements e, this.count( e ) >= other.count( e )
     */
    containsAsSubset: function( otherHistogram ) {
      var self = this;

      var length = BAMConstants.SUPPORTED_ELEMENTS.length;
      for ( var i = 0; i < length; i++ ) {
        var element = BAMConstants.SUPPORTED_ELEMENTS[ i ];

        if ( self.getQuantity( element ) < otherHistogram.getQuantity( element ) ) {
          return false;
        }
      }
      return true;
    },

    /**
     * @returns {string} A hash string that should be unique for each unique histogram, and the same for each equivalent histogram
     */
    getHashString: function() {
      var self = this;
      var hashString = '';

      BAMConstants.SUPPORTED_ELEMENTS.forEach( function( element ) {
        hashString += '_' + self.getQuantity( element );
      } );
      return hashString;
    },

    equals: function( otherHistogram ) {
      var self = this;

      if ( otherHistogram instanceof ElementHistogram ) {
        var length = BAMConstants.SUPPORTED_ELEMENTS.length;
        for ( var i = 0; i < length; i++ ) {
          var element = BAMConstants.SUPPORTED_ELEMENTS[ i ];

          if ( self.getQuantity( element ) !== otherHistogram.getQuantity( element ) ) {
            return false;
          }
        }
        return true;
      }
      else {
        return false;
      }
    }
  } );
  //
  // // object with symbols as keys, result as true
  // //REVIEW: Is this used anywhere? I can't find it
  // ElementHistogram.allowedChemicalSymbols = {};
  // BAMConstants.SUPPORTED_ELEMENTS.forEach( function( element ) {
  //   ElementHistogram.allowedChemicalSymbols[ element.symbol ] = true;
  // } );
} );
