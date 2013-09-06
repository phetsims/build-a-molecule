// Copyright 2002-2013, University of Colorado

/**
 * Histogram of each element in a molecule, and allows fast comparison
 *
 * TODO: stub: this is just a stub, fill out with actual behavior
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  
  var ElementHistogram = namespace.ElementHistogram = function ElementHistogram() {
  };
  
  ElementHistogram.prototype = {
    constructor: ElementHistogram
  };
  
  return ElementHistogram;
} );
