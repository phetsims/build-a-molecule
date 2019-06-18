// Copyright 2013-2017, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeBondNode = require( 'BUILD_A_MOLECULE/view/MoleculeBondNode' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {Kit} kit
   * @param {Molecule} molecule
   * @constructor
   */
  function MoleculeBondContainerNode( kit, molecule ) {
    Node.call( this, {} );
    var self = this;

    this.bondNodes = [];

    this.bondNodes = molecule.bonds.map( function( bond ) {
      var node = new MoleculeBondNode( bond, kit );
      self.addChild( node );
      return node;
    } );
  }

  buildAMolecule.register( 'MoleculeBondContainerNode', MoleculeBondContainerNode );

  inherit( Node, MoleculeBondContainerNode, {
    /**
     * @override
     */
    dispose: function() {
      this.bondNodes.forEach( function( bondNode ) {
        bondNode.dispose();
      } );
      Node.prototype.dispose.call( this );
    }
  } );

  return MoleculeBondContainerNode;
} );
