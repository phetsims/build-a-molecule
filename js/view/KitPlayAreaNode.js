// Copyright 2019, University of Colorado Boulder

/**
 * Node canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Node = require( 'SCENERY/nodes/Node' );
  const MoleculeBondContainerNode = require( 'BUILD_A_MOLECULE/view/MoleculeBondContainerNode' );

  class KitPlayAreaNode extends Node {
    /**
     *
     * @param {array.<Kit>} kits
     */
    constructor( kits ) {
      super();

      // @public {Kit|null} Current kit set when atomNode is dragged
      this.currentKit = null;

      // Layers
      this.metadataLayer = new Node();
      this.atomLayer = new Node();

      // Maps for kit area elements
      this.atomNodeMap = {}; // atom.id => AtomNode
      this.bondMap = {}; // moleculeId => MoleculeBondContainerNode
      this.metadataMap = {}; // moleculeId => MoleculeControlsHBox

      // Every kit maps the visibility of its atoms in the play area to its active property. Active kits
      // have visible atoms.
      kits.forEach( kit => {
        kit.activeProperty.link( active => {
          this.atomLayer.children.forEach( atomNode => {

            // Check if the atom is in the kit's play area and toggle its visiblity.
            atomNode.visible = kit.atomsInPlayArea.contains( atomNode.atom ) && active;
          } );
          this.metadataLayer.children.forEach( metadataNode => {

            // Check if the metadata molecule is a part of the active kit molecules  and toggle its visiblity.
            metadataNode.visible = kit.molecules.includes( metadataNode.molecule ) && active;
          } );
        } );
      } );
      this.addChild( this.atomLayer );
      this.addChild( this.metadataLayer );
    }

    /**
     * Add molecule bond nodes to the kit play area and its map.
     * @param {Molecule} molecule
     *
     * @public
     */
    addMoleculeBondNodes( molecule ) {
      var moleculeBondContainerNode = new MoleculeBondContainerNode( this.currentKit, molecule );
      this.metadataLayer.addChild( moleculeBondContainerNode );
      this.bondMap[ molecule.moleculeId ] = moleculeBondContainerNode;
    }

    /**
     * Remove molecule bond nodes to the kit play area and its map.
     * @param {Molecule} molecule
     */
    removeMoleculeBondNodes( molecule ) {
      var moleculeBondContainerNode = this.bondMap[ molecule.moleculeId ];
      this.metadataLayer.removeChild( moleculeBondContainerNode );
      moleculeBondContainerNode.dispose();
      delete this.bondMap[ molecule.moleculeId ];
    }
  }
  return buildAMolecule.register( 'KitPlayAreaNode', KitPlayAreaNode );
} );