// Copyright 2013-2019, University of Colorado Boulder

/**
 * Represents a complete (stable) molecule with a name and structure. Includes 2d and 3d representations,
 * and can generate visuals of both types.
 *
 * It's a MoleculeStructure using PubChemAtom
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const Atom = require( 'NITROGLYCERIN/Atom' );
  const AtomNode = require( 'NITROGLYCERIN/nodes/AtomNode' );
  const Bond = require( 'BUILD_A_MOLECULE/common/model/Bond' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Element = require( 'NITROGLYCERIN/Element' );
  const MoleculeStructure = require( 'BUILD_A_MOLECULE/common/model/MoleculeStructure' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Strings = require( 'BUILD_A_MOLECULE/Strings' );
  const StringProperty = require( 'AXON/StringProperty' );

  // node type modules
  const Cl2Node = require( 'NITROGLYCERIN/nodes/Cl2Node' );
  const CO2Node = require( 'NITROGLYCERIN/nodes/CO2Node' );
  const CS2Node = require( 'NITROGLYCERIN/nodes/CS2Node' );
  const F2Node = require( 'NITROGLYCERIN/nodes/F2Node' );
  const H2Node = require( 'NITROGLYCERIN/nodes/H2Node' );
  const N2Node = require( 'NITROGLYCERIN/nodes/N2Node' );
  const NONode = require( 'NITROGLYCERIN/nodes/NONode' );
  const N2ONode = require( 'NITROGLYCERIN/nodes/N2ONode' );
  const O2Node = require( 'NITROGLYCERIN/nodes/O2Node' );
  const C2H2Node = require( 'NITROGLYCERIN/nodes/C2H2Node' );
  const C2H4Node = require( 'NITROGLYCERIN/nodes/C2H4Node' );
  const C2H5ClNode = require( 'NITROGLYCERIN/nodes/C2H5ClNode' );
  const C2H5OHNode = require( 'NITROGLYCERIN/nodes/C2H5OHNode' );
  const C2H6Node = require( 'NITROGLYCERIN/nodes/C2H6Node' );
  const CH2ONode = require( 'NITROGLYCERIN/nodes/CH2ONode' );
  const CH3OHNode = require( 'NITROGLYCERIN/nodes/CH3OHNode' );
  const CH4Node = require( 'NITROGLYCERIN/nodes/CH4Node' );
  const H2ONode = require( 'NITROGLYCERIN/nodes/H2ONode' );
  const H2SNode = require( 'NITROGLYCERIN/nodes/H2SNode' );
  const HClNode = require( 'NITROGLYCERIN/nodes/HClNode' );
  const HFNode = require( 'NITROGLYCERIN/nodes/HFNode' );
  const NH3Node = require( 'NITROGLYCERIN/nodes/NH3Node' );
  const NO2Node = require( 'NITROGLYCERIN/nodes/NO2Node' );
  const OF2Node = require( 'NITROGLYCERIN/nodes/OF2Node' );
  const P4Node = require( 'NITROGLYCERIN/nodes/P4Node' );
  const PCl3Node = require( 'NITROGLYCERIN/nodes/PCl3Node' );
  const PCl5Node = require( 'NITROGLYCERIN/nodes/PCl5Node' );
  const PF3Node = require( 'NITROGLYCERIN/nodes/PF3Node' );
  const PH3Node = require( 'NITROGLYCERIN/nodes/PH3Node' );
  const SO2Node = require( 'NITROGLYCERIN/nodes/SO2Node' );
  const SO3Node = require( 'NITROGLYCERIN/nodes/SO3Node' );

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

      // @public {Property.<string>}
      this.commonNameProperty = new StringProperty( commonName ); // as said by pubchem (or overridden)

      this.molecularFormula = molecularFormula; // as said by pubchem
      this.has2d = has2d;
      this.has3d = has3d;
    }


    /**
     * Strip out the 'molecular ' part of the string and process the result.
     *
     * @public
     */
    filterCommonName() {
      let result = this.commonNameProperty.value;
      if ( result.indexOf( 'molecular ' ) === 0 ) {
        result = result.slice( 'molecular '.length );
      }
      return CompleteMolecule.capitalize( result );
    }

    /**
     * @returns {string} The translation string key that should be used to look up a translated value
     */
    get stringKey() {
      return 'molecule.' + this.commonNameProperty.value.replace( ' ', '_' );
    }

    /**
     * @returns A translated display name if possible. This does a weird lookup so that we can only list some of the names in the translation, but can
     *         accept an even larger number of translated names in a translation file
     */
    getDisplayName() {
      // first check if we have it translated. do NOT warn on missing
      const lookupKey = this.stringKey;
      const stringLookup = Strings[ lookupKey ]; // NOTE: do NOT warn or error on missing strings, this is generally expected

      // we need to check whether it came back the same as the key due to how getString works.
      if ( stringLookup && stringLookup !== lookupKey ) {
        return stringLookup;
      }
      else {
        // if we didn't find it, pull it from our English data
        return this.commonNameProperty.value;
      }
    }

    // @returns {Node} A node that represents a 2d but quasi-3D version
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
      const node = new Node();
      const wrappers = _.sortBy( this.atoms, atom => {
        return atom.z3d;
      } );
      wrappers.forEach( atomWrapper => {
        node.addChild( new AtomNode( atomWrapper.element, {

          // custom scale for now
          x: atomWrapper.x2d * 15,
          y: atomWrapper.y2d * 15
        } ) );
      } );
      return node;
    }

    toSerial2() {
      // add in a header
      const format = ( this.has3d ? ( this.has2d ? 'full' : '3d' ) : '2d' );
      return this.commonNameProperty.value + '|' + this.molecularFormula + '|' + this.cid + '|' + format + '|' + MoleculeStructure.prototype.toSerial2.call( this );
    }
  }

  CompleteMolecule.capitalize = str => {
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
  };

  /*---------------------------------------------------------------------------*
   * serialization
   *----------------------------------------------------------------------------*/

  /**
   * Construct a molecule out of a pipe-separated line.
   *
   * WARNING: this always writes out in a "full" configuration, even if the data wasn't contained before
   *
   * @param {string} line A string that is essentially a serialized molecule
   * @returns {CompleteMolecule} that is properly constructed
   */
  CompleteMolecule.fromString = line => {
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
  };

  CompleteMolecule.fromSerial2 = line => {
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
    const atomParser = has3d ? ( has2dAnd3d ? PubChemAtomFull.parser : PubChemAtom3.parser ) : PubChemAtom2.parser;

    return MoleculeStructure.fromSerial2( line.slice( burnedLength ), ( atomCount, bondCount ) => {
      const molecule = new CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, has2d, has3d );
      molecule.cid = cid;
      return molecule;
    }, atomParser, PubChemBond.parser );
  };

  /*---------------------------------------------------------------------------*
   * atom varieties, depending on what information we have from PubChem. varieties
   * are necessary for memory size requirements so we don't store more data than
   * necessary.
   *----------------------------------------------------------------------------*/

  // Signature for Atom without 2d or 3d representation
  class PubChemAtom extends Atom {

    /**
     * @param {Element} element
     */
    constructor( element ) {
      super( element );
      this.has2d = false;
      this.has3d = false;
      this.x2d = 0;
      this.y2d = 0;
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
      this.has2d = true;
      this.has3d = false;
      this.x2d = x2d;
      this.y2d = y2d;

      // 3d representation uses only 2d data
      this.x3d = x2d;
      this.y3d = y2d;
      this.z3d = 0;
    }

    /**
     * Stringify the structure of the atom.
     * @returns {string}
     * @public
     */
    toString() {
      return Atom.prototype.toString.call( this ) + ' ' + this.x2d + ' ' + this.y2d;
    }

    /**
     * Parser for PubChemAtom2
     * @param {string} atomString
     * @returns {PubChemAtom2}
     */
    static parser( atomString ) {
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
     *
     * @param {Element} element
     * @param {number} x3d
     * @param {number} y3d
     * @param {number} z3d
     */
    constructor( element, x3d, y3d, z3d ) {
      super( element );
      this.has2d = false;
      this.has3d = true;
      this.x2d = x3d;
      this.y2d = 0;
      this.x3d = x3d;
      this.y3d = y3d;
      this.z3d = z3d;
    }

    /**
     * Stringify the structure of the atom.
     * @returns {string}
     * @public
     */
    toString() {
      return Atom.prototype.toString.call( this ) + ' ' + this.x3d + ' ' + this.y3d + ' ' + this.z3d;
    }

    /**
     * Parser for PubChemAtom3
     * @param {string} atomString
     * @returns {PubChemAtom3}
     */
    static parser( atomString ) {
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
     *
     * @param {Element} element
     * @param {number} x2d
     * @param {number} y2d
     * @param {number} x3d
     * @param {number} y3d
     * @param {number} z3d
     */
    constructor( element, x2d, y2d, x3d, y3d, z3d ) {
      super( element );
      this.has2d = true;
      this.has3d = true;
      this.x2d = x2d;
      this.y2d = y2d;
      this.x3d = x3d;
      this.y3d = y3d;
      this.z3d = z3d;
    }

    /**
     * Stringify the structure of the atom.
     * @returns {string}
     * @public
     */
    toString() {
      return Atom.prototype.toString.call( this ) + ' ' + this.x2d + ' ' + this.y2d + ' ' + this.x3d + ' ' + this.y3d + ' ' + this.z3d;
    }

    /**
     * Parser for PubChemAtomFull
     * @param atomString
     * @returns {PubChemAtomFull}
     */
    static parser( atomString ) {
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
      this.order = order;
    }

    toSerial2( index ) {
      return index + '-' + this.order;
    }

    /**
     * Parser for PubChemBond
     * @param {string} bondString
     * @param {Atom} connectedAtom
     * @param {Molecule} molecule
     * @returns {PubChemBond}
     */
    static parser( bondString, connectedAtom, molecule ) {
      const tokens = bondString.split( '-' );
      const index = parseInt( tokens[ 0 ], 10 );
      const order = parseInt( tokens[ 1 ], 10 );
      return new PubChemBond( connectedAtom, molecule.atoms[ index ], order );
    }
  }

  CompleteMolecule.PubChemBond = PubChemBond;

  return buildAMolecule.register( 'CompleteMolecule', CompleteMolecule );
} );
