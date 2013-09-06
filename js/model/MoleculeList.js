// Copyright 2002-2013, University of Colorado

/**
 * Has functions relating to lists of molecules (e.g. is a molecule or submolecule allowed?) Uses static initialization to load in a small fraction
 * of molecules from collection-molecules.txt, and then in a separate thread loads the rest of the molecules + the allowed structures. The 1st
 * call that requires the full molecule list or allowed structures will block until it is all read in or computed
 *
 * TODO: stub: this is just a stub, fill out with actual behavior
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  
  var MoleculeList = namespace.MoleculeList = function MoleculeList() {
  };
  
  MoleculeList.prototype = {
    constructor: MoleculeList,
    
    findMatchingCompleteMolecule: function( something ) {
      
    },
    
    isAllowedStructure: function( something ) {
      
    }
  };
  
  MoleculeList.getMasterInstance = function() {
    return new MoleculeList();
  };
  
  return MoleculeList;
} );
