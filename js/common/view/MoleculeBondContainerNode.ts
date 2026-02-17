// Copyright 2020-2025, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import Bond from '../model/Bond.js';
import Kit from '../model/Kit.js';
import Molecule from '../model/Molecule.js';
import MoleculeBondNode from './MoleculeBondNode.js';

export default class MoleculeBondContainerNode extends Node {

  private readonly bondNodes: MoleculeBondNode[];

  public constructor( kit: Kit, molecule: Molecule ) {
    super();

    this.bondNodes = molecule.bonds.map( ( bond: Bond ) => {
      return new MoleculeBondNode( bond, kit );
    } );
    this.children = this.bondNodes;
  }

  public override dispose(): void {
    this.bondNodes.forEach( bondNode => {
      bondNode.dispose();
    } );

    super.dispose();
  }
}

buildAMolecule.register( 'MoleculeBondContainerNode', MoleculeBondContainerNode );