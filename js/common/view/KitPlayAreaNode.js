// Copyright 2020, University of Colorado Boulder

/**
 * REVIEW: Not a canvas.
 * Node canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import MoleculeBondContainerNode from './MoleculeBondContainerNode.js';

class KitPlayAreaNode extends Node {
  /**
   *
   * @param {array.<Kit>} kits
   */
  constructor( kits ) {
    super();

    // @public {Property.<Array[Kit]>} Kits included in this play area
    this.kitsProperty = new Property( kits );

    // @public {Kit|null} Current kit set when atomNode is dragged
    this.currentKit = null;

    // @public {Node} Layer that contains the buttons and name of the molecule
    this.metadataLayer = new Node();

    // @public {Node} Layer that contains the atoms
    this.atomLayer = new Node();

    // @private {Node} Layer that contains the cut targets used for breaking bonds
    this.moleculeBondContainerLayer = new Node();

    // @public atom.id => AtomNode
    //REVIEW: doc map types e.g. @public {Object.<atom.id:number, AtomNode}
    this.atomNodeMap = {};

    // @public moleculeId => MoleculeControlsHBox REVIEW: doc with {Object} including types
    this.metadataMap = {};

    // @private moleculeId => MoleculeBondContainerNode REVIEW: doc with {Object} including types
    this.bondMap = {};

    // Every kit maps the visibility of its atoms in the play area to its active property. Active kits
    // have visible atoms.
    this.kitsProperty.link( kits => {
      kits.forEach( kit => {
        kit.activeProperty.link( () => {
          this.atomLayer.children.forEach( atomNode => {

            // Check if the atom is in the kit's play area and toggle its visibility.
            atomNode.visible = kit.atomsInPlayArea.contains( atomNode.atom );
          } );
          this.metadataLayer.children.forEach( metadataNode => {

            // Check if the metadata molecule is a part of the active kit molecules  and toggle its visibility.
            metadataNode.visible = kit.molecules.includes( metadataNode.molecule );
          } );
        } );
      } );
    } );
    this.addChild( this.atomLayer );
    this.addChild( this.metadataLayer );
    this.addChild( this.moleculeBondContainerLayer );
  }

  /**
   * Add molecule bond nodes to the kit play area and its map.
   * @param {Molecule} molecule
   *
   * @public
   */
  addMoleculeBondNodes( molecule ) {
    const moleculeBondContainerNode = new MoleculeBondContainerNode( this.currentKit, molecule );
    this.moleculeBondContainerLayer.addChild( moleculeBondContainerNode );
    this.bondMap[ molecule.moleculeId ] = moleculeBondContainerNode;
  }

  /**
   * Remove molecule bond nodes to the kit play area and its map.
   * @param {Molecule} molecule
   *
   * @public
   */
  removeMoleculeBondNodes( molecule ) {
    const moleculeBondContainerNode = this.bondMap[ molecule.moleculeId ];
    this.moleculeBondContainerLayer.removeChild( moleculeBondContainerNode );
    moleculeBondContainerNode.dispose();
    delete this.bondMap[ molecule.moleculeId ];
  }

  /**
   * Resets the kit of play area.
   *
   * @public
   */
  resetPlayAreaKit() {
    this.currentKit.reset();
  }
}

buildAMolecule.register( 'KitPlayAreaNode', KitPlayAreaNode );
export default KitPlayAreaNode;