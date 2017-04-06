// Copyright 2013-2015, University of Colorado Boulder

/**
 * Represents a general molecular structure (without position or instance information).
 * <p/>
 * Generics for the atom type significantly simplify a lot of other code that would need
 * either explicit casting or wrapper functions.
 *
 * Note: equivalency matrices are stored in row-major format (compared to the Java version)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Bond = require( 'BUILD_A_MOLECULE/model/Bond' );
  var ElementHistogram = require( 'BUILD_A_MOLECULE/model/ElementHistogram' );
  var ChemUtils = require( 'NITROGLYCERIN/ChemUtils' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Atom = require( 'NITROGLYCERIN/Atom' );

  var nextMoleculeId = 0;

  //REVIEW comments below indicate that ordering is important. Describe why ordering is significant.
  // NOTE from porting: StrippedMolecule relies on the ordering of atoms, and possibly bonds

  // TODO: Molecule calls with (12,12)
  function MoleculeStructure( numAtoms, numBonds ) {
    assert && assert( numAtoms !== undefined && numBonds !== undefined, 'numAtoms and numBonds required' );

    this.moleculeId = nextMoleculeId++; // used for molecule identification and ordering for optimization

    // TODO: performance: figure out a way of preallocating the arrays, and instead of pushing, just set the proper index (higher performance)
    // this.atoms = new Array( numAtoms );
    this.atoms = [];
    // this.bonds = new Array( numBonds );
    this.bonds = [];
  }
  buildAMolecule.register( 'MoleculeStructure', MoleculeStructure );

  MoleculeStructure.prototype = {
    constructor: MoleculeStructure,

    addAtom: function( atom ) {
      assert && assert( !_.includes( this.atoms, atom ), 'Cannot add an already existing atom' );
      this.atoms.push( atom ); // NOTE: don't mess with the order
      return atom;
    },

    addBond: function( a, b ) {
      var bond;

      // TODO: optimize call-sites of this to just use one way (almost assuredly creating the bond first)
      if ( a instanceof Bond ) {
        bond = a;
      }
      else {
        bond = new Bond( a, b );
      }
      assert && assert( _.includes( this.atoms, bond.a ) );
      assert && assert( _.includes( this.atoms, bond.b ) );
      this.bonds.push( bond );
    },

    getBondsInvolving: function( atom ) {
      // TODO: performance: optimize out function allocation here?
      return _.filter( this.bonds, function( bond ) { return bond.contains( atom ); } );
    },

    getHillSystemFormulaFragment: function() {
      return ChemUtils.hillOrderedSymbol( this.getElementList() );
    },

    /**
     * Our best attempt at getting a general molecular naming algorithm that handles organic and non-organic compounds.
     * <p/>
     *
     * @returns {string} Text which is the molecular formula
     */
    getGeneralFormula: function() {
      var containsCarbon = this.containsElement( Element.C );
      var containsHydrogen = this.containsElement( Element.H );

      var organic = containsCarbon && containsHydrogen;

      var sortedElements = _.sortBy( this.getElementList(), organic ? MoleculeStructure.organicSortValue         // carbon first, then hydrogen, then others alphabetically
          : MoleculeStructure.electronegativeSortValue // sort by increasing electronegativity
      );

      // grab our formula out
      var formula = ChemUtils.createSymbolWithoutSubscripts( sortedElements );

      // return the formula, unless it is in our exception list (in which case, handle the exception case)
      return MoleculeStructure.formulaExceptions[ formula ] || formula;
    },

    /**
     * Return the molecular formula, with structural information available if possible. Currently handles alcohol structure based on
     * https://secure.wikimedia.org/wikipedia/en/wiki/Alcohols#Common_Names
     *
     * @returns {string} Text which is the structural formula
     */
    getStructuralFormula: function() {
      var self = this;

      // scan for alcohols (OH bonded to C)
      var alcoholCount = 0;

      // we pull of the alcohols so we can get that molecular formula (and we append the alcohols afterwards)
      var structureWithoutAlcohols = this.getCopy();
      _.each( this.atoms, function( oxygenAtom ) {
        // only process if it is an oxygen atom
        if ( oxygenAtom.isOxygen() ) {
          var neighbors = self.getNeighbors( oxygenAtom );

          // for an alcohol subgroup (hydroxyl) we need:
          if ( neighbors.length === 2 && // 2 neighbors
               // 1st carbon, 2nd hydrogen
               ( neighbors[ 0 ].isCarbon() && neighbors[ 1 ].isHydrogen() ) ||
               // OR 2nd carbon, 1st hydrogen
               ( neighbors[ 0 ].isHydrogen() && neighbors[ 1 ].isCarbon() ) ) {
            alcoholCount++;

            // pull off the hydrogen
            structureWithoutAlcohols = structureWithoutAlcohols.getCopyWithAtomRemoved( neighbors[ neighbors[ 0 ].isHydrogen() ? 0 : 1 ] );

            // and pull off the oxygen
            structureWithoutAlcohols = structureWithoutAlcohols.getCopyWithAtomRemoved( oxygenAtom );
          }
        }
      } );

      if ( alcoholCount === 0 ) {
        // no alcohols, use the regular formula
        return this.getGeneralFormula();
      }
      else if ( alcoholCount === 1 ) {
        // one alcohol, tag it at the end
        return structureWithoutAlcohols.getGeneralFormula() + 'OH';
      }
      else {
        // more than one alcohol. use a count at the end
        return structureWithoutAlcohols.getGeneralFormula() + '(OH)' + alcoholCount;
      }
    },


    /**
     * Use the above general molecular formula, but return it with HTML subscripts
     *
     * @returns {string} Molecular formula with HTML subscripts
     */
    getGeneralFormulaFragment: function() {
      return ChemUtils.toSubscript( this.getGeneralFormula() );
    },

    /**
     * @param atom An atom
     * @return All neighboring atoms that are connected by bonds to the passed in atom
     */
    getNeighbors: function( atom ) {
      return _.map( this.getBondsInvolving( atom ), function( bond ) { return bond.getOtherAtom( atom ); } );
    },

    getApproximateMolecularWeight: function() {
      // sum the atomic weights
      return _.reduce( this.atoms, function( memo, atom ) { return memo + atom.atomicWeight; }, 0 );
    },

    isValid: function() {
      return !this.hasWeirdHydrogenProperties() && !this.hasLoopsOrIsDisconnected();
    },

    hasWeirdHydrogenProperties: function() {
      // check for hydrogens that are bonded to more than 1 atom
      var length = this.atoms.length;
      for ( var i = 0; i < length; i++ ) {
        var atom = this.atoms[ i ];
        if ( atom.isHydrogen() && this.getNeighbors( atom ).length > 1 ) {
          return true;
        }
      }
      return false;
    },

    hasLoopsOrIsDisconnected: function() {
      // TODO: performance: consider HashSet, or something that has a fast contains lookup
      var visitedAtoms = [];
      var dirtyAtoms = [];

      // pull one atom out. doesn't matter which one
      dirtyAtoms.push( this.atoms[ 0 ] );

      while ( dirtyAtoms.length > 0 ) {
        // while atoms are dirty, pull one out
        var atom = dirtyAtoms.pop();

        // for each neighbor, make 'unvisited' atoms dirty and count 'visited' atoms
        var visitedCount = 0;
        _.each( this.getNeighbors( atom ), function( otherAtom ) {
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
        // dirtyAtoms.splice( _.indexOf( dirtyAtoms, atom ), 1 );
        visitedAtoms.push( atom );
      }

      // since it has no loops, now we check to see if we reached all atoms. if not, the molecule must not be connected
      return visitedAtoms.length !== this.atoms.length;
    },

    getDebuggingDump: function() {
      var str = 'Molecule\n';
      _.each( this.atoms, function( atom ) {
        // TODO: was using hashcode, may need to create IDs for Atom instances (not Atom2, those have IDs)
        str += 'atom: ' + atom.symbol + ' ' + atom.id + '\n';
      } );
      _.each( this.bonds, function( bond ) {
        str += 'bond: ' + bond.a.id + ' - ' + bond.b.id + '\n';
      } );
      return str;
    },

    containsElement: function( element ) {
      return _.some( this.atoms, function( atom ) { return atom.element === element; } );
    },

    // between atoms a and b
    getBond: function( a, b ) {
      var result = _.find( this.bonds, function( bond ) { return bond.contains( a ) && bond.contains( b ); } );
      assert && assert( result, 'Could not find bond!' );
      return result;
    },

    // TODO: performance: cache this?
    getHistogram: function() {
      return new ElementHistogram( this );
    },

    getMoleculeId: function() {
      return this.moleculeId;
    },

    // TODO: rename copy()
    getCopy: function() {
      var result = new MoleculeStructure( this.atoms.length, this.bonds.length );
      _.each( this.atoms, result.addAtom.bind( result ) );
      _.each( this.bonds, result.addBond.bind( result ) );
      return result;
    },

    /**
     * @return Gives us a copy that is typed to just Atom, even though it uses the same atom instances (but different bond instances)
     */
    getAtomCopy: function() {
      var result = new MoleculeStructure( this.atoms.length, this.bonds.length );
      _.each( this.atoms, result.addAtom.bind( result ) );
      _.each( this.bonds, function( bond ) {
        // new bonds. TODO: document why necessary if we find out
        result.addBond( new Bond( bond.a, bond.b ) );
      } );
      return result;
    },

    getCopyWithAtomRemoved: function( atomToRemove ) {
      var result = new MoleculeStructure( this.atoms.length - 1, 12 ); // default to 12 bonds, probably more?
      _.each( this.atoms, function( atom ) {
        if ( atom !== atomToRemove ) {
          result.addAtom( atom );
        }
      } );
      _.each( this.bonds, function( bond ) {
        if ( !bond.contains( atomToRemove ) ) {
          result.addBond( bond );
        }
      } );
      return result;
    },

    /**
     * Check whether the molecular structure is equivalent to another structure. Not terribly efficient, and will
     * probably fail for cyclic graphs.
     * <p/>
     *
     * @param other Another molecular structure
     * @return True, if there is an isomorphism between the two molecular structures
     */
    isEquivalent: function( other ) {
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

      // TODO: performance: sets instead of arrays here?
      var myVisited = [];
      var otherVisited = [];
      var firstAtom = this.atoms[ 0 ]; // grab the 1st atom
      var length = other.atoms.length;
      for ( var i = 0; i < length; i++ ) {
        var otherAtom = other.atoms[ i ];
        if ( this.checkEquivalency( other, myVisited, otherVisited, firstAtom, otherAtom ) ) {
          // we found an isomorphism with firstAtom => otherAtom
          return true;
        }
      }
      return false;
    },

    /**
     * @param other Other molecule
     * @return Whether the two molecules are isomers (have the same molecular formula)
     */
    isIsomer: function( other ) {
      return this.getHillSystemFormulaFragment() === other.getHillSystemFormulaFragment();
    },

    /**
     * @param atom         An atom
     * @param exclusionSet A set of atoms that should not be in the return value
     * @returns {Array[Atom]} All neighboring atoms that are connected by bonds to the passed in atom AND aren't in the exclusionSet
     */
    getNeighborsNotInSet: function( atom, exclusionSet ) {
      // TODO: performance: hashset with fast lookup?
      return _.filter( this.getNeighbors( atom ), function( otherAtom ) { return !_.includes( exclusionSet, otherAtom ); } );
    },

    /*
     * @param {MoleculeStructure} other
     * @param {Array[Atom]}       myVisited
     * @param {Array[Atom]}       otherVisited
     * @param {Atom}              myAtom
     * @param {Atom}              otherAtom
     */
    checkEquivalency: function( other, myVisited, otherVisited, myAtom, otherAtom ) {
      // basically this checks whether two different sub-trees of two different molecules are 'equivalent'

      // ------- If you change this, also consider the similar code in StrippedMolecule

      if ( !myAtom.hasSameElement( otherAtom ) ) {
        // if the atoms are of different types, bail. subtrees can't possibly be equivalent
        return false;
      }
      var myUnvisitedNeighbors = this.getNeighborsNotInSet( myAtom, myVisited );
      var otherUnvisitedNeighbors = other.getNeighborsNotInSet( otherAtom, otherVisited );
      if ( myUnvisitedNeighbors.length !== otherUnvisitedNeighbors.length ) {
        return false;
      }
      if ( myUnvisitedNeighbors.length === 0 ) {
        // no more unmatched atoms
        return true;
      }
      var size = myUnvisitedNeighbors.length;

      // for now, add visiting atoms to the visited set. we NEED to revert this before returning!
      myVisited.push( myAtom );
      otherVisited.push( otherAtom );

      /*
       equivalency matrix. each entry is basically whether the subtree in the direction of the 'my' atom is
       equivalent to the subtree in the direction of the 'other' atom, for all possible my and other atoms
       */
      var equivalences = new Array( size * size ); // booleans

      // keep track of available indices for the following matrix equivalency check
      var availableIndices = [];

      // for the love of god, this matrix is NOT symmetric. It computes whether each tree branch for A is equivalent to each tree branch for B
      for ( var myIndex = 0; myIndex < size; myIndex++ ) {
        availableIndices.push( myIndex );
        for ( var otherIndex = 0; otherIndex < size; otherIndex++ ) {
          equivalences[ myIndex * size + otherIndex ] = this.checkEquivalency( other, myVisited, otherVisited, myUnvisitedNeighbors[ myIndex ], otherUnvisitedNeighbors[ otherIndex ] );
        }
      }

      // remove the atoms from the visited sets, to hold our contract
      myVisited.splice( myVisited.indexOf( myAtom ), 1 ); // TODO: replace with remove()
      otherVisited.splice( otherVisited.indexOf( otherAtom ), 1 ); // TODO: replace with remove()

      // return whether we can find a successful permutation matching from our equivalency matrix
      return MoleculeStructure.checkEquivalencyMatrix( equivalences, 0, availableIndices, size );
    },

    getElementList: function() {
      // return defensive copy. if that is changed, examine all usages
      return _.map( this.atoms, function( atom ) { return atom.element; } );
    },

    /*---------------------------------------------------------------------------*
     * serialization and parsing
     *----------------------------------------------------------------------------*/

    /**
     * @return A serialized form of this structure. It is |-separated tokens, with the format:
     *         atom quantity
     *         bond quantity
     *         for each atom, it's symbol
     *         for each bond, two zero-indexed indices of atoms above
     */
    toSerial: function() {
      var self = this;

      var ret = this.atoms.length + '|' + this.bonds.length;
      _.each( this.atoms, function( atom ) {
        ret += '|' + atom.symbol;
      } );
      _.each( this.bonds, function( bond ) {
        var a = self.atoms.indexOf( bond.a );
        var b = self.atoms.indexOf( bond.b );
        ret += '|' + a + '|' + b;
      } );

      return ret;
    },

    /**
     * Format description, '|' is literal
     * <p/>
     * line = numAtoms|numBonds(|atomBondSpec)*
     * atomBondSpec = atomSpec(,bondSpec)*
     * atomSpec --- determined by implementation of atom. does not contain '|' or ','
     * bondSpec --- determined by implementation of bond. does not contain '|' or ','
     *
     * @return
     */
    toSerial2: function() {
      var self = this;
      var result = '';

      // serializing and the following builder appends are not a performance bottleneck. they are left in a more readable form

      // write header: # of atoms
      result += this.atoms.length + '|' + this.bonds.length;
      for ( var i = 0; i < this.atoms.length; i++ ) {
        var atom = this.atoms[ i ];
        result += '|' + atom.toString();
        _.each( this.bonds, function( bond ) {
          if ( bond.contains( atom ) ) {
            var otherAtom = bond.getOtherAtom( atom );
            var index = self.atoms.indexOf( otherAtom );
            if ( index < i ) {
              result += ',' + bond.toSerial2( index );
            }
          }
        } );
      }
      return result;
    },

    /**
     * @return A new equivalent structure using simple atoms and bonds
     */
    toSimple: function() {
      var result = new MoleculeStructure( this.atoms.length, this.bonds.length );

      var newMap = {}; // old atom ID => new atom
      _.each( this.atoms, function( atom ) {
        var newAtom = new Atom( atom.element );
        result.addAtom( newAtom );
        newMap[ atom.id ] = newAtom;
      } );
      _.each( this.bonds, function( bond ) {
        result.addBond( new Bond( newMap[ bond.a.id ], newMap[ bond.b.id ] ) );
      } );
      return result;
    }
  };

  MoleculeStructure.formulaExceptions = {
    'H3N': 'NH3', // treated as if it is organic
    'CHN': 'HCN'  // not considered organic
  };

  MoleculeStructure.electronegativeSortValue = function( element ) {
    return element.electronegativity;
  };

  MoleculeStructure.organicSortValue = function( element ) {
    if ( element.isCarbon() ) {
      return 0;
    }
    else if ( element.isHydrogen() ) {
      return 1;
    }
    else {
      return MoleculeStructure.alphabeticSortValue( element );
    }
  };

  MoleculeStructure.alphabeticSortValue = function( element ) {
    var value = 1000 * element.symbol.charCodeAt( 0 );
    if ( element.symbol.length > 1 ) {
      value += element.symbol.charCodeAt( 1 );
    }
    return value;
  };

  /**
   * Combines molecules together by bonding their atoms A and B
   *
   * @param {MoleculeStructure} molA   Molecule A
   * @param {MoleculeStructure} molB   Molecule B
   * @param {Atom}              a      Atom A
   * @param {Atom}              b      Atom B
   * @param {MoleculeStructure} result An empty molecule to fill
   * @returns {MoleculeStructure} A completely new molecule with all atoms in A and B, where atom A is joined to atom B
   */
  MoleculeStructure.getCombinedMoleculeFromBond = function( molA, molB, a, b, result ) {
    _.each( molA.atoms, function( atom ) { result.addAtom( atom ); } );
    _.each( molB.atoms, function( atom ) { result.addAtom( atom ); } );
    _.each( molA.bonds, function( bond ) { result.addBond( bond ); } );
    _.each( molB.bonds, function( bond ) { result.addBond( bond ); } );
    result.addBond( new Bond( a, b ) );
    return result;
  };

  /**
   * Split a bond in a molecule, and return the remaining molecule structure(s)
   *
   * @param {MoleculeStructure} structure The molecule
   * @param {Bond}              bond      The bond to break
   * @param {MoleculeStructure} molA      An empty molecule for the 1st broken part
   * @param {MoleculeStructure} molB      An empty molecule for the 2nd broken part
   * @returns {Array[MoleculeStructure]}   A list of remaining structures
   */
  MoleculeStructure.getMoleculesFromBrokenBond = function( structure, bond, molA, molB ) {
    // NOTE: in the future when we have loops, we can't assume that this will break a molecule into two separate molecules!

    /*---------------------------------------------------------------------------*
     * separate out which atoms belong in which remaining molecule
     *----------------------------------------------------------------------------*/

    // TODO: performance: use sets for fast insertion, removal, and querying, wherever necessary in this function
    var atomsInA = [ bond.a ];

    // atoms left after removing atoms
    var remainingAtoms = structure.atoms.slice( 0 );
    remainingAtoms.splice( remainingAtoms.indexOf( bond.a ), 1 ); // TODO: replace with remove()
    var dirtyAtoms = [ bond.a ];
    while ( dirtyAtoms.length > 0 ) {
      var atom = dirtyAtoms.pop();
      // dirtyAtoms.splice( dirtyAtoms.indexOf( atom ), 1 ); // TODO: replace with remove()

      // for all neighbors that don't use our 'bond'
      _.each( structure.bonds, function( otherBond ) {
        if ( otherBond !== bond && otherBond.contains( atom ) ) {
          var neighbor = otherBond.getOtherAtom( atom );

          // pick out our neighbor, mark it as in 'A', and mark it as dirty so we can process its neighbors
          if ( _.includes( remainingAtoms, neighbor ) ) {
            remainingAtoms.splice( remainingAtoms.indexOf( neighbor ), 1 ); // TODO: replace with remove()
            dirtyAtoms.push( neighbor );
            atomsInA.push( neighbor );
          }
        }
      } );
    }

    /*---------------------------------------------------------------------------*
     * construct our two molecules
     *----------------------------------------------------------------------------*/

    _.each( structure.atoms, function( atom ) {
      if ( _.includes( atomsInA, atom ) ) {
        molA.addAtom( atom );
      }
      else {
        molB.addAtom( atom );
      }
    } );

    _.each( structure.bonds, function( otherBond ) {
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

    window.console && console.log && console.log( 'splitting ' + structure.toSerial() + ' into:' );
    window.console && console.log && console.log( molA.toSerial() );
    window.console && console.log && console.log( molB.toSerial() );

    // return our two molecules
    return [ molA, molB ];
  };

  /**
   * Given a matrix of equivalencies, can we find a permutation of the 'other' atoms that are equivalent to
   * their respective 'my' atoms?
   *
   * NOTE: equivalency matrices are stored in row-major format (compared to the Java version)
   *
   * @param {Array[Boolean]} equivalences          Equivalence Matrix, square!, row-major (stored as one boolean array)
   * @param {Int}            myIndex               Index for the row (index into our atoms). calls with myIndex + 1 to children
   * @param {Array[Int]}     otherRemainingIndices Remaining available 'other' indices
   * @param {Int}            size                  This square matrix is size x size in dimensions
   * @return Whether a successful matching permutation was found
   */
  MoleculeStructure.checkEquivalencyMatrix = function( equivalences, myIndex, otherRemainingIndices, size ) {
    // var size = Math.sqrt( equivalences.length ); // it's square, so this technicall works
    // TODO: performance: this should leak memory in un-fun ways, and performance complexity should be sped up

    // should be inefficient, but not too bad (computational complexity is not optimal)
    var arr = otherRemainingIndices.slice( 0 );
    var len = arr.length;
    for ( var i = 0; i < len; i++ ) { // loop over all remaining others
      var otherIndex = arr[ i ];
      if ( equivalences[ myIndex * size + otherIndex ] ) { // only follow path if it is true (equivalent)

        // remove the index from consideration for checking the following submatrix
        otherRemainingIndices.splice( otherRemainingIndices.indexOf( otherIndex ), 1 ); // TODO: replace with remove()

        var success = ( myIndex === size - 1 ) || // there are no more permutations to check
                      MoleculeStructure.checkEquivalencyMatrix( equivalences, myIndex + 1, otherRemainingIndices, size ); // or we can find a good combination of the remaining indices

        // add it back in so the calling function's contract for otherRemainingIndices is satisfied
        otherRemainingIndices.push( otherIndex );

        if ( success ) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Reads in the serialized form produced above
   *
   * @param str Serialized form of a structure
   * @return Molecule structure
   */
  MoleculeStructure.fromSerial = function( str ) {
    var tokens = str.split( '|' );
    var idx = 0;
    var atomCount = parseInt( tokens[ idx++ ], 10 );
    var bondCount = parseInt( tokens[ idx++ ], 10 );
    var structure = new MoleculeStructure( atomCount, bondCount );
    var atoms = new Array( atomCount );

    for ( var i = 0; i < atomCount; i++ ) {
      atoms[ i ] = Atom.createAtomFromSymbol( tokens[ idx++ ] );
      structure.addAtom( atoms[ i ] );
    }
    for ( i = 0; i < bondCount; i++ ) {
      structure.addBond( atoms[ parseInt( tokens[ idx++ ], 10 ) ], atoms[ parseInt( tokens[ idx++ ], 10 ) ] );
    }
    return structure;
  };

  /**
   * Deserialize a molecule structure
   *
   * @param {string}            line              The data (string) to deserialize
   * @param {MoleculeGenerator} moleculeGenerator function( atomCount, bondCount ):MoleculeStructure. Creates a molecule with properties that we can fill with atoms/bonds
   * @param {AtomParser}        atomParser        function( atomString ):Atom. Creates an atom from a string representing an atom
   * @param {BondParser}        bondParser        function( bondString, connectedAtom, moleculeStructure ):Bond. Creates a bond from a string representing a bond
   * @returns {MoleculeStructure} A constructed molecule
   */
  MoleculeStructure.fromSerial2 = function( line, moleculeGenerator, atomParser, bondParser ) {
    var tokens = line.split( '|' );
    var idx = 0;
    var atomCount = parseInt( tokens[ idx++ ], 10 );
    var bondCount = parseInt( tokens[ idx++ ], 10 );
    var molecule = moleculeGenerator( atomCount, bondCount );
    for ( var i = 0; i < atomCount; i++ ) {
      var atomBondString = tokens[ idx++ ];
      var subIdx = 0;
      var subTokens = atomBondString.split( ',' );
      var atom = atomParser( subTokens[ subIdx++ ] );
      molecule.addAtom( atom );
      while ( subIdx < subTokens.length ) {
        var bond = bondParser( subTokens[ subIdx++ ], atom, molecule );
        molecule.addBond( bond );
      }
    }
    return molecule;
  };

  MoleculeStructure.fromSerial2Basic = function( line ) {
    // assumes atom base class (just symbol) and simple bonds (just connectivity)
    return MoleculeStructure.fromSerial2( line, MoleculeStructure.defaultMoleculeGenerator, MoleculeStructure.defaultAtomParser, MoleculeStructure.defaultBondParser );
  };

  /*---------------------------------------------------------------------------*
   * parser classes and default implementations
   *----------------------------------------------------------------------------*/

  /*
   public static interface MoleculeGenerator<U extends Atom, M> {
   public M createMolecule( int atomCount, int bondCount );
   }

   public static interface AtomParser<U extends Atom> {
   public U parseAtom( String atomString );
   }

   public static interface BondParser<U extends Atom, B> {
   public B parseBond( String bondString, U connectedAtom, MoleculeStructure<U> moleculeStructure );
   }
   */

  MoleculeStructure.defaultMoleculeGenerator = function( atomCount, bondCount ) {
    return new MoleculeStructure( atomCount, bondCount );
  };

  MoleculeStructure.defaultAtomParser = function( atomString ) {
    // atomString is an element symbol
    return new Atom( Element.getElementBySymbol( atomString ) );
  };

  MoleculeStructure.defaultBondParser = function( bondString, connectedAtom, moleculeStructure ) {
    // bondString is index of other atom to bond
    return new Bond( connectedAtom, moleculeStructure.atoms[ parseInt( bondString, 10 ) ] );
  };

  return MoleculeStructure;
} );
