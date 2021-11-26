// Copyright 2020-2021, University of Colorado Boulder

/**
 * Contains all of the atoms in the center of the screen. These are atoms that have been removed from a kit and not placed
 * in the collection area.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import { Node } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import MoleculeBondContainerNode from './MoleculeBondContainerNode.js';

class KitPlayAreaNode extends Node {
  /**
   * @param {Array.<Kit>} kits
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

    // @public {Object.<atom.id:number, AtomNode}
    this.atomNodeMap = {};

    // @public {Object.<moleculeId:number,MoleculeControlsHBox>}
    this.metadataMap = {};

    // @private {Object.<moleculeId, MoleculeBondContainerNode>}
    this.bondMap = {};

    // @private {Object.<kitId:number, activePropertyListener>}
    this.kitActivePropertyListenerMap = {};

    // Every kit maps the visibility of its atoms in the play area to its active property. Active kits
    // have visible atoms.
    this.kitsProperty.link( ( kits, oldKits ) => {

      // Unlink the active property listeners for old kits
      oldKits && oldKits.forEach( oldKit => {
        oldKit.activeProperty.unlink( this.kitActivePropertyListenerMap[ oldKit.id ] );
        delete this.kitActivePropertyListenerMap[ oldKit.id ];
      } );
      kits.forEach( kit => {

        // Link the active property listener to this kit
        const activePropertyListener = () => {
          this.atomLayer.children.forEach( atomNode => {

            // Check if the atom is in the kit's play area and toggle its visibility.
            atomNode.visible = kit.atomsInPlayArea.includes( atomNode.atom );
          } );
          this.metadataLayer.children.forEach( metadataNode => {

            // Check if the metadata molecule is a part of the active kit molecules  and toggle its visibility.
            metadataNode.visible = _.includes( kit.molecules, metadataNode.molecule );
          } );
        };
        kit.activeProperty.link( activePropertyListener );
        this.kitActivePropertyListenerMap[ kit.id ] = activePropertyListener;
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