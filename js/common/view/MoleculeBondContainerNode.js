// Copyright 2020, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import MoleculeBondNode from './MoleculeBondNode.js';

class MoleculeBondContainerNode extends Node {
  /**
   * @param {Kit} kit
   * @param {Molecule} molecule
   */
  constructor( kit, molecule ) {
    super();

    // @private {Node}
    this.bondNodes = [];
    this.bondNodes = molecule.bonds.map( bond => {
      const node = new MoleculeBondNode( bond, kit );
      this.addChild( node );
      return node;
    } );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.bondNodes.forEach( bondNode => {
      bondNode.dispose();
    } );

    super.dispose();
  }
}

buildAMolecule.register( 'MoleculeBondContainerNode', MoleculeBondContainerNode );
export default MoleculeBondContainerNode;