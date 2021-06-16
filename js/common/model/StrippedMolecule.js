// Copyright 2020-2021, University of Colorado Boulder

/**
 * Molecule structure with the hydrogens stripped out (but with the hydrogen count of an atom saved)
 *
 * This class was motivated by a need for efficient molecule comparison. It brought down the cost
 * of filtering molecules from months to minutes, along with significant reductions in the structures' file size.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import buildAMolecule from '../../buildAMolecule.js';
import MoleculeStructure from './MoleculeStructure.js';

class StrippedMolecule extends PhetioObject {
  /**
   * @param {MoleculeStructure} original
   */
  constructor( original ) {
    super();
    const bondsToAdd = [];

    // copy non-hydrogens
    const atomsToAdd = _.filter( original.atoms, atom => {
      return !atom.isHydrogen();
    } );

    // @private {Array.<number>} Array indexed the same way as stripped.atoms for efficiency. It's essentially immutable, so this works
    this.hydrogenCount = new Array( atomsToAdd.length );
    this.hydrogenCount = _.range( 0, atomsToAdd.length ).map( () => 0 );

    // copy non-hydrogen honds, and mark hydrogen bonds
    original.bonds.forEach( bond => {
      const aIsHydrogen = bond.a.isHydrogen();
      const bIsHydrogen = bond.b.isHydrogen();

      // only do something if both aren't hydrogen
      if ( !aIsHydrogen || !bIsHydrogen ) {

        if ( aIsHydrogen || bIsHydrogen ) {
          // increment hydrogen count of either A or B, if the bond contains hydrogen
          this.hydrogenCount[ atomsToAdd.indexOf( aIsHydrogen ? bond.b : bond.a ) ]++;
        }
        else {
          // bond doesn't involve hydrogen, so we add it to our stripped version
          bondsToAdd.push( bond );
        }
      }
    } );

    // @public {MoleculeStructure} Construct the stripped structure
    this.stripped = new MoleculeStructure( atomsToAdd.length, bondsToAdd.length );
    atomsToAdd.forEach( this.stripped.addAtom.bind( this.stripped ) );
    bondsToAdd.forEach( this.stripped.addBond.bind( this.stripped ) );
  }

  /**
   * @param {Atom} atom
   *
   * @private
   * @returns {number}
   */
  getIndex( atom ) {
    const index = this.stripped.atoms.indexOf( atom );
    assert && assert( index !== -1 );
    return index;
  }

  /**
   * @param {Atom2} atom
   * @private
   *
   * @returns {number}
   */
  getHydrogenCount( atom ) {
    return this.hydrogenCount[ this.getIndex( atom ) ];
  }

  /**
   * @param {StrippedMolecule} other
   * @public
   *
   * @returns {boolean}
   */
  isEquivalent( other ) { // I know this isn't used, but it might be useful in the future (comment from before the port, still kept for that reason)
    if ( this === other ) {
      // same instance
      return true;
    }

    if ( this.stripped.atoms.length === 0 && other.stripped.atoms.length === 0 ) {
      return true;
    }

    // Note: (performance) use something more like HashSet here
    const myVisited = [];
    const otherVisited = [];
    const firstAtom = this.stripped.atoms[ 0 ]; // grab the 1st atom
    const length = other.stripped.atoms.length;
    for ( let i = 0; i < length; i++ ) {
      const otherAtom = other.stripped.atoms[ i ];
      if ( this.checkEquivalency( other, myVisited, otherVisited, firstAtom, otherAtom, false ) ) {
        // we found an isomorphism with firstAtom => otherAtom
        return true;
      }
    }
    return false;
  }

  /**
   * This checks to see whether the "other" molecule (with 0 or more added hydrogens) would be
   * equivalent to this stripped molecule.
   *
   * This is useful for checking whether "other" is a valid structure by checking it against
   * stripped structures efficiently.
   *
   * @param {StrippedMolecule} other   Other (potential) submolecule
   * @public
   *
   * @returns {boolean} Whether "other" is a hydrogen submolecule of this instance
   */
  isHydrogenSubmolecule( other ) {
    if ( this === other ) {
      // same instance
      return true;
    }

    if ( this.stripped.atoms.length === 0 ) {
      // if we have no heavy atoms
      return other.stripped.atoms.length === 0;
    }
    const myVisited = [];
    const otherVisited = [];
    const firstAtom = this.stripped.atoms[ 0 ]; // grab the 1st atom
    const length = other.stripped.atoms.length;
    for ( let i = 0; i < length; i++ ) {
      const otherAtom = other.stripped.atoms[ i ];
      if ( this.checkEquivalency( other, myVisited, otherVisited, firstAtom, otherAtom, true ) ) {
        // we found an isomorphism with firstAtom => otherAtom
        return true;
      }
    }
    return false;
  }

  /**
   * @param {StrippedMolecule} other
   * @param {Array.<Atom2>} myVisited
   * @param {Array.<Atom2>} otherVisited
   * @param {Atom2} myAtom
   * @param {Atom2} otherAtom
   * @param {boolean} subCheck
   * @public
   *
   * @returns {boolean}
   */
  checkEquivalency( other, myVisited, otherVisited, myAtom, otherAtom, subCheck ) {
    // basically this checks whether two different sub-trees of two different molecules are "equivalent"

    /*
     * NOTE: this shares much overall structure (and some code) from MoleculeStructure's version, however
     * extracting out the common parts would be more effort (and lines of code) than it would be worth
     *
     * ------- If you change this, also consider the similar code in MoleculeStructure
     */

    if ( !myAtom.hasSameElement( otherAtom ) ) {
      // if the atoms are of different types, bail. subtrees can't possibly be equivalent
      return false;
    }

    if ( !subCheck ) {
      // if the atoms have different numbers of hydrogen containing them, bail
      if ( this.getHydrogenCount( myAtom ) !== other.getHydrogenCount( otherAtom ) ) {
        return false;
      }
    }
    else {
      // if the other atom has more hydrogens, bail
      if ( this.getHydrogenCount( myAtom ) < other.getHydrogenCount( otherAtom ) ) {
        return false;
      }
    }
    const myUnvisitedNeighbors = this.stripped.getNeighborsNotInSet( myAtom, myVisited );
    const otherUnvisitedNeighbors = other.stripped.getNeighborsNotInSet( otherAtom, otherVisited );
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
     equivalency matrix. each entry is basically whether the subtree in the direction of the "my" atom is
     equivalent to the subtree in the direction of the "other" atom, for all possible my and other atoms
     */
    const equivalences = new Array( size * size ); // booleans

    // keep track of available indices for the following matrix equivalency check
    const availableIndices = [];

    // for the love of god, this matrix is NOT symmetric. It computes whether each tree branch for A is equivalent to each tree branch for B
    for ( let myIndex = 0; myIndex < size; myIndex++ ) {
      availableIndices.push( myIndex );
      for ( let otherIndex = 0; otherIndex < size; otherIndex++ ) {
        equivalences[ myIndex * size + otherIndex ] = this.checkEquivalency( other, myVisited, otherVisited, myUnvisitedNeighbors[ myIndex ], otherUnvisitedNeighbors[ otherIndex ], subCheck );
      }
    }

    // remove the atoms from the visited sets, to hold our contract
    myVisited.pop();
    otherVisited.pop();

    // return whether we can find a successful permutation matching from our equivalency matrix
    return MoleculeStructure.checkEquivalencyMatrix( equivalences, 0, availableIndices, size );
  }

  /**
   * @param {Atom} atom
   *
   * @public
   * @returns {StrippedMolecule}
   */
  getCopyWithAtomRemoved( atom ) {
    const result = new StrippedMolecule( this.stripped.getCopyWithAtomRemoved( atom ) );
    result.stripped.atoms.forEach( resultAtom => {
      result.hydrogenCount[ result.getIndex( resultAtom ) ] = this.getHydrogenCount( resultAtom );
    } );
    return result;
  }
}

buildAMolecule.register( 'StrippedMolecule', StrippedMolecule );
export default StrippedMolecule;