// Copyright 2020, University of Colorado Boulder

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
import CO2Node from '../../../../nitroglycerin/js/nodes/CO2Node.js';
import CS2Node from '../../../../nitroglycerin/js/nodes/CS2Node.js';
import Cl2Node from '../../../../nitroglycerin/js/nodes/Cl2Node.js';
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
import Node from '../../../../scenery/js/nodes/Node.js';
import BAMStrings from '../../BAMStrings.js';
import buildAMolecule from '../../buildAMolecule.js';
import Bond from './Bond.js';
import MoleculeStructure from './MoleculeStructure.js';

// constants
const OFFSET = 2.5; // used to model our atoms with only 2d data into a 3d representation

// Node types used for molecules
const nodeTypes = [
  Cl2Node, CO2Node, CO2Node, CS2Node, F2Node, H2Node, N2Node, NONode, N2ONode, O2Node, C2H2Node, C2H4Node, C2H5ClNode,
  C2H5OHNode, C2H6Node, CH2ONode, CH3OHNode, CH4Node, H2ONode, H2SNode, HClNode, HFNode, NH3Node, NO2Node, OF2Node,
  P4Node, PCl3Node, PCl5Node, PF3Node, PH3Node, SO2Node, SO3Node
];

class CompleteMolecule extends MoleculeStructure {
  /**
   * @param {string} commonName
   * @param {string} molecularFormula
   * @param {number} atomCount
   * @param {number} bondCount
   * @param {boolean} has2d
   * @param {boolean} has3d
   */
  constructor( commonName, molecularFormula, atomCount, bondCount, has2d, has3d ) {
    super( atomCount, bondCount );

    // @public {string} as said by pubchem (or overridden)
    this.commonName = commonName;

    // @public {number}
    this.cid = 0;

    // @private {string} as said by pubchem
    this.molecularFormula = molecularFormula;

    // @private {boolean}
    this.has2d = has2d;

    // @private {boolean}
    this.has3d = has3d;

  }

  /**
   * Strip out the 'molecular ' part of the string and process the result.
   *
   * @public
   * @returns {string}
   */
  filterCommonName() {
    let result = this.commonName;
    if ( result.indexOf( 'molecular ' ) === 0 ) {
      result = result.slice( 'molecular '.length );
    }
    return CompleteMolecule.capitalize( result );
  }

  /**
   * The translation string key that should be used to look up a translated value
   *
   * @private
   * @returns {string}
   */
  get stringKey() {
    return 'molecule.' + this.commonName.replace( ' ', '_' );
  }

  /**
   * A translated display name if possible. This does a weird lookup so that we can only list some of the names in the
   * translation, but can accept an even larger number of translated names in a translation file
   * @public
   *
   * @returns
   */
  getDisplayName() {
    // first check if we have it translated. do NOT warn on missing
    const lookupKey = this.stringKey;
    const stringLookup = BAMStrings[ lookupKey ]; // NOTE: do NOT warn or error on missing strings, this is generally expected

    // we need to check whether it came back the same as the key due to how getString works.
    if ( stringLookup && stringLookup !== lookupKey ) {
      return stringLookup;
    }
    else {
      // if we didn't find it, pull it from our English data
      return this.commonName;
    }
  }

  /**
   * A node that represents a 2d but quasi-3D version
   *
   * @public
   * @returns {Node}
   */
  createPseudo3DNode() {
    const molecularFormula = this.molecularFormula;
    const molecularFormulaType = molecularFormula + 'Node';

    // if we can find it in the common chemistry nodes, use that
    const length = nodeTypes.length;
    for ( let i = 0; i < length; i++ ) {
      const NodeType = nodeTypes[ i ];
      if ( NodeType.name === molecularFormulaType || ( NodeType.name === 'NH3Node' && molecularFormula === 'H3N' ) ) {
        return new NodeType();
      }
    }

    // otherwise, use our 2d positions to construct a version. we get the correct back-to-front rendering
    const wrappers = _.sortBy( this.atoms, atom => {
      return atom.z3d;
    } );
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
   *
   * @public
   * @returns {string}
   */
  toSerial2() {
    // add in a header
    const format = ( this.has3d ? ( this.has2d ? 'full' : '3d' ) : '2d' );
    return this.commonName + '|' + this.molecularFormula + '|' + this.cid + '|' + format + '|' + super.toSerial2.call( this );
  }


  /**
   * @
   * @param {string} str
   *
   * @private
   */
  static capitalize( str ) {
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
   * REVIEW: visibility, and ideally move as a static class method
   *
   * WARNING: this always writes out in a "full" configuration, even if the data wasn't contained before
   *
   * @param {string} line A string that is essentially a serialized molecule
   * @returns {CompleteMolecule} that is properly constructed
   */
  static fromString( line ) {
    let i;
    const tokens = line.split( '|' );
    let idx = 0;
    const commonName = tokens[ idx++ ];
    const molecularFormula = tokens[ idx++ ];
    const atomCount = parseInt( tokens[ idx++ ], 10 );
    const bondCount = parseInt( tokens[ idx++ ], 10 );
    const completeMolecule = new CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, true, true );

    // for each atom, read its symbol, then 2d coordinates, then 3d coordinates (total of 6 fields)
    for ( i = 0; i < atomCount; i++ ) {
      const symbol = tokens[ idx++ ];
      const x2d = parseFloat( tokens[ idx++ ] );
      const y2d = parseFloat( tokens[ idx++ ] );
      const x3d = parseFloat( tokens[ idx++ ] );
      const y3d = parseFloat( tokens[ idx++ ] );
      const z3d = parseFloat( tokens[ idx++ ] );
      const atom = new PubChemAtomFull( Element.getElementBySymbol( symbol ), x2d, y2d, x3d, y3d, z3d );
      completeMolecule.addAtom( atom );
    }

    // for each bond, read atom indices (2 of them, which are 1-indexed), and then the order of the bond (single, double, triple, etc.)
    for ( i = 0; i < bondCount; i++ ) {
      const a = parseInt( tokens[ idx++ ], 10 );
      const b = parseInt( tokens[ idx++ ], 10 );
      const order = parseInt( tokens[ idx++ ], 10 );
      const bond = new PubChemBond( completeMolecule.atoms[ a - 1 ], completeMolecule.atoms[ b - 1 ], order ); // -1 since our format is 1-based
      completeMolecule.addBond( bond );
    }

    // Filled in by parsing completeMolecule
    completeMolecule.cid = parseInt( tokens[ idx++ ], 10 );

    return completeMolecule;
  }


  /**
   * @param {string} line
   *
   * @public
   * @returns {MoleculeStructure}
   */
  static fromSerial2( line ) {
    /*---------------------------------------------------------------------------*
     * extract header
     *----------------------------------------------------------------------------*/
    const tokens = line.split( '|' );
    let idx = 0;
    const commonName = tokens[ idx++ ];
    const molecularFormula = tokens[ idx++ ];
    const cidString = tokens[ idx++ ];
    const cid = parseInt( cidString, 10 );
    const format = tokens[ idx++ ];

    const has2dAnd3d = format === 'full';
    const has2d = format === '2d' || has2dAnd3d;
    const has3d = format === '3d' || has2dAnd3d;
    const burnedLength = commonName.length + 1 + molecularFormula.length + 1 + cidString.length + 1 + format.length + 1;

    // select the atom parser depending on the format
    const atomParser = has3d ? ( has2dAnd3d ? PubChemAtomFull.parse : PubChemAtom3.parse ) : PubChemAtom2.parse;

    return MoleculeStructure.fromSerial2( line.slice( burnedLength ), ( atomCount, bondCount ) => {
      const molecule = new CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, has2d, has3d );
      molecule.cid = cid;
      return molecule;
    }, atomParser, PubChemBond.parse );
  }
}

/*---------------------------------------------------------------------------*
 * atom varieties, depending on what information we have from PubChem. varieties
 * are necessary for memory size requirements so we don't store more data than
 * necessary.
 * REVIEW: It looks like our in-memory format is the same for all of the varieties. Would it simplify things to
 * REVIEW: Have one "Type" (PubChemAtom), that has an enumeration flag for what data is encoded? That could affect
 * REVIEW: the serialization and could have deserialization methods for each, but then we can properly type
 * REVIEW: PubChemBond and other things out, and it will save the amount of code. Thoughts? I'm not set on a way
 * REVIEW: of doing it.
 *----------------------------------------------------------------------------*/

// Signature for Atom without 2d or 3d representation
class PubChemAtom extends Atom {

  /**
   * @param {Element} element
   */
  constructor( element ) {
    super( element );

    // @public {boolean}
    this.has2d = false;
    this.has3d = false;

    // @private {number}
    this.x2d = 0;
    this.y2d = 0;

    // @public {number}
    this.x3d = 0;
    this.y3d = 0;
    this.z3d = 0;
  }
}

CompleteMolecule.PubChemAtom = PubChemAtom;

// Signature for Atom with only a 2d representation
class PubChemAtom2 extends Atom {
  /**
   * @param {Element} element
   * @param {number} x2d
   * @param {number} y2d
   */
  constructor( element, x2d, y2d ) {
    super( element );

    // @private {boolean}
    this.has2d = true;
    this.has3d = false;

    // @private {number}
    this.x2d = x2d;
    this.y2d = y2d;

    // @public {number} 3d representation uses only 2d data but is adjusted by an offset
    this.x3d = x2d - OFFSET;
    this.y3d = y2d;
    this.z3d = 0;
  }

  /**
   * Stringify the structure of the atom.
   *
   * @public
   * @override
   * @returns {string}
   */
  toString() {
    return super.toString() + ' ' + this.x2d + ' ' + this.y2d;
  }

  /**
   * Parse PubChemAtom2
   * @param {string} atomString
   *
   * @public
   * @returns {PubChemAtom2}
   */
  static parse( atomString ) {
    const tokens = atomString.split( ' ' );
    return new PubChemAtom2( Element.getElementBySymbol( tokens[ 0 ] ),
      parseFloat( tokens[ 1 ] ),
      parseFloat( tokens[ 2 ] ) );
  }
}

CompleteMolecule.PubChemAtom2 = PubChemAtom2;

// Signature for Atom with only a 3d representation
class PubChemAtom3 extends Atom {

  /**
   * @param {Element} element
   * @param {number} x3d
   * @param {number} y3d
   * @param {number} z3d
   */
  constructor( element, x3d, y3d, z3d ) {
    super( element );

    // @private {boolean}
    this.has2d = false;
    this.has3d = true;

    // @private {number}
    this.x2d = x3d;
    this.y2d = 0;

    // @public {number}
    this.x3d = x3d;
    this.y3d = y3d;
    this.z3d = z3d;
  }

  /**
   * Stringify the structure of the atom.
   *
   * @public
   * @override
   * @returns {string}
   */
  toString() {
    return super.toString() + ' ' + this.x3d + ' ' + this.y3d + ' ' + this.z3d;
  }

  /**
   * Parse PubChemAtom3
   * @param {string} atomString
   *
   * @public
   * @returns {PubChemAtom3}
   */
  static parse( atomString ) {
    const tokens = atomString.split( ' ' );
    return new PubChemAtom3( Element.getElementBySymbol( tokens[ 0 ] ),
      parseFloat( tokens[ 1 ] ),
      parseFloat( tokens[ 2 ] ),
      parseFloat( tokens[ 3 ] ) );
  }
}

CompleteMolecule.PubChemAtom3 = PubChemAtom3;

// Signature for Atom with both a 2d and 3d representation
class PubChemAtomFull extends Atom {

  /**
   * @param {Element} element
   * @param {number} x2d
   * @param {number} y2d
   * @param {number} x3d
   * @param {number} y3d
   * @param {number} z3d
   */
  constructor( element, x2d, y2d, x3d, y3d, z3d ) {
    super( element );

    // @private {boolean}
    this.has2d = true;
    this.has3d = true;

    // @private {number}
    this.x2d = x2d;
    this.y2d = y2d;

    // @public {boolean}
    this.x3d = x3d;
    this.y3d = y3d;
    this.z3d = z3d;
  }

  /**
   * Stringify the structure of the atom
   *
   * @public
   * @override
   * @returns {string}
   */
  toString() {
    return super.toString() + ' ' + this.x2d + ' ' + this.y2d + ' ' + this.x3d + ' ' + this.y3d + ' ' + this.z3d;
  }

  /**
   * Parser for PubChemAtomFull
   * @param {string} atomString
   *
   *  @public
   * @returns {PubChemAtomFull}
   */
  static parse( atomString ) {
    const tokens = atomString.split( ' ' );
    return new PubChemAtomFull( Element.getElementBySymbol( tokens[ 0 ] ),
      parseFloat( tokens[ 1 ] ),
      parseFloat( tokens[ 2 ] ),
      parseFloat( tokens[ 3 ] ),
      parseFloat( tokens[ 4 ] ),
      parseFloat( tokens[ 5 ] ) );
  }
}

CompleteMolecule.PubChemAtomFull = PubChemAtomFull;

// Signature for bonds, where a and b are PubChemAtoms of some type
class PubChemBond extends Bond {
  /**
   * @param {PubChemAtom*} a
   * @param {PubChemAtoms*} b
   * @param {number} order
   */
  constructor( a, b, order ) {
    super( a, b );

    // @private {number}
    this.order = order;
  }

  /**
   * Returns serialized form of bond data including the bond order
   * @param {number} index - Index of bond within molecule
   *
   * @public
   * @override
   * @returns {string}
   */
  toSerial2( index ) {
    return index + '-' + this.order;
  }

  /**
   * Parser for PubChemBond
   * @param {string} bondString
   * @param {Atom} connectedAtom
   * @param {Molecule} molecule
   *
   * @public
   * @returns {PubChemBond}
   */
  static parse( bondString, connectedAtom, molecule ) {
    const tokens = bondString.split( '-' );
    const index = parseInt( tokens[ 0 ], 10 );
    const order = parseInt( tokens[ 1 ], 10 );
    return new PubChemBond( connectedAtom, molecule.atoms[ index ], order );
  }
}

CompleteMolecule.PubChemBond = PubChemBond;

buildAMolecule.register( 'CompleteMolecule', CompleteMolecule );
export default CompleteMolecule;