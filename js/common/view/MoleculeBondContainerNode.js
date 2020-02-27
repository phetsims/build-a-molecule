// Copyright 2020, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import MoleculeBondNode from './MoleculeBondNode.js';

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

buildAMolecule.register( 'MoleculeBondContainerNode', MoleculeBondContainerNode );
export default MoleculeBondContainerNode;