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
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMQueryParameters from '../BAMQueryParameters.js';
import Bond from './Bond.js';
import ElementHistogram from './ElementHistogram.js';

let nextMoleculeId = 0;

class MoleculeStructure {

  // Used for molecule identification and ordering for optimization
  public readonly moleculeId: number;

  // Atoms in the molecule structure
  public readonly atoms: Atom[];

  // Bonds in the molecule structure
  public readonly bonds: Bond[];

  // NOTE from porting: StrippedMolecule relies on the ordering of atoms, and possibly bonds for efficiency in checking
  // equivalencies. Also to make sure molecule separation isn't duplicated on the same molecule pair.
  public constructor( numAtoms?: number, numBonds?: number ) {
    this.moleculeId = nextMoleculeId++;
    this.atoms = [];
    this.bonds = [];
  }

  /**
   * Add an atom to the molecule structure
   */
  public addAtom( atom: Atom ): Atom {
    assert && assert( !this.atoms.includes( atom ), 'Cannot add an already existing atom' );
    this.atoms.push( atom ); // NOTE: don't mess with the order
    return atom;
  }

  /**
   * Add a bond to the molecule structure
   */
  public addBond( bond: Bond ): void {
    assert && assert( this.atoms.includes( bond.a ) );
    assert && assert( this.atoms.includes( bond.b ) );
    this.bonds.push( bond );
  }

  /**
   * Return the bonds connected to a specific atom
   */
  private getBondsInvolving( atom: Atom ): Bond[] {
    // Note: (performance) optimize out function allocation here?
    return this.bonds.filter( bond => {
      return bond.contains( atom );
    } );
  }

  public getHillSystemFormulaFragment(): string {
    return ChemUtils.hillOrderedSymbol( this.getElementList() );
  }

  /**
   * Our best attempt at getting a general molecular naming algorithm that handles organic and non-organic compounds.
   *
   *  @returns Text which is the molecular formula
   */
  public getGeneralFormula(): string {
    const containsCarbon = this.containsElement( Element.C );
    const containsHydrogen = this.containsElement( Element.H );

    const organic = containsCarbon && containsHydrogen;

    const electronegativeSortValue = ( element: Element ) => {
      return element.electronegativity;
    };

    const alphabeticSortValue = ( element: Element ) => {
      let value = 1000 * element.symbol.charCodeAt( 0 );
      if ( element.symbol.length > 1 ) {
        value += element.symbol.charCodeAt( 1 );
      }
      return value;
    };

    const organicSortValue = ( element: Element ) => {
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
    // @ts-expect-error
    return MoleculeStructure.formulaExceptions[ formula ] || formula;
  }

  /**
   * Use the above general molecular formula, but return it with HTML subscripts
   *
   * @returns Molecular formula with HTML subscripts
   */
  public getGeneralFormulaFragment(): string {
    return ChemUtils.toSubscript( this.getGeneralFormula() );
  }

  /**
   * All neighboring atoms that are connected by bonds to the passed in atom
   */
  public getNeighbors( atom: Atom ): Atom[] {
    return this.getBondsInvolving( atom ).map( bond => {
      return bond.getOtherAtom( atom );
    } );
  }

  public getApproximateMolecularWeight(): number {
    // sum the atomic weights
    return this.atoms.reduce( ( memo, atom ) => {
      return memo + atom.atomicWeight;
    }, 0 );
  }

  public isValid(): boolean {
    return !this.hasWeirdHydrogenProperties() && !this.hasLoopsOrIsDisconnected();
  }

  public hasWeirdHydrogenProperties(): boolean {
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

  public hasLoopsOrIsDisconnected(): boolean {
    // Note: (performance) consider HashSet, or something that has a fast contains lookup
    const visitedAtoms: Atom[] = [];
    const dirtyAtoms: Atom[] = [];

    // pull one atom out. doesn't matter which one
    dirtyAtoms.push( this.atoms[ 0 ] );

    while ( dirtyAtoms.length > 0 ) {
      // while atoms are dirty, pull one out
      const atom = dirtyAtoms.pop()!;

      // for each neighbor, make 'unvisited' atoms dirty and count 'visited' atoms
      let visitedCount = 0;
      this.getNeighbors( atom ).forEach( otherAtom => {
        if ( visitedAtoms.includes( otherAtom ) ) {
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
   */
  private containsElement( element: Element ): boolean {
    return this.atoms.some( atom => atom.element === element );
  }

  /**
   * Retrieves bonds between atoms a and b
   */
  public getBond( a: Atom, b: Atom ): Bond {
    const result = this.bonds.find( bond => {
      return bond.contains( a ) && bond.contains( b );
    } );
    assert && assert( result, 'Could not find bond!' );
    return result!;
  }

  public getHistogram(): ElementHistogram {
    return new ElementHistogram( this );
  }

  /**
   * Return a copy of the molecule structure based on its bonds and atoms
   */
  private copy(): MoleculeStructure {
    const result = new MoleculeStructure( this.atoms.length, this.bonds.length );
    this.atoms.forEach( result.addAtom.bind( result ) );
    this.bonds.forEach( result.addBond.bind( result ) );
    return result;
  }


  /**
   * Return a copy of the molecule structure with a specific atom removed
   */
  public getCopyWithAtomRemoved( atomToRemove: Atom ): MoleculeStructure {
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
   * @param other - Another molecular structure
   *
   * @returns True, if there is an isomorphism between the two molecular structures
   */
  public isEquivalent( other: MoleculeStructure ): boolean {
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
    const myVisited: Atom[] = [];
    const otherVisited: Atom[] = [];
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
   * @param atom
   * @param exclusionSet: A set of atoms that should not be in the return value
   *
   * @returns<Atom>} All neighboring atoms that are connected by bonds to the passed in atom AND aren't in the exclusionSet
   */
  public getNeighborsNotInSet( atom: Atom, exclusionSet: Atom[] ): Atom[] {
    // Note: (performance) hashset with fast lookup?
    return this.getNeighbors( atom ).filter( otherAtom => {
      return !exclusionSet.includes( otherAtom );
    } );
  }

  public checkEquivalency( other: MoleculeStructure, myVisited: Atom[], otherVisited: Atom[], myAtom: Atom, otherAtom: Atom ): boolean {
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
    const equivalences = new Array<boolean>( size * size );

    // keep track of available indices for the following matrix equivalency check
    const availableIndices: number[] = [];

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

  public getElementList(): Element[] {
    // return defensive copy. if that is changed, examine all usages
    return this.atoms.map( atom => atom.element );
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
   */
  private toSerial(): string {
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
   */
  public toSerial2(): string {
    let result = '';

    // serializing and the following builder appends are not a performance bottleneck. they are left in a more readable form
    // write header: # of atoms
    result += `${this.atoms.length}|${this.bonds.length}`;
    for ( let i = 0; i < this.atoms.length; i++ ) {
      const atom = this.atoms[ i ];
      result += `|${atom.toString()}`;

      // eslint-disable-next-line @typescript-eslint/no-loop-func
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
   * @param molA   Molecule A
   * @param molB   Molecule B
   * @param              a      Atom A
   * @param              b      Atom B
   * @param result An empty molecule to fill
   *
   * @returns A completely new molecule with all atoms in A and B, where atom A is joined to atom B
   */
  public static getCombinedMoleculeFromBond( molA: MoleculeStructure, molB: MoleculeStructure, a: Atom, b: Atom, result: MoleculeStructure ): MoleculeStructure {
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
   * @param structure The molecule
   * @param              bond      The bond to break
   * @param molA      An empty molecule for the 1st broken part
   * @param molB      An empty molecule for the 2nd broken part
   *
   * @returns<MoleculeStructure>}   A list of remaining structures
   */
  public static getMoleculesFromBrokenBond( structure: MoleculeStructure, bond: Bond, molA: MoleculeStructure, molB: MoleculeStructure ): MoleculeStructure[] {
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
        // @ts-expect-error
        if ( otherBond !== bond && otherBond.contains( atom ) ) {

          // @ts-expect-error
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
      if ( atomsInA.includes( atom ) ) {
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
   * @param equivalences          Equivalence Matrix, square!, row-major (stored as one boolean array)
   * @param myIndex               Index for the row (index into our atoms). calls with myIndex + 1 to children
   * @param otherRemainingIndices Remaining available 'other' indices
   * @param size                  This square matrix is size x size in dimensions
   *
   * @returns Whether a successful matching permutation was found
   */
  public static checkEquivalencyMatrix( equivalences: boolean[], myIndex: number, otherRemainingIndices: number[], size: number ): boolean {
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
   * @param            line              The data (string) to deserialize
   * @param moleculeGenerator function( atomCount, bondCount ):MoleculeStructure. Creates a molecule with properties that we can fill with atoms/bonds
   * @param        atomParser        function( atomString ):Atom. Creates an atom from a string representing an atom
   * @param        bondParser        function( bondString, connectedAtom, moleculeStructure ):Bond. Creates a bond from a string representing a bond
   *
   * @returns A constructed molecule
   */
  public static fromSerial2( line: string, moleculeGenerator: ( atomCount: number, bondCount: number ) => MoleculeStructure, atomParser: ( atomString: string ) => Atom, bondParser: ( bondString: string, connectedAtom: Atom, moleculeStructure: MoleculeStructure ) => Bond ): MoleculeStructure {
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
   * @param line - The data (string) to deserialize
   */
  public static fromSerial2Basic( line: string ): MoleculeStructure {
    // assumes atom base class (just symbol) and simple bonds (just connectivity)
    return MoleculeStructure.fromSerial2( line, MoleculeStructure.defaultMoleculeGenerator, MoleculeStructure.defaultAtomParser, MoleculeStructure.defaultBondParser );
  }

  private static defaultMoleculeGenerator( atomCount: number, bondCount: number ): MoleculeStructure {
    return new MoleculeStructure( atomCount, bondCount );
  }

  private static defaultAtomParser( atomString: string ): Atom {
    // atomString is an element symbol
    return new Atom( Element.getElementBySymbol( atomString ) );
  }

  private static defaultBondParser( bondString: string, connectedAtom: Atom, moleculeStructure: MoleculeStructure ): Bond {
    // bondString is index of other atom to bond
    return new Bond( connectedAtom, moleculeStructure.atoms[ Number( bondString ) ] );
  }

  public static formulaExceptions(): IntentionalAny {
    return {
      H3N: 'NH3', // treated as if it is organic
      CHN: 'HCN'  // not considered organic

    };
  }
}

buildAMolecule.register( 'MoleculeStructure', MoleculeStructure );
export default MoleculeStructure;