// Copyright 2013-2015, University of Colorado Boulder

/**
 * Molecule structure with the hydrogens stripped out (but with the hydrogen count of an atom saved)
 * <p/>
 * This class was motivated by a need for efficient molecule comparison. It brought down the cost
 * of filtering molecules from months to minutes, along with significant reductions in the structures' file size.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Atom = require( 'NITROGLYCERIN/Atom' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Bond = require( 'BUILD_A_MOLECULE/model/Bond' );
  var MoleculeStructure = require( 'BUILD_A_MOLECULE/model/MoleculeStructure' );

  // @param {MoleculeStructure} original
  function StrippedMolecule( original ) {
    var self = this;

    // var atomsToAdd = [];
    var bondsToAdd = [];

    // copy non-hydrogens
    var atomsToAdd = _.filter( original.atoms, function( atom ) { return !atom.isHydrogen(); } );

    /**
     * Array indexed the same way as stripped.atoms for efficiency. It's essentially immutable, so this works
     */
    this.hydrogenCount = new Array( atomsToAdd.length );
    for ( var i = 0; i < this.hydrogenCount.length; i++ ) {
      this.hydrogenCount[ i ] = 0;
    }

    // copy non-hydrogen honds, and mark hydrogen bonds
    _.each( original.bonds, function( bond ) {
      var aIsHydrogen = bond.a.isHydrogen();
      var bIsHydrogen = bond.b.isHydrogen();

      // only do something if both aren't hydrogen
      if ( !aIsHydrogen || !bIsHydrogen ) {

        if ( aIsHydrogen || bIsHydrogen ) {
          // increment hydrogen count of either A or B, if the bond contains hydrogen
          self.hydrogenCount[ atomsToAdd.indexOf( aIsHydrogen ? bond.b : bond.a ) ]++;
        }
        else {
          // bond doesn't involve hydrogen, so we add it to our stripped version
          bondsToAdd.push( bond );
        }
      }
    } );

    // construct the stripped structure
    this.stripped = new MoleculeStructure( atomsToAdd.length, bondsToAdd.length );
    _.each( atomsToAdd, this.stripped.addAtom.bind( this.stripped ) );
    _.each( bondsToAdd, this.stripped.addBond.bind( this.stripped ) );
  }
  buildAMolecule.register( 'StrippedMolecule', StrippedMolecule );

  StrippedMolecule.prototype = {
    constructor: StrippedMolecule,

    /**
     * @return MoleculeStructure, where the hydrogen atoms are not the original hydrogen atoms
     */
    toMoleculeStructure: function() {
      var self = this;
      var result = this.stripped.getAtomCopy();
      _.each( this.stripped.atoms, function( atom ) {
        var count = self.getHydrogenCount( atom );
        for ( var i = 0; i < count; i++ ) {
          var hydrogenAtom = new Atom( Element.H );
          result.addAtom( hydrogenAtom );
          result.addBond( new Bond( atom, hydrogenAtom ) );
        }
      } );
      return result;
    },

    getIndex: function( atom ) {
      var index = this.stripped.atoms.indexOf( atom );
      assert && assert( index !== -1 );
      return index;
    },

    getHydrogenCount: function( atom ) {
      return this.hydrogenCount[ this.getIndex( atom ) ];
    },

    // @param {StrippedMolecule} other
    isEquivalent: function( other ) { // I know this isn't used, but it might be useful in the future (comment from before the port, still kept for that reason)
      var self = this;
      if ( this === other ) {
        // same instance
        return true;
      }

      if ( this.stripped.atoms.length === 0 && other.stripped.atoms.length === 0 ) {
        return true;
      }

      // TODO: performance: use something more like HashSet here
      var myVisited = [];
      var otherVisited = [];
      var firstAtom = this.stripped.atoms[ 0 ]; // grab the 1st atom
      var length = other.stripped.atoms.length;
      for ( var i = 0; i < length; i++ ) {
        var otherAtom = other.stripped.atoms[ i ];
        if ( self.checkEquivalency( other, myVisited, otherVisited, firstAtom, otherAtom, false ) ) {
          // we found an isomorphism with firstAtom => otherAtom
          return true;
        }
      }
      return false;
    },

    /**
     * This checks to see whether the "other" molecule (with 0 or more added hydrogens) would be
     * equivalent to this stripped molecule.
     * <p/>
     * This is useful for checking whether "other" is a valid structure by checking it against
     * stripped structures efficiently.
     *
     * @param {StrippedMolecule} other   Other (potential) submolecule
     * @param <AtomU> Other atom type.
     * @return Whether "other" is a hydrogen submolecule of this instance
     */
    isHydrogenSubmolecule: function( other ) {
      var self = this;
      if ( this === other ) {
        // same instance
        return true;
      }

      if ( this.stripped.atoms.length === 0 ) {
        // if we have no heavy atoms
        return other.stripped.atoms.length === 0;
      }
      var myVisited = [];
      var otherVisited = [];
      var firstAtom = this.stripped.atoms[ 0 ]; // grab the 1st atom
      var length = other.stripped.atoms.length;
      for ( var i = 0; i < length; i++ ) {
        var otherAtom = other.stripped.atoms[ i ];
        if ( self.checkEquivalency( other, myVisited, otherVisited, firstAtom, otherAtom, true ) ) {
          // we found an isomorphism with firstAtom => otherAtom
          return true;
        }
      }
      return false;
    },

    /*
     * @param {StrippedMolecule} other
     * @param {Array[Atom]}      myVisited
     * @param {Array[Atom]}      otherVisited
     * @param {Atom}             myAtom
     * @param {Atom}             otherAtom
     * @param {boolean}          subCheck
     */
    checkEquivalency: function( other, myVisited, otherVisited, myAtom, otherAtom, subCheck ) {
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
      var myUnvisitedNeighbors = this.stripped.getNeighborsNotInSet( myAtom, myVisited );
      var otherUnvisitedNeighbors = other.stripped.getNeighborsNotInSet( otherAtom, otherVisited );
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
       equivalency matrix. each entry is basically whether the subtree in the direction of the "my" atom is
       equivalent to the subtree in the direction of the "other" atom, for all possible my and other atoms
       */
      var equivalences = new Array( size * size ); // booleans

      // keep track of available indices for the following matrix equivalency check
      var availableIndices = [];

      // for the love of god, this matrix is NOT symmetric. It computes whether each tree branch for A is equivalent to each tree branch for B
      for ( var myIndex = 0; myIndex < size; myIndex++ ) {
        availableIndices.push( myIndex );
        for ( var otherIndex = 0; otherIndex < size; otherIndex++ ) {
          equivalences[ myIndex * size + otherIndex ] = this.checkEquivalency( other, myVisited, otherVisited, myUnvisitedNeighbors[ myIndex ], otherUnvisitedNeighbors[ otherIndex ], subCheck );
        }
      }

      // remove the atoms from the visited sets, to hold our contract
      myVisited.splice( myVisited.indexOf( myAtom ), 1 ); // TODO: replace with remove()
      otherVisited.splice( otherVisited.indexOf( otherAtom ), 1 ); // TODO: replace with remove()

      // return whether we can find a successful permutation matching from our equivalency matrix
      return MoleculeStructure.checkEquivalencyMatrix( equivalences, 0, availableIndices, size );
    },

    getCopyWithAtomRemoved: function( atom ) {
      var self = this;
      var result = new StrippedMolecule( this.stripped.getCopyWithAtomRemoved( atom ) );
      _.each( result.stripped.atoms, function( resultAtom ) {
        result.hydrogenCount[ result.getIndex( resultAtom ) ] = self.getHydrogenCount( resultAtom );
      } );
      return result;
    }
  };

  return StrippedMolecule;
} );
