// Copyright 2020-2022, University of Colorado Boulder

/**
 * Has functions relating to lists of molecules (e.g. is a molecule or submolecule allowed?) Uses static initialization to load in a small fraction
 * of molecules from collection-molecules.txt, and then in a separate thread loads the rest of the molecules + the allowed structures. The 1st
 * call that requires the full molecule list or allowed structures will block until it is all read in or computed
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import buildAMolecule from '../../buildAMolecule.js';
import CompleteMolecule from './CompleteMolecule.js';
import collectionMoleculesData from './data/collectionMoleculesData.js';
import otherMoleculesData from './data/otherMoleculesData.js';
import structuresData from './data/structuresData.js';
import MoleculeStructure from './MoleculeStructure.js';
import StrippedMolecule from './StrippedMolecule.js';

class MoleculeList {
  constructor() {

    // @public {Array.<CompleteMolecule>}
    this.completeMolecules = [];

    // @private {Object.<name:string, CompleteMolecule>} Unique name => complete molecule
    this.moleculeNameMap = {};

    // @private {Object.<spot:string, Array.<StrippedMolecule>} Formula => allowed stripped molecules (array)
    this.allowedStructureFormulaMap = {};
  }


  /**
   * Load in the initial list of complete molecules for the collection boxes (collectionMoleculesData)
   * @private
   */
  loadInitialData() {
    const startTime = Date.now();
    const mainMolecules = MoleculeList.readCompleteMoleculesFromData( collectionMoleculesData );
    mainMolecules.forEach( this.addCompleteMolecule.bind( this ) );
    console.log( `loaded initial data in ${Date.now() - startTime}ms` );
  }

  /**
   * Load a list of all the remaining complete molecules (otherMoleculesData)
   * @private
   */
  loadMasterData() {
    const startTime = Date.now();
    // load in our collection molecules first
    MoleculeList.initialList.getAllCompleteMolecules().forEach( this.addCompleteMolecule.bind( this ) );

    // then load other molecules
    const mainMolecules = MoleculeList.readCompleteMoleculesFromData( otherMoleculesData );
    mainMolecules.forEach( molecule => {
      // if our molecule was included in the initial lookup, use that initial version instead so we can have instance equality preserved
      const initialListLookup = MoleculeList.initialList.moleculeNameMap[ molecule.filterCommonName( molecule.commonName ) ];
      if ( initialListLookup && molecule.isEquivalent( initialListLookup ) ) {
        molecule = initialListLookup;
      }

      this.addCompleteMolecule( molecule );
    } );

    // then load structures
    const mainStructures = MoleculeList.readMoleculeStructuresFromData( structuresData );
    mainStructures.forEach( this.addAllowedStructure.bind( this ) );
    console.log( `loaded master data in ${Date.now() - startTime}ms` );
  }

  /**
   * Check whether this structure is allowed. Currently this means it is a "sub-molecule" of one of our complete
   * molecules
   * @param {MoleculeStructure} moleculeStructure
   *
   * @public
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
    // Note: (performance) only do the lookup once
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
   * @param {MoleculeStructure} moleculeStructure
   *
   * @public
   * @returns {CompleteMolecule|null} Either a matching CompleteMolecule, or null if none is found
   */
  findMatchingCompleteMolecule( moleculeStructure ) {
    return _.find( this.completeMolecules, completeMolecule => {
      return moleculeStructure.isEquivalent( completeMolecule ) ? completeMolecule : null;
    } );
  }

  /**
   * Return all the complected molecules
   * @private
   *
   * @returns {Array.<Molecule>}
   */
  getAllCompleteMolecules() {
    // Note: (performance) do we need a full copy here?
    return this.completeMolecules.slice();
  }

  /*---------------------------------------------------------------------------*
   * computation of allowed molecule structures
   *----------------------------------------------------------------------------*/

  /**
   * Add a complete molecule and map its common name
   * @param {CompleteMolecule} completeMolecule
   *
   * @private
   */
  addCompleteMolecule( completeMolecule ) {
    this.completeMolecules.push( completeMolecule );
    this.moleculeNameMap[ completeMolecule.filterCommonName( completeMolecule.commonName ) ] = completeMolecule;
  }

  /**
   * Add the structure to the allowed structure map
   * @param {MoleculeStructure} structure
   *
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

  /**
   * Load master data
   *
   * @private
   */
  static startInitialization() {
    // Note: (performance) use web worker or chop it up into bits of work
    MoleculeList.masterInstance = new MoleculeList();
    MoleculeList.masterInstance.loadMasterData();
    MoleculeList.initialized = true;
    console.log( 'Master list loaded.' );
  }


  /**
   * Return master data
   *
   * @public
   * @returns {*}
   */
  static getMasterInstance() {
    if ( !MoleculeList.initialized ) {
      // Note: (performance) threading-like replacement goes here
      MoleculeList.startInitialization();
    }

    return MoleculeList.masterInstance;
  }


  /**
   * Return molecule name from master data
   * @param {string} name
   *
   * @private
   * @returns {string}
   */
  static getMoleculeByName( name ) {
    let result = MoleculeList.initialList.moleculeNameMap[ name ];

    if ( !result ) {
      console.log( 'Searching', name, 'in master instance.' );
      result = MoleculeList.getMasterInstance().moleculeNameMap[ name ];
    }

    return result;
  }

  /**
   * Returns a list of complete molecules
   * @param {string} strings - File name relative to the sim's data directory
   *
   * @private
   * @returns
   */
  static readCompleteMoleculesFromData( strings ) {
    return _.map( strings, string => {
      const molecule = CompleteMolecule.fromSerial2( string );

      // sanity checks
      assert && assert( !molecule.hasLoopsOrIsDisconnected(),
        `has loops or is disconnected: ${molecule.filterCommonName( molecule.commonName )}` );
      assert && assert( !molecule.hasWeirdHydrogenProperties(),
        `has weird hydrogen pattern in: ${molecule.filterCommonName( molecule.commonName )}` );
      return molecule;
    } );
  }

  /**
   * Returns a list of molecule structures
   * @param {string} strings - File name relative to the sim's data directory
   *
   * @private
   * @returns
   */
  static readMoleculeStructuresFromData( strings ) {
    const len = strings.length;
    const arr = new Array( len );
    for ( let i = 0; i < len; i++ ) {
      const string = strings[ i ];
      const structure = MoleculeStructure.fromSerial2Basic( string );

      // sanity checks
      assert && assert( !structure.hasWeirdHydrogenProperties(), `Weird hydrogen pattern in structure: ${string}` );
      arr[ i ] = structure;
    }
    return arr;
  }
}

// statics
// @private {MoleculeList|null}
MoleculeList.masterInstance = null;

// @private {boolean}
MoleculeList.initialized = false;

// @private {MoleculeList}
MoleculeList.initialList = new MoleculeList();
MoleculeList.initialList.loadInitialData();

/*---------------------------------------------------------------------------*
 * molecule references and customized names
 *----------------------------------------------------------------------------*/

// @public {string}
MoleculeList.CO2 = MoleculeList.getMoleculeByName( 'Carbon Dioxide' );
MoleculeList.H2O = MoleculeList.getMoleculeByName( 'Water' );
MoleculeList.N2 = MoleculeList.getMoleculeByName( 'Nitrogen' );
MoleculeList.CO = MoleculeList.getMoleculeByName( 'Carbon Monoxide' );
MoleculeList.NO = MoleculeList.getMoleculeByName( 'Nitric Oxide' );
MoleculeList.O2 = MoleculeList.getMoleculeByName( 'Oxygen' );
MoleculeList.H2 = MoleculeList.getMoleculeByName( 'Hydrogen' );
MoleculeList.Cl2 = MoleculeList.getMoleculeByName( 'Chlorine' );
MoleculeList.NH3 = MoleculeList.getMoleculeByName( 'Ammonia' );
MoleculeList.C2H4O2 = MoleculeList.getMoleculeByName( 'Acetic Acid' );

// @public {Array.<String>} Molecules that can be used for collection boxes
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

// Note: (performance) postpone all of the loading?
MoleculeList.getMasterInstance();

buildAMolecule.register( 'MoleculeList', MoleculeList );
export default MoleculeList;