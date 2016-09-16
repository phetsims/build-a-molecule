// Copyright 2013-2015, University of Colorado Boulder

/**
 * Histogram of each element in a molecule, and allows fast comparison
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );

  function ElementHistogram( molecule ) {
    var self = this;

    this.quantities = {};
    _.each( Constants.supportedElements, function( element ) {
      self.quantities[ element.symbol ] = 0;
    } );

    if ( molecule ) {
      this.addMolecule( molecule );
    }
  }
  buildAMolecule.register( 'ElementHistogram', ElementHistogram );

  ElementHistogram.prototype = {
    constructor: ElementHistogram,

    getQuantity: function( element ) {
      return this.quantities[ element.symbol ];
    },

    addElement: function( element ) {
      this.quantities[ element.symbol ] += 1;
    },

    addMolecule: function( molecule ) {
      var self = this;

      _.each( molecule.atoms, function( atom ) {
        self.addElement( atom.element );
      } );
    },

    /**
     * @param otherHistogram Another histogram
     * @return Whether otherHistogram is a subset of this histogram (i.e. for all elements e, this.count( e ) >= other.count( e )
     */
    containsAsSubset: function( otherHistogram ) {
      var self = this;

      var length = Constants.supportedElements.length;
      for ( var i = 0; i < length; i++ ) {
        var element = Constants.supportedElements[ i ];

        if ( self.getQuantity( element ) < otherHistogram.getQuantity( element ) ) {
          return false;
        }
      }
      return true;
    },

    /**
     * @return A hash string that should be unique for each unique histogram, and the same for each equivalent histogram
     */
    getHashString: function() {
      var self = this;
      var hashString = '';

      _.each( Constants.supportedElements, function( element ) {
        hashString += '_' + self.getQuantity( element );
      } );
      return hashString;
    },

    equals: function( otherHistogram ) {
      var self = this;

      if ( otherHistogram instanceof ElementHistogram ) {
        var length = Constants.supportedElements.length;
        for ( var i = 0; i < length; i++ ) {
          var element = Constants.supportedElements[ i ];

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
  };

  // object with symbols as keys, result as true
  ElementHistogram.allowedChemicalSymbols = {};
  _.each( Constants.supportedElements, function( element ) {
    ElementHistogram.allowedChemicalSymbols[ element.symbol ] = true;
  } );

  return ElementHistogram;
} );
