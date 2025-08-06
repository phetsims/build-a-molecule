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
        ( oldKit as any ).activeProperty.unlink( this.kitActivePropertyListenerMap[ ( oldKit as any ).id ] ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Kit is converted, see https://github.com/phetsims/build-a-molecule/issues/245
        delete this.kitActivePropertyListenerMap[ ( oldKit as any ).id ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Kit is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      } );
      kits.forEach( kit => {

        // Link the active property listener to this kit
        const activePropertyListener = (): void => {
          this.atomLayer.children.forEach( atomNode => {

            // Check if the atom is in the kit's play area and toggle its visibility.
            ( atomNode as any ).visible = ( kit as any ).atomsInPlayArea.includes( ( atomNode as any ).atom ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Kit and AtomNode are converted, see https://github.com/phetsims/build-a-molecule/issues/245
          } );
          this.metadataLayer.children.forEach( metadataNode => {

            // Check if the metadata molecule is a part of the active kit molecules  and toggle its visibility.
            ( metadataNode as any ).visible = ( kit as any ).molecules.includes( ( metadataNode as any ).molecule ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Kit and MoleculeControlsHBox are converted, see https://github.com/phetsims/build-a-molecule/issues/245
          } );
        };
        ( kit as any ).activeProperty.link( activePropertyListener ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Kit is converted, see https://github.com/phetsims/build-a-molecule/issues/245
        this.kitActivePropertyListenerMap[ ( kit as any ).id ] = activePropertyListener; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Kit is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
    this.bondMap[ ( molecule as any ).moleculeId ] = moleculeBondContainerNode; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Molecule is converted, see https://github.com/phetsims/build-a-molecule/issues/245
  }

  /**
   * Remove molecule bond nodes to the kit play area and its map.
   */
  public removeMoleculeBondNodes( molecule: Molecule ): void {
    const moleculeBondContainerNode = this.bondMap[ ( molecule as any ).moleculeId ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Molecule is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    this.moleculeBondContainerLayer.removeChild( moleculeBondContainerNode );
    moleculeBondContainerNode.dispose();
    delete this.bondMap[ ( molecule as any ).moleculeId ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Molecule is converted, see https://github.com/phetsims/build-a-molecule/issues/245
  }

  /**
   * Resets the kit of play area.
   */
  public resetPlayAreaKit(): void {
    ( this.currentKit as any )?.reset(); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Kit is converted, see https://github.com/phetsims/build-a-molecule/issues/245
  }
}

buildAMolecule.register( 'KitPlayAreaNode', KitPlayAreaNode );
export default KitPlayAreaNode;