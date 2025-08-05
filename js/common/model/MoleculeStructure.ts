// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a general molecular structure (without position or instance information).
 *
 * Generics for the atom type significantly simplify a lot of other code that would need
 * either explicit casting or wrapper functions.
 *
 * Note: equivalency matrices are stored in row-major format (compared to the Java version)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import ChemUtils from '../../../../nitroglycerin/js/ChemUtils.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMQueryParameters from '../BAMQueryParameters.js';
import Bond from './Bond.js';
import ElementHistogram from './ElementHistogram.js';

let nextMoleculeId = 0;

class MoleculeStructure {
  // NOTE from porting: StrippedMolecule relies on the ordering of atoms, and possibly bonds for efficiency in checking
  // equivalencies. Also to make sure molecule separation isn't duplicated on the same molecule pair.
  /**
   * @param {number} [numAtoms]
   * @param {number} [numBonds]
   */
  constructor( numAtoms, numBonds ) {

    // @public {number}
    this.moleculeId = nextMoleculeId++; // used for molecule identification and ordering for optimization

    // @public {Array.<Atom>}
    this.atoms = [];

    // @public {Array.<Bond>}
    this.bonds = [];
  }

  /**
   * Add an atom to the molecule structure
   * @param {Atom} atom
   *
   * @public
   * @returns {Atom}
   */
  addAtom( atom ) {
    assert && assert( !_.includes( this.atoms, atom ), 'Cannot add an already existing atom' );
    this.atoms.push( atom ); // NOTE: don't mess with the order
    return atom;
  }

  /**
   * Add a bond to the molecule structure
   * @param {Bond} bond
   *
   * @public
   */
  addBond( bond ) {
    assert && assert( _.includes( this.atoms, bond.a ) );
    assert && assert( _.includes( this.atoms, bond.b ) );
    this.bonds.push( bond );
  }

  /**
   * Return the bonds connected to a specific atom
   * @param {Atom} atom
   *
   * @private
   * @returns {Array.<Bond>}
   */
  getBondsInvolving( atom ) {
    // Note: (performance) optimize out function allocation here?
    return _.filter( this.bonds, bond => {
      return bond.contains( atom );
    } );
  }

  /**
   * @public
   *
   * @returns {string}
   */
  getHillSystemFormulaFragment() {
    return ChemUtils.hillOrderedSymbol( this.getElementList() );
  }

  /**
   * Our best attempt at getting a general molecular naming algorithm that handles organic and non-organic compounds.
   *
   * @public
   *
   * @returns {string} Text which is the molecular formula
   */
  getGeneralFormula() {
    const containsCarbon = this.containsElement( Element.C );
    const containsHydrogen = this.containsElement( Element.H );

    const organic = containsCarbon && containsHydrogen;

    const electronegativeSortValue = element => {
      return element.electronegativity;
    };

    const alphabeticSortValue = element => {
      let value = 1000 * element.symbol.charCodeAt( 0 );
      if ( element.symbol.length > 1 ) {
        value += element.symbol.charCodeAt( 1 );
      }
      return value;
    };

    const organicSortValue = element => {
      if ( element.isCarbon() ) {
        return 0;
      }
      else if ( element.isHydrogen() ) {
        return 1;
      }
      else {
        return alphabeticSortValue( element );
      }
    };

    const sortedElements = _.sortBy(
      this.getElementList(),

      // carbon first, then hydrogen, then others alphabetically, otherwise sort by increasing electronegativity
      organic ? organicSortValue : electronegativeSortValue
    );

    // grab our formula out
    const formula = ChemUtils.createSymbolWithoutSubscripts( sortedElements );

    // return the formula, unless it is in our exception list (in which case, handle the exception case)
    return MoleculeStructure.formulaExceptions[ formula ] || formula;
  }


  /**
   * Use the above general molecular formula, but return it with HTML subscripts
   *
   * @public
   * @returns {string} Molecular formula with HTML subscripts
   */
  getGeneralFormulaFragment() {
    return ChemUtils.toSubscript( this.getGeneralFormula() );
  }

  /**
   * @param {Atom} atom
   *
   * @public
   * @returns {Atom} All neighboring atoms that are connected by bonds to the passed in atom
   */
  getNeighbors( atom ) {
    return _.map( this.getBondsInvolving( atom ), bond => {
      return bond.getOtherAtom( atom );
    } );
  }

  /**
   * @public
   *
   * @returns {number}
   */
  getApproximateMolecularWeight() {
    // sum the atomic weights
    return _.reduce( this.atoms, ( memo, atom ) => {
      return memo + atom.atomicWeight;
    }, 0 );
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  isValid() {
    return !this.hasWeirdHydrogenProperties() && !this.hasLoopsOrIsDisconnected();
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  hasWeirdHydrogenProperties() {
    // check for hydrogens that are bonded to more than 1 atom
    const length = this.atoms.length;
    for ( let i = 0; i < length; i++ ) {
      const atom = this.atoms[ i ];
      if ( atom.isHydrogen() && this.getNeighbors( atom ).length > 1 ) {
        return true;
      }
    }
    return false;
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  hasLoopsOrIsDisconnected() {
    // Note: (performance) consider HashSet, or something that has a fast contains lookup
    const visitedAtoms = [];
    const dirtyAtoms = [];

    // pull one atom out. doesn't matter which one
    dirtyAtoms.push( this.atoms[ 0 ] );

    while ( dirtyAtoms.length > 0 ) {
      // while atoms are dirty, pull one out
      const atom = dirtyAtoms.pop();

      // for each neighbor, make 'unvisited' atoms dirty and count 'visited' atoms
      let visitedCount = 0;
      this.getNeighbors( atom ).forEach( otherAtom => {
        if ( _.includes( visitedAtoms, otherAtom ) ) {
          visitedCount += 1;
        }
        else {
          dirtyAtoms.push( otherAtom );
        }
      } );

      // if a dirty atom has two visited neighbors, it means there was a loop somewhere
      if ( visitedCount > 1 ) {
        return true;
      }

      // move our atom from dirty to visited
      _.remove( dirtyAtoms, item => {
        return item === atom ? atom : null;
      } );
      visitedAtoms.push( atom );
    }

    // since it has no loops, now we check to see if we reached all atoms. if not, the molecule must not be connected
    return visitedAtoms.length !== this.atoms.length;
  }

  /**
   * Checks if this element is within the molecule structure
   * @param {Element} element
   *
   * @private
   * @returns {boolean}
   */
  containsElement( element ) {
    return _.some( this.atoms, atom => atom.element === element );
  }

  /**
   * Retrieves bonds between atoms a and b
   *
   * @param {Atom} a
   * @param {Atom} b
   * @public
   *
   * @returns {Bond}
   */
  getBond( a, b ) {
    const result = _.find( this.bonds, bond => {
      return bond.contains( a ) && bond.contains( b );
    } );
    assert && assert( result, 'Could not find bond!' );
    return result;
  }

  /**
   * @public
   * @returns {ElementHistogram}
   */
  getHistogram() {
    return new ElementHistogram( this );
  }

  /**
   * Return a copy of the molecule structure based on its bonds and atoms
   * @private
   * @returns {MoleculeStructure}
   */
  copy() {
    const result = new MoleculeStructure( this.atoms.length, this.bonds.length );
    this.atoms.forEach( result.addAtom.bind( result ) );
    this.bonds.forEach( result.addBond.bind( result ) );
    return result;
  }


  /**
   * Return a copy of the molecule structure with a specific atom removed
   * @param {Atom} atomToRemove
   *
   * @public
   * @returns {MoleculeStructure}
   */
  getCopyWithAtomRemoved( atomToRemove ) {
    const result = new MoleculeStructure( this.atoms.length - 1, 12 ); // default to 12 bonds, probably more?
    this.atoms.forEach( atom => {
      if ( atom !== atomToRemove ) {
        result.addAtom( atom );
      }
    } );
    this.bonds.forEach( bond => {
      if ( !bond.contains( atomToRemove ) ) {
        result.addBond( bond );
      }
    } );
    return result;
  }

  /**
   * Check whether the molecular structure is equivalent to another structure. Not terribly efficient, and will
   * probably fail for cyclic graphs.
   *
   *
   * @param {MoleculeStructure} other - Another molecular structure
   * @public
   *
   * @returns {boolean} True, if there is an isomorphism between the two molecular structures
   */
  isEquivalent( other ) {
    if ( this === other ) {
      // same instance
      return true;
    }
    if ( this.atoms.length !== other.atoms.length ) {
      // must have same number of atoms
      return false;
    }
    if ( !this.getHistogram().equals( other.getHistogram() ) ) {
      // different molecular formula
      return false;
    }

    // Note: (performance) sets instead of arrays here?
    const myVisited = [];
    const otherVisited = [];
    const firstAtom = this.atoms[ 0 ]; // grab the 1st atom
    const length = other.atoms.length;
    for ( let i = 0; i < length; i++ ) {
      const otherAtom = other.atoms[ i ];
      if ( this.checkEquivalency( other, myVisited, otherVisited, firstAtom, otherAtom ) ) {

        // we found an isomorphism with firstAtom => otherAtom
        return true;
      }
    }
    return false;
  }

  /**
   * @param {Atom} atom
   * @param {Array.<Atom2>} exclusionSet: A set of atoms that should not be in the return value
   * @public
   *
   * @returns {Array.<Atom>} All neighboring atoms that are connected by bonds to the passed in atom AND aren't in the exclusionSet
   */
  getNeighborsNotInSet( atom, exclusionSet ) {
    // Note: (performance) hashset with fast lookup?
    return _.filter( this.getNeighbors( atom ), otherAtom => {
      return !_.includes( exclusionSet, otherAtom );
    } );
  }

  /**
   * @param {MoleculeStructure} other
   * @param {Array.<Atom2>} myVisited
   * @param {Array.<Atom2>} otherVisited
   * @param {Atom} myAtom
   * @param {Atom} otherAtom
   * @public
   *
   * @returns {boolean}
   */
  checkEquivalency( other, myVisited, otherVisited, myAtom, otherAtom ) {
    // basically this checks whether two different sub-trees of two different molecules are 'equivalent'

    // ------- If you change this, also consider the similar code in StrippedMolecule

    if ( !myAtom.hasSameElement( otherAtom ) ) {
      // if the atoms are of different types, bail. subtrees can't possibly be equivalent
      return false;
    }
    const myUnvisitedNeighbors = this.getNeighborsNotInSet( myAtom, myVisited );
    const otherUnvisitedNeighbors = other.getNeighborsNotInSet( otherAtom, otherVisited );
    if ( myUnvisitedNeighbors.length !== otherUnvisitedNeighbors.length ) {
      return false;
    }
    if ( myUnvisitedNeighbors.length === 0 ) {
      // no more unmatched atoms
      return true;
    }
    const size = myUnvisitedNeighbors.length;

    // for now, add visiting atoms to the visited set. we NEED to revert this before returning!
    myVisited.push( myAtom );
    otherVisited.push( otherAtom );

    /*
     equivalency matrix. each entry is basically whether the subtree in the direction of the 'my' atom is
     equivalent to the subtree in the direction of the 'other' atom, for all possible my and other atoms
     */
    const equivalences = new Array( size * size ); // booleans

    // keep track of available indices for the following matrix equivalency check
    const availableIndices = [];

    // for the love of god, this matrix is NOT symmetric. It computes whether each tree branch for A is equivalent to each tree branch for B
    for ( let myIndex = 0; myIndex < size; myIndex++ ) {
      availableIndices.push( myIndex );
      for ( let otherIndex = 0; otherIndex < size; otherIndex++ ) {
        equivalences[ myIndex * size + otherIndex ] = this.checkEquivalency( other, myVisited, otherVisited, myUnvisitedNeighbors[ myIndex ], otherUnvisitedNeighbors[ otherIndex ] );
      }
    }

    // remove the atoms from the visited sets, to hold our contract
    _.remove( myVisited, item => {
      return item === myAtom ? myAtom : null;
    } );
    _.remove( otherVisited, item => {
      return item === otherAtom ? otherAtom : null;
    } );

    // return whether we can find a successful permutation matching from our equivalency matrix
    return MoleculeStructure.checkEquivalencyMatrix( equivalences, 0, availableIndices, size );
  }

  /**
   * @public
   *
   * @returns {Array.<Element>}
   */
  getElementList() {

    // return defensive copy. if that is changed, examine all usages
    return _.map( this.atoms, atom => atom.element );
  }

  /*---------------------------------------------------------------------------*
   * serialization and parsing
   *----------------------------------------------------------------------------*/

  /**
   * A serialized form of this structure. It is |-separated tokens, with the format:
   *         atom quantity
   *         bond quantity
   *         for each atom, it's symbol
   *         for each bond, two zero-indexed indices of atoms above
   * @private
   *
   * @returns [string]
   */
  toSerial() {
    let ret = `${this.atoms.length}|${this.bonds.length}`;
    this.atoms.forEach( atom => {
      ret += `|${atom.symbol}`;
    } );
    this.bonds.forEach( bond => {
      const a = this.atoms.indexOf( bond.a );
      const b = this.atoms.indexOf( bond.b );
      ret += `|${a}|${b}`;
    } );

    return ret;
  }

  /**
   * Format description, '|' is literal
   *
   * line = numAtoms|numBonds(|atomBondSpec)*
   * atomBondSpec = atomSpec(,bondSpec)*
   * atomSpec --- determined by implementation of atom. does not contain '|' or ','
   * bondSpec --- determined by implementation of bond. does not contain '|' or ','
   * @public
   *
   * @returns
   */
  toSerial2() {
    let result = '';

    // serializing and the following builder appends are not a performance bottleneck. they are left in a more readable form
    // write header: # of atoms
    result += `${this.atoms.length}|${this.bonds.length}`;
    for ( let i = 0; i < this.atoms.length; i++ ) {
      const atom = this.atoms[ i ];
      result += `|${atom.toString()}`;
      this.bonds.forEach( bond => {
        if ( bond.contains( atom ) ) {
          const otherAtom = bond.getOtherAtom( atom );
          const index = this.atoms.indexOf( otherAtom );
          if ( index < i ) {
            result += `,${bond.toSerial2( index )}`;
          }
        }
      } );
    }
    return result;
  }

  /**
   * Combines molecules together by bonding their atoms A and B
   *
   * @param {MoleculeStructure} molA   Molecule A
   * @param {MoleculeStructure} molB   Molecule B
   * @param {Atom}              a      Atom A
   * @param {Atom}              b      Atom B
   * @param {MoleculeStructure} result An empty molecule to fill
   *
   * @public
   * @returns {MoleculeStructure} A completely new molecule with all atoms in A and B, where atom A is joined to atom B
   */
  static getCombinedMoleculeFromBond( molA, molB, a, b, result ) {
    molA.atoms.forEach( atom => {
      result.addAtom( atom );
    } );
    molB.atoms.forEach( atom => {
      result.addAtom( atom );
    } );
    molA.bonds.forEach( bond => {
      result.addBond( bond );
    } );
    molB.bonds.forEach( bond => {
      result.addBond( bond );
    } );
    result.addBond( new Bond( a, b ) );
    return result;
  }

  /**
   * Split a bond in a molecule, and return the remaining molecule structure(s)
   * @param {MoleculeStructure} structure The molecule
   * @param {Bond}              bond      The bond to break
   * @param {MoleculeStructure} molA      An empty molecule for the 1st broken part
   * @param {MoleculeStructure} molB      An empty molecule for the 2nd broken part
   *
   * @public
   * @returns {Array.<MoleculeStructure>}   A list of remaining structures
   */
  static getMoleculesFromBrokenBond( structure, bond, molA, molB ) {
    // NOTE: in the future when we have loops, we can't assume that this will break a molecule into two separate molecules!

    /*---------------------------------------------------------------------------*
     * separate out which atoms belong in which remaining molecule
     *----------------------------------------------------------------------------*/

    // Note: (performance) use sets for fast insertion, removal, and querying, wherever necessary in this function
    const atomsInA = [ bond.a ];

    // atoms left after removing atoms
    const remainingAtoms = structure.atoms.slice();
    _.remove( remainingAtoms, item => {
      return item === bond.a ? bond.a : null;
    } );
    const dirtyAtoms = [ bond.a ];
    while ( dirtyAtoms.length > 0 ) {
      const atom = dirtyAtoms.pop();
      _.remove( dirtyAtoms, item => {
        return item === atom ? atom : null;
      } );

      // for all neighbors that don't use our 'bond'
      structure.bonds.forEach( otherBond => {
        if ( otherBond !== bond && otherBond.contains( atom ) ) {
          const neighbor = otherBond.getOtherAtom( atom );

          // pick out our neighbor, mark it as in 'A', and mark it as dirty so we can process its neighbors
          if ( _.includes( remainingAtoms, neighbor ) ) {
            _.remove( remainingAtoms, item => {
              return item === neighbor ? neighbor : null;
            } );
            dirtyAtoms.push( neighbor );
            atomsInA.push( neighbor );
          }
        }
      } );
    }

    /*---------------------------------------------------------------------------*
     * construct our two molecules
     *----------------------------------------------------------------------------*/

    structure.atoms.forEach( atom => {
      if ( _.includes( atomsInA, atom ) ) {
        molA.addAtom( atom );
      }
      else {
        molB.addAtom( atom );
      }
    } );

    structure.bonds.forEach( otherBond => {
      if ( otherBond !== bond ) {
        if ( _.includes( atomsInA, otherBond.a ) ) {
          assert && assert( _.includes( atomsInA, otherBond.b ) );
          molA.addBond( otherBond );
        }
        else {
          molB.addBond( otherBond );
        }
      }
    } );

    if ( BAMQueryParameters.logData ) {
      console.log( `splitting ${structure.toSerial()} into:` );
      console.log( molA.toSerial() );
      console.log( molB.toSerial() );
    }
    // return our two molecules
    return [ molA, molB ];
  }

  /**
   * Given a matrix of equivalencies, can we find a permutation of the 'other' atoms that are equivalent to
   * their respective 'my' atoms?
   *
   * NOTE: equivalency matrices are stored in row-major format (compared to the Java version)
   *
   * @param {Array.<boolean>} equivalences          Equivalence Matrix, square!, row-major (stored as one boolean array)
   * @param {number}          myIndex               Index for the row (index into our atoms). calls with myIndex + 1 to children
   * @param {Array.<number>}  otherRemainingIndices Remaining available 'other' indices
   * @param {number}          size                  This square matrix is size x size in dimensions
   *
   * @public
   * @returns {boolean} Whether a successful matching permutation was found
   */
  static checkEquivalencyMatrix( equivalences, myIndex, otherRemainingIndices, size ) {
    // var size = Math.sqrt( equivalences.length ); // it's square, so this technically works
    // Note: (performance) this should leak memory in un-fun ways, and performance complexity should be sped up

    // should be inefficient, but not too bad (computational complexity is not optimal)
    const arr = otherRemainingIndices.slice();
    const len = arr.length;
    for ( let i = 0; i < len; i++ ) { // loop over all remaining others
      const otherIndex = arr[ i ];
      if ( equivalences[ myIndex * size + otherIndex ] ) { // only follow path if it is true (equivalent)

        // remove the index from consideration for checking the following submatrix
        otherRemainingIndices.splice( otherRemainingIndices.indexOf( otherIndex ), 1 );

        const success = ( myIndex === size - 1 ) || // there are no more permutations to check
                        MoleculeStructure.checkEquivalencyMatrix( equivalences, myIndex + 1, otherRemainingIndices, size ); // or we can find a good combination of the remaining indices

        // add it back in so the calling function's contract for otherRemainingIndices is satisfied
        otherRemainingIndices.push( otherIndex );

        if ( success ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Deserialize a molecule structure
   * @param {string}            line              The data (string) to deserialize
   * @param {MoleculeGenerator} moleculeGenerator function( atomCount, bondCount ):MoleculeStructure. Creates a molecule with properties that we can fill with atoms/bonds
   * @param {AtomParser}        atomParser        function( atomString ):Atom. Creates an atom from a string representing an atom
   * @param {BondParser}        bondParser        function( bondString, connectedAtom, moleculeStructure ):Bond. Creates a bond from a string representing a bond
   *
   * @public
   * @returns {MoleculeStructure} A constructed molecule
   */
  static fromSerial2( line, moleculeGenerator, atomParser, bondParser ) {
    const tokens = line.split( '|' );
    let idx = 0;
    const atomCount = Number( tokens[ idx++ ] );
    const bondCount = Number( tokens[ idx++ ] );
    const molecule = moleculeGenerator( atomCount, bondCount );
    for ( let i = 0; i < atomCount; i++ ) {
      const atomBondString = tokens[ idx++ ];
      let subIdx = 0;
      const subTokens = atomBondString.split( ',' );
      const atom = atomParser( subTokens[ subIdx++ ] );
      molecule.addAtom( atom );
      while ( subIdx < subTokens.length ) {
        const bond = bondParser( subTokens[ subIdx++ ], atom, molecule );
        molecule.addBond( bond );
      }
    }
    return molecule;
  }

  /**
   * @param {string} line - The data (string) to deserialize
   *
   * @public
   * @returns {MoleculeStructure}
   */
  static fromSerial2Basic( line ) {
    // assumes atom base class (just symbol) and simple bonds (just connectivity)
    return MoleculeStructure.fromSerial2( line, MoleculeStructure.defaultMoleculeGenerator, MoleculeStructure.defaultAtomParser, MoleculeStructure.defaultBondParser );
  }

  /**
   * @param {number} atomCount
   * @param {number} bondCount
   *
   * @private
   * @returns {MoleculeStructure}
   */
  static defaultMoleculeGenerator( atomCount, bondCount ) {
    return new MoleculeStructure( atomCount, bondCount );
  }

  /**
   * @param {string} atomString
   *
   * @private
   * @returns {Atom}
   */
  static defaultAtomParser( atomString ) {

    // atomString is an element symbol
    return new Atom( Element.getElementBySymbol( atomString ) );
  }

  /**
   * @param {string} bondString
   * @param {Atom} connectedAtom
   * @param {MoleculeStructure} moleculeStructure
   *
   * @private
   * @returns {Bond}
   */
  static defaultBondParser( bondString, connectedAtom, moleculeStructure ) {
    // bondString is index of other atom to bond
    return new Bond( connectedAtom, moleculeStructure.atoms[ Number( bondString ) ] );
  }

  // @private {Object}
  static formulaExceptions() {
    return {
      H3N: 'NH3', // treated as if it is organic
      CHN: 'HCN'  // not considered organic

    };
  }
}

buildAMolecule.register( 'MoleculeStructure', MoleculeStructure );
export default MoleculeStructure;