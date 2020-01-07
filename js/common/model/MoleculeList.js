// Copyright 2020, University of Colorado Boulder

/**
 * Has functions relating to lists of molecules (e.g. is a molecule or submolecule allowed?) Uses static initialization to load in a small fraction
 * of molecules from collection-molecules.txt, and then in a separate thread loads the rest of the molecules + the allowed structures. The 1st
 * call that requires the full molecule list or allowed structures will block until it is all read in or computed
 *
 * REVIEW: This comment below is ominous!
 * TODO: stub: this is just a stub, fill out with actual behavior
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  //REVIEW use logging instead of System.out throughout, since this happens at startup in production product.

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const collectionMoleculesData = require( 'BUILD_A_MOLECULE/common/model/data/collectionMoleculesData' );
  const CompleteMolecule = require( 'BUILD_A_MOLECULE/common/model/CompleteMolecule' );
  const MoleculeStructure = require( 'BUILD_A_MOLECULE/common/model/MoleculeStructure' );
  const otherMoleculesData = require( 'BUILD_A_MOLECULE/common/model/data/otherMoleculesData' );
  const StrippedMolecule = require( 'BUILD_A_MOLECULE/common/model/StrippedMolecule' );
  const structuresData = require( 'BUILD_A_MOLECULE/common/model/data/structuresData' );

  class MoleculeList {
    constructor() {
      this.completeMolecules = []; // all complete molecules
      this.moleculeNameMap = {}; // unique name => complete molecule
      this.allowedStructureFormulaMap = {}; // formula => allowed stripped molecules (array)
    }

    /**
     * @private
     */
    loadInitialData() {
      const startTime = Date.now();
      const mainMolecules = MoleculeList.readCompleteMoleculesFromData( collectionMoleculesData );
      mainMolecules.forEach( this.addCompleteMolecule.bind( this ) );
      console.log( 'loaded initial data in ' + ( Date.now() - startTime ) + 'ms' );
    }

    /**
     * @private
     */
    loadMasterData() {
      const startTime = Date.now();
      const self = this;
      // load in our collection molecules first
      initialList.getAllCompleteMolecules().forEach( this.addCompleteMolecule.bind( this ) );

      // then load other molecules
      const mainMolecules = MoleculeList.readCompleteMoleculesFromData( otherMoleculesData );
      mainMolecules.forEach( function( molecule ) {
        // if our molecule was included in the initial lookup, use that initial version instead so we can have instance equality preserved
        const initialListLookup = initialList.moleculeNameMap[ molecule.filterCommonName( molecule.commonNameProperty.value ) ];
        if ( initialListLookup && molecule.isEquivalent( initialListLookup ) ) {
          molecule = initialListLookup;
        }

        self.addCompleteMolecule( molecule );
      } );

      // then load structures
      const mainStructures = MoleculeList.readMoleculeStructuresFromData( structuresData );
      mainStructures.forEach( this.addAllowedStructure.bind( this ) );
      console.log( 'loaded master data in ' + ( Date.now() - startTime ) + 'ms' );
    }

    /**
     * Check whether this structure is allowed. Currently this means it is a "sub-molecule" of one of our complete
     * molecules
     *
     * @param moleculeStructure Molecule to check
     * @public
     *
     * @returns {boolean} True if it is allowed
     */
    isAllowedStructure( moleculeStructure ) {
      const strippedMolecule = new StrippedMolecule( moleculeStructure );
      const hashString = strippedMolecule.stripped.getHistogram().getHashString();

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
      if ( this.allowedStructureFormulaMap[ hashString ] ) {
        const moleculeStructures = this.allowedStructureFormulaMap[ hashString ];
        if ( moleculeStructures ) {
          const length = moleculeStructures.length;
          for ( let i = 0; i < length; i++ ) {
            const structure = moleculeStructures[ i ];
            if ( structure.isHydrogenSubmolecule( strippedMolecule ) ) {
              return true;
            }
          }
        }
      }
      return false;
    }

    /**
     * Find a complete molecule with an equivalent structure to the passed in molecule
     *
     * @param moleculeStructure Molecule structure to match
     * @public
     *
     * @returns {CompleteMolecule|null} Either a matching CompleteMolecule, or null if none is found
     */
    findMatchingCompleteMolecule( moleculeStructure ) {
      return _.find( this.completeMolecules, completeMolecule => {
        return moleculeStructure.isEquivalent( completeMolecule ) ? completeMolecule : null;
      } );
    }

    /**
     * @private
     * @returns {Array.<Molecules>}
     */
    getAllCompleteMolecules() {
      // TODO: performance: do we need a full copy here?
      return this.completeMolecules.slice( 0 );
    }

    /*---------------------------------------------------------------------------*
     * computation of allowed molecule structures
     *----------------------------------------------------------------------------*/

    /**
     * @param {CompleteMolecule} completeMolecule
     * @private
     */
    addCompleteMolecule( completeMolecule ) {
      this.completeMolecules.push( completeMolecule );
      this.moleculeNameMap[ completeMolecule.filterCommonName( completeMolecule.commonNameProperty.value ) ] = completeMolecule;
    }

    /**
     * @param {MoleculeStructure} structure
     * @private
     */
    addAllowedStructure( structure ) {
      const strippedMolecule = new StrippedMolecule( structure );
      const hashString = strippedMolecule.stripped.getHistogram().getHashString();

      const spot = this.allowedStructureFormulaMap[ hashString ];
      if ( spot ) {
        spot.push( strippedMolecule );
      }
      else {
        this.allowedStructureFormulaMap[ hashString ] = [ strippedMolecule ];
      }
    }
  }

  let masterInstance = null;
  let initialized = false;
  const initialList = new MoleculeList();

  MoleculeList.startInitialization = () => {
    // TODO: performance: use web worker or chop it up into bits of work
    masterInstance = new MoleculeList();
    masterInstance.loadMasterData();
    initialized = true;
    // TODO: log completion?
  };

  MoleculeList.getMasterInstance = () => {
    if ( !initialized ) {
      // TODO: performance: threading-like replacement goes here
      MoleculeList.startInitialization();
    }

    return masterInstance;
  };

  MoleculeList.getMoleculeByName = name => {
    let result = initialList.moleculeNameMap[ name ];

    if ( !result ) {
      // TODO: logger here needed as a warning for master lookup?
      result = MoleculeList.getMasterInstance().moleculeNameMap[ name ];
    }

    return result;
  };

  /*---------------------------------------------------------------------------*
   * static helper methods
   *----------------------------------------------------------------------------*/

  /**
   * {string} strings - File name relative to the sim's data directory
   * @returns A list of complete molecules
   */
  MoleculeList.readCompleteMoleculesFromData = strings => {
    return _.map( strings, string => {
      const molecule = CompleteMolecule.fromSerial2( string );

      // sanity checks
      assert && assert( !molecule.hasLoopsOrIsDisconnected(),
        'has loops or is disconnected: ' + molecule.filterCommonName( molecule.commonNameProperty.value ) );
      assert && assert( !molecule.hasWeirdHydrogenProperties(),
        'has weird hydrogen pattern in: ' + molecule.filterCommonName( molecule.commonNameProperty.value ) );
      return molecule;
    } );
  };

  /**
   * @param {string} strings - File name relative to the sim's data directory
   * @returns A list of molecule structures
   */
  MoleculeList.readMoleculeStructuresFromData = strings => {
    const len = strings.length;
    const arr = new Array( len );
    for ( let i = 0; i < len; i++ ) {
      const string = strings[ i ];
      const structure = MoleculeStructure.fromSerial2Basic( string );

      // sanity checks
      assert && assert( !structure.hasWeirdHydrogenProperties(), 'Weird hydrogen pattern in structure: ' + string );
      arr[ i ] = structure;
    }
    return arr;
  };

  initialList.loadInitialData();

  /*---------------------------------------------------------------------------*
   * molecule references and customized names
   *----------------------------------------------------------------------------*/

  MoleculeList.CO2 = MoleculeList.getMoleculeByName( 'Carbon Dioxide' );
  MoleculeList.H2O = MoleculeList.getMoleculeByName( 'Water' );
  MoleculeList.N2 = MoleculeList.getMoleculeByName( 'Nitrogen' );
  MoleculeList.CO = MoleculeList.getMoleculeByName( 'Carbon Monoxide' );
  MoleculeList.NO = MoleculeList.getMoleculeByName( 'Nitric Oxide' );
  MoleculeList.O2 = MoleculeList.getMoleculeByName( 'Oxygen' );
  MoleculeList.H2 = MoleculeList.getMoleculeByName( 'Hydrogen' );
  MoleculeList.Cl2 = MoleculeList.getMoleculeByName( 'Chlorine' );
  MoleculeList.NH3 = MoleculeList.getMoleculeByName( 'Ammonia' );

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
    MoleculeList.getMoleculeByName( 'Acetylene' ),
    MoleculeList.getMoleculeByName( 'Borane' ),
    MoleculeList.getMoleculeByName( 'Trifluoroborane' ),
    MoleculeList.getMoleculeByName( 'Chloromethane' ),
    MoleculeList.getMoleculeByName( 'Ethylene' ),
    MoleculeList.getMoleculeByName( 'Fluorine' ),
    MoleculeList.getMoleculeByName( 'Fluoromethane' ),
    MoleculeList.getMoleculeByName( 'Formaldehyde' ),
    MoleculeList.getMoleculeByName( 'Hydrogen Cyanide' ),
    MoleculeList.getMoleculeByName( 'Hydrogen Peroxide' ),
    MoleculeList.getMoleculeByName( 'Hydrogen Sulfide' ),
    MoleculeList.getMoleculeByName( 'Methane' ),
    MoleculeList.getMoleculeByName( 'Nitrous Oxide' ),
    MoleculeList.getMoleculeByName( 'Ozone' ),
    MoleculeList.getMoleculeByName( 'Phosphine' ),
    MoleculeList.getMoleculeByName( 'Silane' ),
    MoleculeList.getMoleculeByName( 'Sulfur Dioxide' )
  ];

  MoleculeList.collectionBoxMolecules.forEach( molecule => {
    assert && assert( !!molecule );
  } );

  // TODO: performance: postpone all of the loading?
  MoleculeList.getMasterInstance();

  return buildAMolecule.register( 'MoleculeList', MoleculeList );
} );
