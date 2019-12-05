// Copyright 2013-2019, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const MoleculeBondNode = require( 'BUILD_A_MOLECULE/view/MoleculeBondNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Text = require( 'SCENERY/nodes/Text' );

  class MoleculeBondContainerNode extends Node {
    /**
     * @param {Kit} kit
     * @param {Molecule} molecule
     * @constructor
     */
    constructor( kit, molecule ) {
      super();
      this.bondNodes = [];

      this.bondNodes = molecule.bonds.map( bond => {
        const node = new MoleculeBondNode( bond, kit );
        this.addChild( node );
        return node;
      } );
    }

    /**
     * @override
     */
    dispose() {
      this.bondNodes.forEach( bondNode => {
        bondNode.dispose();
      } );
      Node.prototype.dispose.call( this );
    }
  }

  return buildAMolecule.register( 'MoleculeBondContainerNode', MoleculeBondContainerNode );

} );
