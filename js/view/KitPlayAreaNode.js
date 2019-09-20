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
  // const Property = require( 'AXON/Property' );
  // const AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );

  class KitPlayAreaNode extends Node {
    /**
     *
     * @param {array.<Kit>} kits
     */
    constructor( kits ) {
      super();

      // Mapped atomNodes to kit play area.
      this.atomNodeMap = {}; // atom.id => AtomNode

      // Layers
      this.metaDataLayer = new Node();
      this.atomLayer = new Node();

      // Every kit maps the visibility of its atoms in the play area to its active property. Active kits
      // have visible atoms.
      kits.forEach( kit => {
        kit.activeProperty.link( active => {
          this.atomLayer.children.forEach( atomNode => {
            atomNode.visible = kit.atomsInPlayArea.contains( atomNode.atom ) && active;
          } );
        } );
      } );
      this.addChild( this.atomLayer );
    }
  }

  return buildAMolecule.register( 'KitPlayAreaNode', KitPlayAreaNode );
} );