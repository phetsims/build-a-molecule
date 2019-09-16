// Copyright 2013-2019, University of Colorado Boulder

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
     * @param {kit} kit
     */
    constructor( kit ) {
      super();

      // Mapped atomNodes to kit play area.
      this.atomNodeMap = {}; // atom.id => AtomNode

      // Layers
      this.metaDataLayer = new Node();
      this.atomLayer = new Node();

      kit.activeProperty.lazyLink( active => {
        this.atomLayer.children.forEach( atomNode => {
          atomNode.visible = !active;
        } );
      } );


      // Refill the play area node with the molecule atoms from this kit
      // kit.molecules.forEach( molecule => {

      // let molecule = kit.getMolecule( atom );
      // if ( molecule ){
      // molecule.atoms.forEach( moleculeAtom => {
      //   if ( moleculeAtom !== atom ) {
      //     moleculeAtom.positionProperty.value = moleculeAtom.positionProperty.value.plus( delta );
      //     this.atomLayer.addChild( new AtomNode( moleculeAtom ) );
      //   }
      // } );
      // }

      // this.atomLayer.addChild( molecule );
      // } );
      this.addChild( this.atomLayer );

    }

    // dispose() {
    //   super.dispose();
    // }
  }

  return buildAMolecule.register( 'KitPlayAreaNode', KitPlayAreaNode );
} );