// Copyright 2002-2013, University of Colorado

/**
 * Histogram of each element in a molecule, and allows fast comparison
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  
  var ElementHistogram = namespace.ElementHistogram = function ElementHistogram( molecule ) {
    var histogram = this;
    
    this.quantities = {};
    _.each( Constants.supportedElements, function( element ) {
      histogram.quantities[element.symbol] = 0;
    } );
    
    if ( molecule ) {
      this.addMolecule( molecule );
    }
  };
  
  ElementHistogram.prototype = {
    constructor: ElementHistogram,
    
    getQuantity: function( element ) {
      return this.quantities[element.symbol];
    },
    
    addElement: function( element ) {
      this.quantities[element.symbol] += 1;
    },
    
    addMolecule: function( molecule ) {
      var histogram = this;
      
      _.each( molecule.atoms, function( atom ) {
        histogram.addElement( atom.element );
      } );
    },
    
    /**
     * @param otherHistogram Another histogram
     * @return Whether otherHistogram is a subset of this histogram (i.e. for all elements e, this.count( e ) >= other.count( e )
     */
    containsAsSubset: function( otherHistogram ) {
      var histogram = this;
      
      var length = Constants.supportedElements.length;
      for ( var i = 0; i < length; i++ ) {
        var element = Constants.supportedElements[i];
        
        if ( histogram.getQuantity( element ) < otherHistogram.getQuantity( element ) ) {
          return false;
        }
      }
      return true;
    },

    /**
     * @return A hash string that should be unique for each unique histogram, and the same for each equivalent histogram
     */
    getHashString: function() {
      var histogram = this;
      var hashString = '';
      
      _.each( Constants.supportedElements, function( element ) {
        hashString += '_' + histogram.getQuantity( element );
      } );
      return hashString;
    },

    equals: function( otherHistogram ) {
      var histogram = this;
      
      if ( otherHistogram instanceof ElementHistogram ) {
        var length = Constants.supportedElements.length;
        for ( var i = 0; i < length; i++ ) {
          var element = Constants.supportedElements[i];
          
          if ( histogram.getQuantity( element ) !== otherHistogram.getQuantity( element ) ) {
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
    ElementHistogram.allowedChemicalSymbols[element.symbol] = true;
  } );
  
  return ElementHistogram;
} );
