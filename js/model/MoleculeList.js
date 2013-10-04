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
  
  //REVIEW use logging instead of System.out throughout, since this happens at startup in production product.
  
  var namespace = require( 'BAM/namespace' );
  
  var collectionMoleculesData = require( 'BAM/model/data/collectionMoleculesData' );
  var otherMoleculesData = require( 'BAM/model/data/otherMoleculesData' );
  var structuresData = require( 'BAM/model/data/structuresData' );
  var CompleteMolecule = require( 'BAM/model/CompleteMolecule' );
  var StrippedMolecule = require( 'BAM/model/StrippedMolecule' );
  var MoleculeStructure = require( 'BAM/model/MoleculeStructure' );
  
  var MoleculeList = namespace.MoleculeList = function MoleculeList() {
    this.completeMolecules = []; // all complete molecules
    this.moleculeNameMap = {}; // unique name => complete molecule
    
    this.allowedStructureFormulaMap = {}; // formula => allowed stripped molecules (array)
  };
  
  MoleculeList.prototype = {
    constructor: MoleculeList,
    
    loadInitialData: function() {
      var mainMolecules = MoleculeList.readCompleteMoleculesFromData( collectionMoleculesData );
      _.each( mainMolecules, this.addCompleteMolecule.bind( this ) );
    },

    loadMasterData: function() {
      var that = this;
      // load in our collection molecules first
      _.each( initialList.getAllCompleteMolecules(), this.addCompleteMolecule.bind( this ) );

      // then load other molecules
      var mainMolecules = MoleculeList.readCompleteMoleculesFromData( otherMoleculesData );
      _.each( mainMolecules, function( molecule ) {
        // if our molecule was included in the initial lookup, use that initial version instead so we can have instance equality preserved
        var initialListLookup = initialList.moleculeNameMap[molecule.commonName];
        if ( initialListLookup && molecule.isEquivalent( initialListLookup ) ) {
          molecule = initialListLookup;
        }

        that.addCompleteMolecule( molecule );
      } );
      
      // then load structures
      var mainStructures = MoleculeList.readMoleculeStructuresFromData( structuresData );
      _.each( mainStructures, this.addAllowedStructure.bind( this ) );
    },

    /**
     * Check whether this structure is allowed. Currently this means it is a "sub-molecule" of one of our complete
     * molecules
     *
     * @param moleculeStructure Molecule to check
     * @return True if it is allowed
     */
    isAllowedStructure: function( moleculeStructure ) {
      var strippedMolecule = new StrippedMolecule( moleculeStructure );
      var hashString = strippedMolecule.stripped.getHistogram().getHashString();

      // if the molecule contained only 1 or 2 hydrogen, it is ok
      if ( strippedMolecule.stripped.atoms.length === 0 && moleculeStructure.atoms.length <= 2 ) {
        return true;
      }

      // don't allow invalid forms!
      if ( !moleculeStructure.isValid() ) {
        return false;
      }

      // use the allowed structure map as an acceleration feature
      // TODO: performance: only do the lookup once
      if ( this.allowedStructureFormulaMap[hashString] ) {
        var moleculeStructures = this.allowedStructureFormulaMap[hashString];
        if ( moleculeStructures ) {
          var length = moleculeStructures.length;
          for ( var i = 0; i < length; i++ ) {
            var structure = moleculeStructures[i];
            if ( structure.isHydrogenSubmolecule( strippedMolecule ) ) {
              return true;
            }
          }
        }
      }
      return false;
    },

    /**
     * Find a complete molecule with an equivalent structure to the passed in molecule
     *
     * @param moleculeStructure Molecule structure to match
     * @return Either a matching CompleteMolecule, or null if none is found
     */
    findMatchingCompleteMolecule: function( moleculeStructure ) {
      var length = this.completeMolecules.length;
      for ( var i = 0; i < length; i++ ) {
        var completeMolecule = this.completeMolecules[i];
        if ( moleculeStructure.isEquivalent( completeMolecule ) ) {
          return completeMolecule;
        }
      }
      return null;
    },
    
    // by pubchem compound ID (CID)
    findMoleculeByCID: function( cid ) {
      var length = this.completeMolecules.length;
      for ( var i = 0; i < length; i++ ) {
        var completeMolecule = this.completeMolecules[i];
        if ( completeMolecule.cid === cid ) {
          return completeMolecule;
        }
      }
      return null;
    },

    getAllCompleteMolecules: function() {
      // TODO: performance: do we need a full copy here?
      return this.completeMolecules.slice( 0 );
    },

    /*---------------------------------------------------------------------------*
    * computation of allowed molecule structures
    *----------------------------------------------------------------------------*/

    addCompleteMolecule: function( completeMolecule ) {
      this.completeMolecules.push( completeMolecule );
      this.moleculeNameMap[completeMolecule.commonName] = completeMolecule;
    },

    addAllowedStructure: function( structure ) {
      var strippedMolecule = new StrippedMolecule( structure );
      var hashString = strippedMolecule.stripped.getHistogram().getHashString();
      
      // TODO: performance: only do the lookup once
      if ( this.allowedStructureFormulaMap[hashString] ) {
        this.allowedStructureFormulaMap[hashString].push( strippedMolecule );
      } else {
        this.allowedStructureFormulaMap[hashString] = [strippedMolecule];
      }
    }
  };
  
  var masterInstance = null;
  var initialized = false;
  var initialList = new MoleculeList();
  
  MoleculeList.startInitialization = function() {
    // TODO: performance: use web worker or chop it up into bits of work
    masterInstance = new MoleculeList();
    masterInstance.loadMasterData();
    initialized = true;
    // TODO: log completion?
  };
  
  MoleculeList.getMasterInstance = function() {
    if ( !initialized ) {
      // TODO: performance: threading-like replacement goes here
      MoleculeList.startInitialization();
    }
    
    return masterInstance;
  };
  
  MoleculeList.getMoleculeByName = function( name ) {
    var result = initialList.moleculeNameMap[name];
    
    if ( !result ) {
      // TODO: logger here needed as a warning for master lookup?
      result = MoleculeList.getMasterInstance().moleculeNameMap[name];
    }
    
    return result;
  };
  
  /*---------------------------------------------------------------------------*
  * static helper methods
  *----------------------------------------------------------------------------*/

  /**
   * @return A list of complete molecules
   */
  MoleculeList.readCompleteMoleculesFromData = function( strings ) {
    return _.map( strings, function( string ) {
      var molecule = CompleteMolecule.fromSerial2( string );

      // sanity checks
      if ( molecule.hasLoopsOrIsDisconnected() ) {
        throw new Error( 'ignoring molecule: ' + molecule.commonName );
      }
      if ( molecule.hasWeirdHydrogenProperties() ) {
        throw new Error( 'weird hydrogen pattern in: ' + molecule.commonName );
      }
      return molecule;
    } );
  };

  /**
   * @param filename File name relative to the sim's data directory
   * @return A list of molecule structures
   */
  MoleculeList.readMoleculeStructuresFromData = function( strings ) {
    return _.map( strings, function( string ) {
      var structure = MoleculeStructure.fromSerial2Basic( string );

      // sanity checks
      if ( structure.hasWeirdHydrogenProperties() ) {
          throw new Error( "weird hydrogen pattern in structure: " + string );
      }
      return structure;
    } );
  };
  
  initialList.loadInitialData();
  
  /*---------------------------------------------------------------------------*
  * molecule references and customized names
  *----------------------------------------------------------------------------*/

  MoleculeList.CO2 = MoleculeList.getMoleculeByName( "Carbon Dioxide" );
  MoleculeList.H2O = MoleculeList.getMoleculeByName( "Water" );
  MoleculeList.N2  = MoleculeList.getMoleculeByName( "Nitrogen" );
  MoleculeList.CO  = MoleculeList.getMoleculeByName( "Carbon Monoxide" );
  MoleculeList.NO  = MoleculeList.getMoleculeByName( "Nitric Oxide" );
  MoleculeList.O2  = MoleculeList.getMoleculeByName( "Oxygen" );
  MoleculeList.H2  = MoleculeList.getMoleculeByName( "Hydrogen" );
  MoleculeList.Cl2 = MoleculeList.getMoleculeByName( "Chlorine" );
  MoleculeList.NH3 = MoleculeList.getMoleculeByName( "Ammonia" );

  /**
   * Molecules that can be used for collection boxes
   */
  MoleculeList.collectionBoxMolecules = [
    MoleculeList.CO2,
    MoleculeList.H2O,
    MoleculeList.N2,
    MoleculeList.CO,
    MoleculeList.O2,
    MoleculeList.H2,
    MoleculeList.NH3,
    MoleculeList.Cl2,
    MoleculeList.NO,
    MoleculeList.getMoleculeByName( "Acetylene" ),
    MoleculeList.getMoleculeByName( "Borane" ),
    MoleculeList.getMoleculeByName( "Trifluoroborane" ),
    MoleculeList.getMoleculeByName( "Chloromethane" ),
    MoleculeList.getMoleculeByName( "Ethylene" ),
    MoleculeList.getMoleculeByName( "Fluorine" ),
    MoleculeList.getMoleculeByName( "Fluoromethane" ),
    MoleculeList.getMoleculeByName( "Formaldehyde" ),
    MoleculeList.getMoleculeByName( "Hydrogen Cyanide" ),
    MoleculeList.getMoleculeByName( "Hydrogen Peroxide" ),
    MoleculeList.getMoleculeByName( "Hydrogen Sulfide" ),
    MoleculeList.getMoleculeByName( "Methane" ),
    MoleculeList.getMoleculeByName( "Nitrous Oxide" ),
    MoleculeList.getMoleculeByName( "Ozone" ),
    MoleculeList.getMoleculeByName( "Phosphine" ),
    MoleculeList.getMoleculeByName( "Silane" ),
    MoleculeList.getMoleculeByName( "Sulfur Dioxide" )
  ];
  
  _.each( MoleculeList.collectionBoxMolecules, function( molecule ) {
    assert && assert( !!molecule );
  } );
  
  // TODO: performance: postpone all of the loading?
  MoleculeList.getMasterInstance();
  
  return MoleculeList;
} );
