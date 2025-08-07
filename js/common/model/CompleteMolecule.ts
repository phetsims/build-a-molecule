// Copyright 2020-2025, University of Colorado Boulder


/**
 * Represents a complete (stable) molecule with a name and structure. Includes 2d and 3d representations,
 * and can generate visuals of both types.
 *
 * It's a MoleculeStructure using PubChemAtom
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import AtomNode from '../../../../nitroglycerin/js/nodes/AtomNode.js';
import C2H2Node from '../../../../nitroglycerin/js/nodes/C2H2Node.js';
import C2H4Node from '../../../../nitroglycerin/js/nodes/C2H4Node.js';
import C2H5ClNode from '../../../../nitroglycerin/js/nodes/C2H5ClNode.js';
import C2H5OHNode from '../../../../nitroglycerin/js/nodes/C2H5OHNode.js';
import C2H6Node from '../../../../nitroglycerin/js/nodes/C2H6Node.js';
import CH2ONode from '../../../../nitroglycerin/js/nodes/CH2ONode.js';
import CH3OHNode from '../../../../nitroglycerin/js/nodes/CH3OHNode.js';
import CH4Node from '../../../../nitroglycerin/js/nodes/CH4Node.js';
import Cl2Node from '../../../../nitroglycerin/js/nodes/Cl2Node.js';
import CO2Node from '../../../../nitroglycerin/js/nodes/CO2Node.js';
import CS2Node from '../../../../nitroglycerin/js/nodes/CS2Node.js';
import F2Node from '../../../../nitroglycerin/js/nodes/F2Node.js';
import H2Node from '../../../../nitroglycerin/js/nodes/H2Node.js';
import H2ONode from '../../../../nitroglycerin/js/nodes/H2ONode.js';
import H2SNode from '../../../../nitroglycerin/js/nodes/H2SNode.js';
import HClNode from '../../../../nitroglycerin/js/nodes/HClNode.js';
import HFNode from '../../../../nitroglycerin/js/nodes/HFNode.js';
import N2Node from '../../../../nitroglycerin/js/nodes/N2Node.js';
import N2ONode from '../../../../nitroglycerin/js/nodes/N2ONode.js';
import NH3Node from '../../../../nitroglycerin/js/nodes/NH3Node.js';
import NO2Node from '../../../../nitroglycerin/js/nodes/NO2Node.js';
import NONode from '../../../../nitroglycerin/js/nodes/NONode.js';
import O2Node from '../../../../nitroglycerin/js/nodes/O2Node.js';
import OF2Node from '../../../../nitroglycerin/js/nodes/OF2Node.js';
import P4Node from '../../../../nitroglycerin/js/nodes/P4Node.js';
import PCl3Node from '../../../../nitroglycerin/js/nodes/PCl3Node.js';
import PCl5Node from '../../../../nitroglycerin/js/nodes/PCl5Node.js';
import PF3Node from '../../../../nitroglycerin/js/nodes/PF3Node.js';
import PH3Node from '../../../../nitroglycerin/js/nodes/PH3Node.js';
import SO2Node from '../../../../nitroglycerin/js/nodes/SO2Node.js';
import SO3Node from '../../../../nitroglycerin/js/nodes/SO3Node.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import Bond from './Bond.js';
import Molecule from './Molecule.js';
import MoleculeStructure from './MoleculeStructure.js';

// constants
const OFFSET = 2.5; // used to model our atoms with only 2d data into a 3d representation

// Used to avoid stripping out unused strings, when string.json is accessed via bracket notation. See getDisplayName().
const TRANSLATABLE_MOLECULE_NAMES: Record<string, string> = {
  acetylene: BuildAMoleculeStrings.acetylene,
  ammonia: BuildAMoleculeStrings.ammonia,
  borane: BuildAMoleculeStrings.borane,
  carbonDioxide: BuildAMoleculeStrings.carbonDioxide,
  carbonMonoxide: BuildAMoleculeStrings.carbonMonoxide,
  chloromethane: BuildAMoleculeStrings.chloromethane,
  ethylene: BuildAMoleculeStrings.ethylene,
  fluoromethane: BuildAMoleculeStrings.fluoromethane,
  formaldehyde: BuildAMoleculeStrings.formaldehyde,
  hydrogenCyanide: BuildAMoleculeStrings.hydrogenCyanide,
  hydrogenPeroxide: BuildAMoleculeStrings.hydrogenPeroxide,
  hydrogenSulfide: BuildAMoleculeStrings.hydrogenSulfide,
  methane: BuildAMoleculeStrings.methane,
  molecularChlorine: BuildAMoleculeStrings.molecularChlorine,
  molecularFluorine: BuildAMoleculeStrings.molecularFluorine,
  molecularHydrogen: BuildAMoleculeStrings.molecularHydrogen,
  molecularNitrogen: BuildAMoleculeStrings.molecularNitrogen,
  molecularOxygen: BuildAMoleculeStrings.molecularOxygen,
  nitricOxide: BuildAMoleculeStrings.nitricOxide,
  nitrousOxide: BuildAMoleculeStrings.nitrousOxide,
  ozone: BuildAMoleculeStrings.ozone,
  phosphine: BuildAMoleculeStrings.phosphine,
  silane: BuildAMoleculeStrings.silane,
  sulfurDioxide: BuildAMoleculeStrings.sulfurDioxide,
  trifluoroborane: BuildAMoleculeStrings.trifluoroborane,
  water: BuildAMoleculeStrings.water
};

// Node types used for molecules
const nodeTypes = [
  Cl2Node, CO2Node, CO2Node, CS2Node, F2Node, H2Node, N2Node, NONode, N2ONode, O2Node, C2H2Node, C2H4Node, C2H5ClNode,
  C2H5OHNode, C2H6Node, CH2ONode, CH3OHNode, CH4Node, H2ONode, H2SNode, HClNode, HFNode, NH3Node, NO2Node, OF2Node,
  P4Node, PCl3Node, PCl5Node, PF3Node, PH3Node, SO2Node, SO3Node
];

class CompleteMolecule extends MoleculeStructure {

  // as said by pubchem (or overridden)
  public readonly commonName: string;

  public cid: number;

  // as said by pubchem
  private readonly molecularFormula: string;

  private readonly has2d: boolean;

  private readonly has3d: boolean;

  /**
   * @param commonName
   * @param molecularFormula
   * @param atomCount
   * @param bondCount
   * @param has2d
   * @param has3d
   */
  public constructor( commonName: string, molecularFormula: string, atomCount: number, bondCount: number, has2d: boolean, has3d: boolean ) {
    super( atomCount, bondCount );

    this.commonName = commonName;

    this.cid = 0;

    this.molecularFormula = molecularFormula;

    this.has2d = has2d;

    this.has3d = has3d;
  }

  /**
   * Strip out the 'molecular ' part of the string and process the result.
   */
  public filterCommonName(): string {
    let result = this.commonName;
    if ( result.startsWith( 'molecular ' ) ) {
      result = result.slice( 'molecular '.length );
    }
    return CompleteMolecule.capitalize( result );
  }

  /**
   * A translated display name if possible. This does a weird lookup so that we can only list some of the names in the
   * translation, but can accept an even larger number of translated names in a translation file
   */
  public getDisplayName(): string {
    // first check if we have the name translated. Do NOT warn on missing
    // Convert to camelCase manually (replacing lodash _.camelCase)
    const camelCaseName = this.commonName.toLowerCase().replace( /[^a-zA-Z0-9]+(.)/g, ( match, chr ) => chr.toUpperCase() );
    const translatableCommonName = TRANSLATABLE_MOLECULE_NAMES[ camelCaseName ];
    if ( translatableCommonName ) {
      return translatableCommonName;
    }
    else {
      // if we didn't find it in the strings file, pull it from our English data
      return this.commonName;
    }
  }

  /**
   * A node that represents a 2d but quasi-3D version
   */
  public createPseudo3DNode(): Node {
    const molecularFormula = this.molecularFormula;
    const molecularFormulaType = `${molecularFormula}Node`;

    // if we can find it in the common chemistry nodes, use that
    const length = nodeTypes.length;
    for ( let i = 0; i < length; i++ ) {
      const NodeType = nodeTypes[ i ];
      if ( NodeType.name === molecularFormulaType || ( NodeType.name === 'NH3Node' && molecularFormula === 'H3N' ) ) {
        return new NodeType();
      }
    }

    // otherwise, use our 2d positions to construct a version. we get the correct back-to-front rendering
    const wrappers = ( ( this ).atoms as PubChemAtom[] ).sort( ( a, b ) => a.z3d - b.z3d );
    return new Node( {
      children: wrappers.map( atomWrapper => {
        return new AtomNode( atomWrapper.element, {

          // custom scale for now
          x: atomWrapper.x2d * 15,
          y: atomWrapper.y2d * 15
        } );
      } )
    } );
  }

  /**
   * Returns serialized form of complete molecule data
   */
  public override toSerial2(): string {
    // add in a header
    const format = ( this.has3d ? ( this.has2d ? 'full' : '3d' ) : '2d' );
    return `${this.commonName}|${this.molecularFormula}|${this.cid}|${format}|${super.toSerial2.call( this )}`;
  }


  /**
   * @param str
   */
  private static capitalize( str: string ): string {
    const characters = str.split( '' );
    let lastWasSpace = true;
    for ( let i = 0; i < characters.length; i++ ) {
      const character = characters[ i ];

      // whitespace check in general
      if ( /\s/.test( character ) ) {
        lastWasSpace = true;
      }
      else {
        if ( lastWasSpace && /[a-z]/.test( character ) ) {
          characters[ i ] = character.toUpperCase();
        }
        lastWasSpace = false;
      }
    }
    return characters.join( '' );
  }

  /*---------------------------------------------------------------------------*
   * serialization
   *----------------------------------------------------------------------------*/

  /**
   * Construct a molecule out of a pipe-separated line.
   * WARNING: this always writes out in a "full" configuration, even if the data wasn't contained before
   * @param line A string that is essentially a serialized molecule
   * @returns that is properly constructed
   */
  public static fromString( line: string ): CompleteMolecule {
    let i: number;
    const tokens = line.split( '|' );
    let idx = 0;
    const commonName = tokens[ idx++ ];
    const molecularFormula = tokens[ idx++ ];
    const atomCount = Number( tokens[ idx++ ] );
    const bondCount = Number( tokens[ idx++ ] );
    const completeMolecule = new CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, true, true );

    // for each atom, read its symbol, then 2d coordinates, then 3d coordinates (total of 6 fields)
    for ( i = 0; i < atomCount; i++ ) {
      const symbol = tokens[ idx++ ];
      const x2d = parseFloat( tokens[ idx++ ] );
      const y2d = parseFloat( tokens[ idx++ ] );
      const x3d = parseFloat( tokens[ idx++ ] );
      const y3d = parseFloat( tokens[ idx++ ] );
      const z3d = parseFloat( tokens[ idx++ ] );

      const atom = new PubChemAtom( Element.getElementBySymbol( symbol ), PubChemAtomType.FULL, x2d, y2d, x3d, y3d, z3d );

      completeMolecule.addAtom( atom );
    }

    // for each bond, read atom indices (2 of them, which are 1-indexed), and then the order of the bond (single, double, triple, etc.)
    for ( i = 0; i < bondCount; i++ ) {
      const a = Number( tokens[ idx++ ] );
      const b = Number( tokens[ idx++ ] );
      const order = Number( tokens[ idx++ ] );
      const bond = new PubChemBond( ( completeMolecule ).atoms[ a - 1 ] as PubChemAtom, ( completeMolecule ).atoms[ b - 1 ] as PubChemAtom, order );
      completeMolecule.addBond( bond );
    }

    // Filled in by parsing completeMolecule
    completeMolecule.cid = Number( tokens[ idx++ ] );

    return completeMolecule;
  }


  /**
   * @param line
   */
  public static override fromSerial2( line: string ): MoleculeStructure {
    /*---------------------------------------------------------------------------*
     * extract header
     *----------------------------------------------------------------------------*/
    const tokens = line.split( '|' );
    let idx = 0;
    const commonName = tokens[ idx++ ];
    const molecularFormula = tokens[ idx++ ];
    const cidString = tokens[ idx++ ];
    const cid = Number( cidString );
    const format = tokens[ idx++ ];

    const has2dAnd3d = format === 'full';
    const has2d = format === '2d' || has2dAnd3d;
    const has3d = format === '3d' || has2dAnd3d;
    const burnedLength = commonName.length + 1 + molecularFormula.length + 1 + cidString.length + 1 + format.length + 1;

    // select the atom parser depending on the format
    const atomParser = has3d ? ( has2dAnd3d ? PubChemAtom.parseFull : PubChemAtom.parse3d ) : PubChemAtom.parse2d;

    return MoleculeStructure.fromSerial2( line.slice( burnedLength ), ( atomCount: number, bondCount: number ) => {
      const molecule = new CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, has2d, has3d );
      molecule.cid = cid;
      return molecule;
      // @ts-expect-error - relates somewhat to https://github.com/phetsims/build-a-molecule/issues/246
    }, atomParser, PubChemBond.parse );
  }
}

// Signature for Atom without 2d or 3d representation
const PubChemAtomType = EnumerationDeprecated.byKeys( [ 'TWO_DIMENSION', 'THREE_DIMENSION', 'FULL' ] ) as IntentionalAny;

export class PubChemAtom extends Atom {

  public readonly type: string;

  public readonly x2d: number;
  public readonly y2d: number;

  public readonly x3d: number;
  public readonly y3d: number;
  public readonly z3d: number;

  public constructor( element: Element, type: string, x2d: number, y2d: number, x3d: number, y3d: number, z3d: number ) {
    super( element );

    this.type = type;

    this.x2d = x2d;
    this.y2d = y2d;

    this.x3d = x3d;
    this.y3d = y3d;
    this.z3d = z3d;
  }

  /**
   * Stringify the structure of the atom.
   */
  public override toString(): string {
    if ( this.type === PubChemAtomType.TWO_DIMENSION ) {
      return `${super.toString()} ${this.x2d} ${this.y2d}`;
    }
    else if ( this.type === PubChemAtomType.THREE_DIMENSION ) {
      return `${super.toString()} ${this.x3d} ${this.y3d} ${this.z3d}`;
    }
    else if ( this.type === PubChemAtomType.FULL ) {
      return `${super.toString()} ${this.x2d} ${this.y2d} ${this.x3d} ${this.y3d} ${this.z3d}`;
    }
    else {
      throw new Error( `Unsupported type: ${this.type}` );
    }
  }

  /**
   * Parser for PubChemAtom with only 2d data
   * @param atomString
   */
  public static parse2d( atomString: string ): PubChemAtom {
    const tokens = atomString.split( ' ' );
    const element = Element.getElementBySymbol( tokens[ 0 ] );
    const x2d = parseFloat( tokens[ 1 ] );
    const y2d = parseFloat( tokens[ 2 ] );
    return new PubChemAtom( element, PubChemAtomType.TWO_DIMENSION, x2d, y2d, x2d - OFFSET, y2d, 0 );
  }

  /**
   * Parser for PubChemAtom with only 3d data
   * @param atomString
   */
  public static parse3d( atomString: string ): PubChemAtom {
    const tokens = atomString.split( ' ' );
    const element = Element.getElementBySymbol( tokens[ 0 ] );
    const x3d = parseFloat( tokens[ 1 ] );
    const y3d = parseFloat( tokens[ 2 ] );
    const z3d = parseFloat( tokens[ 3 ] );
    return new PubChemAtom( element, PubChemAtomType.THREE_DIMENSION, 0, 0, x3d, y3d, z3d );
  }

  /**
   * Parser for PubChemAtom with 2d and 3d data
   * @param atomString
   */
  public static parseFull( atomString: string ): PubChemAtom {
    const tokens = atomString.split( ' ' );
    const element = Element.getElementBySymbol( tokens[ 0 ] );
    const x2d = parseFloat( tokens[ 1 ] );
    const y2d = parseFloat( tokens[ 2 ] );
    const x3d = parseFloat( tokens[ 3 ] );
    const y3d = parseFloat( tokens[ 4 ] );
    const z3d = parseFloat( tokens[ 5 ] );
    return new PubChemAtom( element, PubChemAtomType.FULL, x2d, y2d, x3d, y3d, z3d );
  }
}

// Signature for bonds, where a and b are PubChemAtoms of some type
export class PubChemBond extends Bond {

  public readonly order: number;

  /**
   * @param a
   * @param b
   * @param order
   */
  public constructor( a: PubChemAtom, b: PubChemAtom, order: number ) {
    super( a, b );

    this.order = order;
  }

  /**
   * Returns serialized form of bond data including the bond order
   * @param index - Index of bond within molecule
   */
  public override toSerial2( index: number ): string {
    return `${index}-${this.order}`;
  }

  /**
   * Parser for PubChemBond
   * @param bondString
   * @param connectedAtom
   * @param molecule
   */
  public static parse( bondString: string, connectedAtom: Atom, molecule: Molecule ): PubChemBond {
    const tokens = bondString.split( '-' );
    const index = Number( tokens[ 0 ] );
    const order = Number( tokens[ 1 ] );
    return new PubChemBond( connectedAtom as PubChemAtom, molecule.atoms[ index ] as PubChemAtom, order );
  }
}

buildAMolecule.register( 'CompleteMolecule', CompleteMolecule );
export default CompleteMolecule;