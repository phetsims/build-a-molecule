// Copyright 2013-2015, University of Colorado Boulder

/**
 * Represents the lewis-dot directional connections between atoms. Holds information for all atoms within a particular kit, but it is generic
 * enough to handle other situations
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Direction = require( 'BUILD_A_MOLECULE/model/Direction' );
  var Vector2 = require( 'DOT/Vector2' );

  function LewisDotModel() {
    // maps atom ID => LewisDotAtom
    this.atomMap = {};
  }
  buildAMolecule.register( 'LewisDotModel', LewisDotModel );

  function LewisDotAtom( atom ) {
    var self = this;

    this.atom = atom;
    this.connections = {}; // maps Direction ID => LewisDotAtom
    _.each( Direction.values, function( direction ) {
      self.connections[ direction.id ] = null; // nothing in this direction
    } );
  }
  buildAMolecule.register( 'LewisDotAtom', LewisDotAtom );

  LewisDotAtom.prototype = {
    constructor: LewisDotAtom,

    hasConnection: function( direction ) {
      return this.connections[ direction.id ] !== null;
    },

    getLewisDotAtom: function( direction ) {
      return this.connections[ direction.id ];
    },

    connect: function( direction, lewisDotAtom ) {
      this.connections[ direction.id ] = lewisDotAtom;
    },

    disconnect: function( direction ) {
      this.connections[ direction.id ] = null;
    }
  };

  LewisDotModel.prototype = {
    constructor: LewisDotModel,

    addAtom: function( atom ) {
      this.atomMap[ atom.id ] = new LewisDotAtom( atom );
    },

    breakBondsOfAtom: function( atom ) {
      var self = this;

      var dotAtom = this.getLewisDotAtom( atom );

      // disconnect all of its bonds
      _.each( Direction.values, function( direction ) {
        if ( dotAtom.hasConnection( direction ) ) {
          var otherDotAtom = dotAtom.getLewisDotAtom( direction );
          self.breakBond( dotAtom.atom, otherDotAtom.atom );
        }
      } );
    },

    /**
     * Break the bond between A and B (if it exists)
     *
     * @param {Atom} a A
     * @param {Atom} b B
     */
    breakBond: function( a, b ) {
      var dotA = this.getLewisDotAtom( a );
      var dotB = this.getLewisDotAtom( b );
      var direction = this.getBondDirection( a, b );
      dotA.disconnect( direction );
      dotB.disconnect( direction.opposite );
    },

    /**
     * Bond together atoms A and B.
     *
     * @param {Atom}      a       A
     * @param {Direction} dirAtoB The direction from A to B. So if A is to the left, B is on the right, the direction would be East
     * @param {Atom}      b       B
     */
    bond: function( a, dirAtoB, b ) {
      var dotA = this.getLewisDotAtom( a );
      var dotB = this.getLewisDotAtom( b );
      dotA.connect( dirAtoB, dotB );
      dotB.connect( dirAtoB.opposite, dotA );
    },

    /**
     * @param {Atom} atom An atom
     * @returns {Array[Direction]} All of the directions that are open (not bonded to another) on the atom
     */
    getOpenDirections: function( atom ) {
      var result = [];
      var dotAtom = this.getLewisDotAtom( atom );
      _.each( Direction.values, function( direction ) {
        if ( !dotAtom.hasConnection( direction ) ) {
          result.push( direction );
        }
      } );
      return result;
    },

    /**
     * @param {Atom} a A
     * @param {Atom} b B
     * @returns {Direction} The bond direction from A to B. If it doesn't exist, an exception is thrown
     */
    getBondDirection: function( a, b ) {
      var dotA = this.getLewisDotAtom( a );
      for ( var i = 0; i < 4; i++ ) {
        var direction = Direction.values[ i ];
        if ( dotA.hasConnection( direction ) && dotA.getLewisDotAtom( direction ).atom === b ) {
          return direction;
        }
      }
      throw new Error( 'Bond not found' );
    },

    /**
     * Decide whether this bonding would cause any layout issues. Does NOT detect loops, and will
     * fail if given molecules with loops.
     *
     * @param {Atom}      a         A
     * @param {Direction} direction Direction from A to B
     * @param {Atom}      b         B
     * @returns {boolean} Whether this bond is considered acceptable
     */
    willAllowBond: function( a, direction, b ) {

      /*---------------------------------------------------------------------------*
       * We need to verify that if we bind these two together that no overlaps occur.
       * This can be done by creating a coordinate system where atom A is our origin,
       * and verifying that no atoms share the same coordinates if they are not both
       * hydrogen.
       *----------------------------------------------------------------------------*/

      var coordinateMap = {};

      // map the molecule on the A side, from the origin
      var success = this.mapMolecule( Vector2.ZERO, a, null, coordinateMap );

      // map the molecule on the B side, with the offset from direction
      success = success && this.mapMolecule( direction.vector, b, null, coordinateMap );

      // we would have false if a conflict was found
      return success;
    },

    /*---------------------------------------------------------------------------*
     * implementation details
     *----------------------------------------------------------------------------*/

    /**
     * Add "atom" to our coordinate map, and all of its neighbors EXCEPT for excludedAtom.
     * This allows mapping a molecule without loops quite easily
     *
     * @param {Vector2}             coordinates   Coordinates of "atom"
     * @param {Atom}                atom          Atom to add
     * @param {Atom}                excludedAtom  Atom not to
     * @param {Map x+','+y => Atom} coordinateMap Coordinate map to which we add the atoms to
     * @returns {boolean} Success. Will return false if any heavy atom overlaps on another atom. If it returns false, the coordinate map may be inconsistent
     */
    mapMolecule: function( coordinates, atom, excludedAtom, coordinateMap ) {
      var self = this;

      var dotAtom = this.getLewisDotAtom( atom );

      // for sanity and equality (negative zero equals zero, so don't worry about that)
      var point = new Vector2( Math.round( coordinates.x ), Math.round( coordinates.y ) );

      var idx = point.x + ',' + point.y;

      // if we have seen a different atom in this position
      if ( coordinateMap[ idx ] ) {
        // if at least one isn't hydrogen, fail out
        if ( !atom.isHydrogen() || !coordinateMap[ idx ].isHydrogen() ) {
          return false;
        }
        // here, they both must be hydrogen, so we don't need to worry about adding it in
      }
      else {
        coordinateMap[ idx ] = atom;
      }

      var success = true;

      // check all directions so we can explore all other atoms that need to be mapped
      for ( var i = 0; i < 4; i++ ) {
        var direction = Direction.values[ i ];
        if ( dotAtom.hasConnection( direction ) ) {
          var otherDot = dotAtom.getLewisDotAtom( direction );

          // if this atom isn't excluded
          if ( otherDot.atom !== excludedAtom ) {
            success = self.mapMolecule( coordinates.plus( direction.vector ), otherDot.atom, atom, coordinateMap );

            // if we had a failure mapping that one, bail out
            if ( !success ) {
              return false;
            }
          }
        }
      }

      // everything worked
      return success;
    },

    getLewisDotAtom: function( atom ) {
      return this.atomMap[ atom.id ];
    }
  };

  return LewisDotModel;
} );
