// Copyright 2020-2023, University of Colorado Boulder

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

  public readonly completeMolecules: CompleteMolecule[];

  // Unique name => complete molecule
  private readonly moleculeNameMap: Record<string, CompleteMolecule>;

  // Formula => allowed stripped molecules (array)
  private readonly allowedStructureFormulaMap: Record<string, StrippedMolecule[]>;

  // Static properties
  public static mainInstance: MoleculeList | null;
  public static initialized: boolean;
  public static initialList: MoleculeList;

  public constructor() {

    this.completeMolecules = [];

    this.moleculeNameMap = {};

    this.allowedStructureFormulaMap = {};
  }


  /**
   * Load in the initial list of complete molecules for the collection boxes (collectionMoleculesData)
   */
  public loadInitialData(): void {
    const startTime = Date.now();
    const mainMolecules = MoleculeList.readCompleteMoleculesFromData( collectionMoleculesData );
    mainMolecules.forEach( this.addCompleteMolecule.bind( this ) );
    console.log( `loaded initial data in ${Date.now() - startTime}ms` );
  }

  /**
   * Load a list of all the remaining complete molecules (otherMoleculesData)
   */
  public loadMainData(): void {
    const startTime = Date.now();
    // load in our collection molecules first
    MoleculeList.initialList.getAllCompleteMolecules().forEach( this.addCompleteMolecule.bind( this ) );

    // then load other molecules
    const mainMolecules = MoleculeList.readCompleteMoleculesFromData( otherMoleculesData );
    mainMolecules.forEach( molecule => {
      // if our molecule was included in the initial lookup, use that initial version instead so we can have instance equality preserved
      const initialListLookup = MoleculeList.initialList.moleculeNameMap[ molecule.filterCommonName() ];
      if ( initialListLookup && molecule.isEquivalent( initialListLookup ) ) {
        molecule = initialListLookup;
      }

      this.addCompleteMolecule( molecule );
    } );

    // then load structures
    const mainStructures = MoleculeList.readMoleculeStructuresFromData( structuresData );
    mainStructures.forEach( this.addAllowedStructure.bind( this ) );
    console.log( `loaded main data in ${Date.now() - startTime}ms` );
  }

  /**
   * Check whether this structure is allowed. Currently, this means it is a "sub-molecule" of one of our complete
   * molecules
   * @param moleculeStructure - The molecule structure to check
   * @returns True if it is allowed
   */
  public isAllowedStructure( moleculeStructure: MoleculeStructure ): boolean {
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
   * @param moleculeStructure - The molecule structure to find a match for
   * @returns Either a matching CompleteMolecule, or null if none is found
   */
  public findMatchingCompleteMolecule( moleculeStructure: MoleculeStructure ): CompleteMolecule | null {
    return this.completeMolecules.find( completeMolecule => {
      return moleculeStructure.isEquivalent( completeMolecule );
    } ) || null;
  }

  /**
   * Return all the completed molecules
   */
  public getAllCompleteMolecules(): CompleteMolecule[] {
    // Note: (performance) do we need a full copy here?
    return this.completeMolecules.slice();
  }

  /*---------------------------------------------------------------------------*
   * computation of allowed molecule structures
   *----------------------------------------------------------------------------*/

  /**
   * Add a complete molecule and map its common name
   * @param completeMolecule - The complete molecule to add
   */
  public addCompleteMolecule( completeMolecule: CompleteMolecule ): void {
    this.completeMolecules.push( completeMolecule );
    this.moleculeNameMap[ completeMolecule.filterCommonName() ] = completeMolecule;
  }

  /**
   * Add the structure to the allowed structure map
   * @param structure - The molecule structure to add
   */
  public addAllowedStructure( structure: MoleculeStructure ): void {
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
   * Load main data
   */
  public static startInitialization(): void {
    // Note: (performance) use web worker or chop it up into bits of work
    MoleculeList.mainInstance = new MoleculeList();
    MoleculeList.mainInstance.loadMainData();
    MoleculeList.initialized = true;
    console.log( 'Main list loaded.' );
  }


  /**
   * Return main data
   */
  public static getMainInstance(): MoleculeList {
    if ( !MoleculeList.initialized ) {
      // Note: (performance) threading-like replacement goes here
      MoleculeList.startInitialization();
    }

    return MoleculeList.mainInstance!; // Non-null assertion - mainInstance is set in startInitialization
  }


  /**
   * Return molecule name from main data
   * @param name - The name of the molecule to get
   */
  public static getMoleculeByName( name: string ): CompleteMolecule | null {
    let result = MoleculeList.initialList.moleculeNameMap[ name ];

    if ( !result ) {
      console.log( 'Searching', name, 'in main instance.' );
      result = MoleculeList.getMainInstance().moleculeNameMap[ name ];
    }

    return result;
  }

  /**
   * Returns a list of complete molecules
   * @param strings - File name relative to the sim's data directory
   */
  private static readCompleteMoleculesFromData( strings: string[] ): CompleteMolecule[] {
    return strings.map( string => {
      const molecule = CompleteMolecule.fromSerial2( string ) as CompleteMolecule;

      // sanity checks
      assert && assert( !molecule.hasLoopsOrIsDisconnected(), `has loops or is disconnected: ${molecule.filterCommonName()}` );
      assert && assert( !molecule.hasWeirdHydrogenProperties(), `has weird hydrogen pattern in: ${molecule.filterCommonName()}` );
      return molecule;
    } );
  }

  /**
   * Returns a list of molecule structures
   * @param strings - File name relative to the sim's data directory
   */
  private static readMoleculeStructuresFromData( strings: string[] ): MoleculeStructure[] {
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

// Initialize static properties
MoleculeList.mainInstance = null;
MoleculeList.initialized = false;
MoleculeList.initialList = new MoleculeList();
MoleculeList.initialList.loadInitialData();

/*---------------------------------------------------------------------------*
 * molecule references and customized names
 *----------------------------------------------------------------------------*/

// Common molecule references - moved from static properties to avoid null types
const COMMON_MOLECULES = {
  CO2: MoleculeList.getMoleculeByName( 'Carbon Dioxide' )!,
  H2O: MoleculeList.getMoleculeByName( 'Water' )!,
  N2: MoleculeList.getMoleculeByName( 'Nitrogen' )!,
  CO: MoleculeList.getMoleculeByName( 'Carbon Monoxide' )!,
  NO: MoleculeList.getMoleculeByName( 'Nitric Oxide' )!,
  O2: MoleculeList.getMoleculeByName( 'Oxygen' )!,
  H2: MoleculeList.getMoleculeByName( 'Hydrogen' )!,
  Cl2: MoleculeList.getMoleculeByName( 'Chlorine' )!,
  NH3: MoleculeList.getMoleculeByName( 'Ammonia' )!,
  C2H4O2: MoleculeList.getMoleculeByName( 'Acetic Acid' )!
} as const;

// Molecules that can be used for collection boxes
const COLLECTION_BOX_MOLECULES: CompleteMolecule[] = [
  COMMON_MOLECULES.CO2,
  COMMON_MOLECULES.H2O,
  COMMON_MOLECULES.N2,
  COMMON_MOLECULES.CO,
  COMMON_MOLECULES.O2,
  COMMON_MOLECULES.H2,
  COMMON_MOLECULES.NH3,
  COMMON_MOLECULES.Cl2,
  COMMON_MOLECULES.NO,
  MoleculeList.getMoleculeByName( 'Acetylene' )!,
  MoleculeList.getMoleculeByName( 'Borane' )!,
  MoleculeList.getMoleculeByName( 'Trifluoroborane' )!,
  MoleculeList.getMoleculeByName( 'Chloromethane' )!,
  MoleculeList.getMoleculeByName( 'Ethylene' )!,
  MoleculeList.getMoleculeByName( 'Fluorine' )!,
  MoleculeList.getMoleculeByName( 'Fluoromethane' )!,
  MoleculeList.getMoleculeByName( 'Formaldehyde' )!,
  MoleculeList.getMoleculeByName( 'Hydrogen Cyanide' )!,
  MoleculeList.getMoleculeByName( 'Hydrogen Peroxide' )!,
  MoleculeList.getMoleculeByName( 'Hydrogen Sulfide' )!,
  MoleculeList.getMoleculeByName( 'Methane' )!,
  MoleculeList.getMoleculeByName( 'Nitrous Oxide' )!,
  MoleculeList.getMoleculeByName( 'Ozone' )!,
  MoleculeList.getMoleculeByName( 'Phosphine' )!,
  MoleculeList.getMoleculeByName( 'Silane' )!,
  MoleculeList.getMoleculeByName( 'Sulfur Dioxide' )!
];

COLLECTION_BOX_MOLECULES.forEach( molecule => {
  assert && assert( !!molecule );
} );

// Note: (performance) postpone all of the loading?
MoleculeList.getMainInstance();

buildAMolecule.register( 'MoleculeList', MoleculeList );

// Export the constants for external use
export { COMMON_MOLECULES, COLLECTION_BOX_MOLECULES };
export default MoleculeList;