// Copyright 2020-2025, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import Kit from '../model/Kit.js';
import Molecule from '../model/Molecule.js';
import MoleculeBondNode from './MoleculeBondNode.js';

export default class MoleculeBondContainerNode extends Node {

  private readonly bondNodes: MoleculeBondNode[];

  public constructor( kit: Kit, molecule: Molecule ) {
    super();

    // @ts-expect-error
    this.bondNodes = molecule.bonds.map( ( bond: any ) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Bond is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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