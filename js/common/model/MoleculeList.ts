// Copyright 2020-2023, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck


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

  public constructor() {

    this.completeMolecules = [];

    this.moleculeNameMap = {};

    this.allowedStructureFormulaMap = {};
  }


  /**
   * Load in the initial list of complete molecules for the collection boxes (collectionMoleculesData)
   */
  private loadInitialData(): void {
    const startTime = Date.now();
    const mainMolecules = MoleculeList.readCompleteMoleculesFromData( collectionMoleculesData );
    mainMolecules.forEach( this.addCompleteMolecule.bind( this ) );
    console.log( `loaded initial data in ${Date.now() - startTime}ms` );
  }

  /**
   * Load a list of all the remaining complete molecules (otherMoleculesData)
   */
  private loadMainData(): void {
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
    console.log( `loaded main data in ${Date.now() - startTime}ms` );
  }

  /**
   * Check whether this structure is allowed. Currently this means it is a "sub-molecule" of one of our complete
   * molecules
   * @param moleculeStructure
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
   * @param moleculeStructure
   * @returns Either a matching CompleteMolecule, or null if none is found
   */
  public findMatchingCompleteMolecule( moleculeStructure: MoleculeStructure ): CompleteMolecule | null {
    return this.completeMolecules.find( completeMolecule => {
      return moleculeStructure.isEquivalent( completeMolecule );
    } ) || null;
  }

  /**
   * Return all the complected molecules
   */
  private getAllCompleteMolecules(): CompleteMolecule[] {
    // Note: (performance) do we need a full copy here?
    return this.completeMolecules.slice();
  }

  /*---------------------------------------------------------------------------*
   * computation of allowed molecule structures
   *----------------------------------------------------------------------------*/

  /**
   * Add a complete molecule and map its common name
   * @param completeMolecule
   */
  private addCompleteMolecule( completeMolecule: CompleteMolecule ): void {
    this.completeMolecules.push( completeMolecule );
    this.moleculeNameMap[ completeMolecule.filterCommonName( completeMolecule.commonName ) ] = completeMolecule;
  }

  /**
   * Add the structure to the allowed structure map
   * @param structure
   */
  private addAllowedStructure( structure: MoleculeStructure ): void {
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
  private static startInitialization(): void {
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

    return MoleculeList.mainInstance;
  }


  /**
   * Return molecule name from main data
   * @param name
   */
  private static getMoleculeByName( name: string ): CompleteMolecule | null {
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

// statics
MoleculeList.mainInstance = null;

MoleculeList.initialized = false;

MoleculeList.initialList = new MoleculeList();
MoleculeList.initialList.loadInitialData();

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
MoleculeList.C2H4O2 = MoleculeList.getMoleculeByName( 'Acetic Acid' );

// Molecules that can be used for collection boxes
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
MoleculeList.getMainInstance();

buildAMolecule.register( 'MoleculeList', MoleculeList );
export default MoleculeList;