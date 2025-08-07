// Copyright 2020-2025, University of Colorado Boulder

/**
 * Contains all of the atoms in the center of the screen. These are atoms that have been removed from a kit and not placed
 * in the collection area.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import Kit from '../model/Kit.js';
import Molecule from '../model/Molecule.js';
import AtomNode from './AtomNode.js';
import MoleculeBondContainerNode from './MoleculeBondContainerNode.js';
import MoleculeControlsHBox from './MoleculeControlsHBox.js';

class KitPlayAreaNode extends Node {

  // Kits included in this play area
  public readonly kitsProperty: Property<Kit[]>;

  // Current kit set when atomNode is dragged
  public currentKit: Kit | null;

  // Layer that contains the buttons and name of the molecule
  public readonly metadataLayer: Node;

  // Layer that contains the atoms
  public readonly atomLayer: Node;

  // Layer that contains the cut targets used for breaking bonds
  private readonly moleculeBondContainerLayer: Node;

  // Map of atom id to AtomNode
  public readonly atomNodeMap: Record<number, AtomNode>;

  // Map of molecule id to MoleculeControlsHBox
  public readonly metadataMap: Record<number, MoleculeControlsHBox>;

  // Map of molecule id to MoleculeBondContainerNode
  private readonly bondMap: Record<number, MoleculeBondContainerNode>;

  // Map of kit id to active property listener function
  private readonly kitActivePropertyListenerMap: Record<number, () => void>;

  public constructor( kits: Kit[] ) {
    super();

    this.kitsProperty = new Property( kits );
    this.currentKit = null;
    this.metadataLayer = new Node();
    this.atomLayer = new Node();
    this.moleculeBondContainerLayer = new Node();
    this.atomNodeMap = {};
    this.metadataMap = {};
    this.bondMap = {};
    this.kitActivePropertyListenerMap = {};

    // Every kit maps the visibility of its atoms in the play area to its active property. Active kits
    // have visible atoms.
    this.kitsProperty.link( ( kits: Kit[], oldKits: Kit[] | null ) => {

      // Unlink the active property listeners for old kits
      oldKits && oldKits.forEach( oldKit => {
        oldKit.activeProperty.unlink( this.kitActivePropertyListenerMap[ oldKit.id ] );
        delete this.kitActivePropertyListenerMap[ oldKit.id ];
      } );
      kits.forEach( kit => {

        // Link the active property listener to this kit
        const activePropertyListener = (): void => {
          this.atomLayer.children.forEach( atomNode => {

            // Check if the atom is in the kit's play area and toggle its visibility.
            // @ts-expect-error
            atomNode.visible = kit.atomsInPlayArea.includes( atomNode.atom );
          } );
          this.metadataLayer.children.forEach( metadataNode => {

            // Check if the metadata molecule is a part of the active kit molecules  and toggle its visibility.
            // @ts-expect-error
            metadataNode.visible = kit.molecules.includes( metadataNode.molecule );
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
   */
  public addMoleculeBondNodes( molecule: Molecule ): void {
    const moleculeBondContainerNode = new MoleculeBondContainerNode( this.currentKit!, molecule );
    this.moleculeBondContainerLayer.addChild( moleculeBondContainerNode );
    this.bondMap[ molecule.moleculeId ] = moleculeBondContainerNode;
  }

  /**
   * Remove molecule bond nodes to the kit play area and its map.
   */
  public removeMoleculeBondNodes( molecule: Molecule ): void {
    const moleculeBondContainerNode = this.bondMap[ molecule.moleculeId ];
    this.moleculeBondContainerLayer.removeChild( moleculeBondContainerNode );
    moleculeBondContainerNode.dispose();
    delete this.bondMap[ molecule.moleculeId ];
  }

  /**
   * Resets the kit of play area.
   */
  public resetPlayAreaKit(): void {
    this.currentKit?.reset();
  }
}

buildAMolecule.register( 'KitPlayAreaNode', KitPlayAreaNode );
export default KitPlayAreaNode;