// Copyright 2002-2014, University of Colorado

/**
 * Represents a complete (stable) molecule with a name and structure. Includes 2d and 3d representations,
 * and can generate visuals of both types.
 *
 * It's a MoleculeStructure using PubChemAtom
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var namespace = require( 'BAM/namespace' );
  var Strings = require( 'BAM/Strings' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Atom = require( 'NITROGLYCERIN/Atom' );
  var AtomNode = require( 'NITROGLYCERIN/nodes/AtomNode' );
  var Bond = require( 'BAM/model/Bond' );
  var MoleculeStructure = require( 'BAM/model/MoleculeStructure' );
  var nodeTypes = [
    require( 'NITROGLYCERIN/nodes/Cl2Node' ), require( 'NITROGLYCERIN/nodes/CO2Node' ), require( 'NITROGLYCERIN/nodes/CO2Node' ),
    require( 'NITROGLYCERIN/nodes/CS2Node' ), require( 'NITROGLYCERIN/nodes/F2Node' ), require( 'NITROGLYCERIN/nodes/H2Node' ),
    require( 'NITROGLYCERIN/nodes/N2Node' ), require( 'NITROGLYCERIN/nodes/NONode' ), require( 'NITROGLYCERIN/nodes/N2ONode' ),
    require( 'NITROGLYCERIN/nodes/O2Node' ), require( 'NITROGLYCERIN/nodes/C2H2Node' ), require( 'NITROGLYCERIN/nodes/C2H4Node' ),
    require( 'NITROGLYCERIN/nodes/C2H5ClNode' ), require( 'NITROGLYCERIN/nodes/C2H5OHNode' ), require( 'NITROGLYCERIN/nodes/C2H6Node' ),
    require( 'NITROGLYCERIN/nodes/CH2ONode' ), require( 'NITROGLYCERIN/nodes/CH3OHNode' ), require( 'NITROGLYCERIN/nodes/CH4Node' ),
    require( 'NITROGLYCERIN/nodes/H2ONode' ), require( 'NITROGLYCERIN/nodes/H2SNode' ), require( 'NITROGLYCERIN/nodes/HClNode' ),
    require( 'NITROGLYCERIN/nodes/HFNode' ), require( 'NITROGLYCERIN/nodes/NH3Node' ), require( 'NITROGLYCERIN/nodes/NO2Node' ),
    require( 'NITROGLYCERIN/nodes/OF2Node' ), require( 'NITROGLYCERIN/nodes/P4Node' ), require( 'NITROGLYCERIN/nodes/PCl3Node' ),
    require( 'NITROGLYCERIN/nodes/PCl5Node' ), require( 'NITROGLYCERIN/nodes/PF3Node' ), require( 'NITROGLYCERIN/nodes/PH3Node' ),
    require( 'NITROGLYCERIN/nodes/SO2Node' ), require( 'NITROGLYCERIN/nodes/SO3Node' )
  ];

  /*
   * @param {String} commonName
   * @param {String} molecularFormula
   * @param {Int} atomCount
   * @param {Int} bondCount
   * @param {Boolean} has2d
   * @param {Boolean} has3d
   */
  var CompleteMolecule = namespace.CompleteMolecule = function CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, has2d, has3d ) {
    MoleculeStructure.call( this, atomCount, bondCount );

    this._commonName = commonName; // as said by pubchem (or overridden)
    this.molecularFormula = molecularFormula; // as said by pubchem
    this.has2d = has2d;
    this.has3d = has3d;
    // this.cid = null;
  };

  inherit( MoleculeStructure, CompleteMolecule, {
    get commonName() {
      var result = this._commonName;
      if ( result.indexOf( 'molecular ' ) === 0 ) {
        result = result.slice( 'molecular '.length );
      }
      return CompleteMolecule.capitalize( result );
    },

    /**
     * @return The translation string key that should be used to look up a translated value
     */
    get stringKey() {
      return 'molecule.' + this._commonName.replace( ' ', '_' );
    },

    /**
     * @return A translated display name if possible. This does a weird lookup so that we can only list some of the names in the translation, but can
     *         accept an even larger number of translated names in a translation file
     */
    getDisplayName: function() {
      // first check if we have it translated. do NOT warn on missing
      var lookupKey = this.stringKey;
      var stringLookup = Strings[ lookupKey ]; // NOTE: do NOT warn or error on missing strings, this is generally expected

      // we need to check whether it came back the same as the key due to how getString works.
      if ( stringLookup && stringLookup !== lookupKey ) {
        return stringLookup;
      }
      else {
        // if we didn't find it, pull it from our English data
        return this.commonName;
      }
    },

    // @return A node that represents a 2d but quasi-3D version
    createPseudo3DNode: function() {
      var molecularFormula = this.molecularFormula;
      var molecularFormulaType = molecularFormula + 'Node';

      // if we can find it in the common chemistry nodes, use that
      var length = nodeTypes.length;
      for ( var i = 0; i < length; i++ ) {
        var NodeType = nodeTypes[ i ];
        if ( NodeType.name === molecularFormulaType || ( NodeType.name === 'NH3Node' && molecularFormula === 'H3N' ) ) {
          return new NodeType();
        }
      }

      // otherwise, use our 2d positions to construct a version. we get the correct back-to-front rendering
      var node = new Node();
      var wrappers = _.sortBy( this.atoms, function( atom ) {
        return atom.z3d;
      } );
      _.each( wrappers, function( atomWrapper ) {
        node.addChild( new AtomNode( atomWrapper.element, {
          // custom scale for now
          x: atomWrapper.x2d() * 15,
          y: atomWrapper.y2d() * 15
        } ) );
      } );
      return node;
    },

    toSerial2: function() {
      // add in a header
      var format = ( this.has3d ? ( this.has2d ? 'full' : '3d' ) : '2d' );
      return this.commonName + '|' + this.molecularFormula + '|' + this.cid + '|' + format + '|' + MoleculeStructure.prototype.toSerial2.call( this );
    }
  } );

  CompleteMolecule.capitalize = function( str ) {
    var characters = str.split( '' );
    var lastWasSpace = true;
    for ( var i = 0; i < characters.length; i++ ) {
      var character = characters[ i ];

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
   * @param {String} line A string that is essentially a serialized molecule
   * @return {CompleteMolecule} that is properly constructed
   */
  CompleteMolecule.fromString = function( line ) {
    var i;
    var tokens = line.split( '|' );
    var idx = 0;
    var commonName = tokens[ idx++ ];
    var molecularFormula = tokens[ idx++ ];
    var atomCount = parseInt( tokens[ idx++ ], 10 );
    var bondCount = parseInt( tokens[ idx++ ], 10 );
    var completeMolecule = new CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, true, true );

    // for each atom, read its symbol, then 2d coordinates, then 3d coordinates (total of 6 fields)
    for ( i = 0; i < atomCount; i++ ) {
      var symbol = tokens[ idx++ ];
      var x2d = parseFloat( tokens[ idx++ ] );
      var y2d = parseFloat( tokens[ idx++ ] );
      var x3d = parseFloat( tokens[ idx++ ] );
      var y3d = parseFloat( tokens[ idx++ ] );
      var z3d = parseFloat( tokens[ idx++ ] );
      var atom = new PubChemAtomFull( Element.getElementBySymbol( symbol ), x2d, y2d, x3d, y3d, z3d );
      completeMolecule.addAtom( atom );
    }

    // for each bond, read atom indices (2 of them, which are 1-indexed), and then the order of the bond (single, double, triple, etc.)
    for ( i = 0; i < bondCount; i++ ) {
      var a = parseInt( tokens[ idx++ ], 10 );
      var b = parseInt( tokens[ idx++ ], 10 );
      var order = parseInt( tokens[ idx++ ], 10 );
      var bond = new PubChemBond( completeMolecule.atoms[ a - 1 ], completeMolecule.atoms[ b - 1 ], order ); // -1 since our format is 1-based
      completeMolecule.addBond( bond );
    }

    completeMolecule.cid = parseInt( tokens[ idx++ ], 10 );

    return completeMolecule;
  };

  CompleteMolecule.fromSerial2 = function( line ) {
    /*---------------------------------------------------------------------------*
     * extract header
     *----------------------------------------------------------------------------*/
    var tokens = line.split( '|' );
    var idx = 0;
    var commonName = tokens[ idx++ ];
    var molecularFormula = tokens[ idx++ ];
    var cidString = tokens[ idx++ ];
    var cid = parseInt( cidString, 10 );
    var format = tokens[ idx++ ];

    var has2dAnd3d = format === 'full';
    var has2d = format === '2d' || has2dAnd3d;
    var has3d = format === '3d' || has2dAnd3d;
    var burnedLength = commonName.length + 1 + molecularFormula.length + 1 + cidString.length + 1 + format.length + 1;

    // select the atom parser depending on the format
    var atomParser = has3d ? ( has2dAnd3d ? PubChemAtomFull.parser : PubChemAtom3.parser ) : PubChemAtom2.parser;

    return MoleculeStructure.fromSerial2( line.slice( burnedLength ), function( atomCount, bondCount ) {
      var molecule = new CompleteMolecule( commonName, molecularFormula, atomCount, bondCount, has2d, has3d );
      molecule.cid = cid;
      return molecule;
    }, atomParser, PubChemBond.parser );
  };

  /*---------------------------------------------------------------------------*
   * atom varieties, depending on what information we have from PubChem. varieties
   * are necessary for memory size requirements so we don't store more data than
   * necessary.
   *----------------------------------------------------------------------------*/

  // TODO: performance: get rid of ES5 here?
  var PubChemAtom = CompleteMolecule.PubChemAtom = function( element ) {
    Atom.call( this, element );
  };
  inherit( Atom, PubChemAtom, {
    has2d: function() { return false; },
    has3d: function() { return false; },

    x2d: function() { return 0; },
    y2d: function() { return 0; },

    x3d: function() { return 0; },
    y3d: function() { return 0; },
    z3d: function() { return 0; }
  } );

  var PubChemAtom2 = CompleteMolecule.PubChemAtom2 = function( element, x2d, y2d ) {
    Atom.call( this, element );
    this._x2d = x2d;
    this._y2d = y2d;
  };
  inherit( Atom, PubChemAtom2, {
    has2d: function() { return true; },
    has3d: function() { return false; },

    // TODO: consider replacing with direct properties
    x2d: function() { return this._x2d; },
    y2d: function() { return this._y2d; },

    x3d: function() { return this._x2d; },
    y3d: function() { return this._y2d; },
    z3d: function() { return 0; },

    toString: function() { return Atom.prototype.toString.call( this ) + ' ' + this._x2d + ' ' + this._y2d; }
  } );
  PubChemAtom2.parser = function( atomString ) {
    var tokens = atomString.split( ' ' );
    return new PubChemAtom2( Element.getElementBySymbol( tokens[ 0 ] ),
      parseFloat( tokens[ 1 ] ),
      parseFloat( tokens[ 2 ] ) );
  };

  var PubChemAtom3 = CompleteMolecule.PubChemAtom3 = function( element, x3d, y3d, z3d ) {
    Atom.call( this, element );
    this._x3d = x3d;
    this._y3d = y3d;
    this._z3d = z3d;
  };
  inherit( Atom, PubChemAtom3, {
    has2d: function() { return false; },
    has3d: function() { return true; },

    // TODO: consider replacing with direct properties
    x2d: function() { return 0; },
    y2d: function() { return 0; },

    x3d: function() { return this._x3d; },
    y3d: function() { return this._y3d; },
    z3d: function() { return this._z3d; },

    toString: function() { return Atom.prototype.toString.call( this ) + ' ' + this._x3d + ' ' + this._y3d + ' ' + this._z3d; }
  } );
  PubChemAtom3.parser = function( atomString ) {
    var tokens = atomString.split( ' ' );
    return new PubChemAtom3( Element.getElementBySymbol( tokens[ 0 ] ),
      parseFloat( tokens[ 1 ] ),
      parseFloat( tokens[ 2 ] ),
      parseFloat( tokens[ 3 ] ) );
  };

  var PubChemAtomFull = CompleteMolecule.PubChemAtomFull = function( element, x2d, y2d, x3d, y3d, z3d ) {
    Atom.call( this, element );
    this._x2d = x2d;
    this._y2d = y2d;
    this._x3d = x3d;
    this._y3d = y3d;
    this._z3d = z3d;
  };
  inherit( Atom, PubChemAtomFull, {
    has2d: function() { return true; },
    has3d: function() { return true; },

    // TODO: consider replacing with direct properties
    x2d: function() { return this._x2d; },
    y2d: function() { return this._y2d; },

    x3d: function() { return this._x3d; },
    y3d: function() { return this._y3d; },
    z3d: function() { return this._z3d; },

    toString: function() { return Atom.prototype.toString.call( this ) + ' ' + this._x2d + ' ' + this._y2d + ' ' + this._x3d + ' ' + this._y3d + ' ' + this._z3d; }
  } );
  PubChemAtomFull.parser = function( atomString ) {
    var tokens = atomString.split( ' ' );
    return new PubChemAtomFull( Element.getElementBySymbol( tokens[ 0 ] ),
      parseFloat( tokens[ 1 ] ),
      parseFloat( tokens[ 2 ] ),
      parseFloat( tokens[ 3 ] ),
      parseFloat( tokens[ 4 ] ),
      parseFloat( tokens[ 5 ] ) );
  };

  // a,b are PubChemAtoms of some type
  var PubChemBond = CompleteMolecule.PubChemBond = function( a, b, order ) {
    Bond.call( this, a, b );
    this.order = order;
  };
  inherit( Bond, PubChemBond, {
    toSerial2: function( index ) {
      return index + '-' + this.order;
    }
  } );
  PubChemBond.parser = function( bondString, connectedAtom, molecule ) {
    var tokens = bondString.split( '-' );
    var index = parseInt( tokens[ 0 ], 10 );
    var order = parseInt( tokens[ 1 ], 10 );
    return new PubChemBond( connectedAtom, molecule.atoms[ index ], order );
  };

  return CompleteMolecule;
} );
