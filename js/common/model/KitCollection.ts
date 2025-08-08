// Copyright 2020-2025, University of Colorado Boulder

/**
 * Represents a main running model for the 1st two tabs. Contains a collection of kits and boxes. Kits are responsible
 * for their buckets and atoms.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMQueryParameters from '../BAMQueryParameters.js';
import Atom2 from './Atom2.js';
import CollectionBox from './CollectionBox.js';
import Kit from './Kit.js';

let currentId = 0;

type KitCollectionSelfOptions = {
  enableCues?: boolean; // Determines if the arrow cues should be shown
};

export type KitCollectionOptions = KitCollectionSelfOptions;

class KitCollection {

  public readonly id: number;

  public readonly kits: Kit[];

  public collectionBoxes: CollectionBox[];

  // Only show a blinking highlight once
  private hasBlinkedOnce: boolean;

  // this will remain false if we have no collection boxes
  public allCollectionBoxesFilledProperty: BooleanProperty;

  public currentKitProperty: Property<Kit | null>;

  public constructor( providedOptions?: KitCollectionOptions ) {
    const options = optionize<KitCollectionOptions, KitCollectionSelfOptions>()( {
      enableCues: false
    }, providedOptions );

    this.id = currentId++;

    this.kits = [];

    this.collectionBoxes = [];

    this.hasBlinkedOnce = false;

    this.allCollectionBoxesFilledProperty = new BooleanProperty( false );

    this.currentKitProperty = new Property<Kit | null>( null );

    // Swap the current kit and update the visibility of the cue nodes in the collection boxes
    this.currentKitProperty.lazyLink( ( newKit, oldKit ) => {
      if ( oldKit ) {
        oldKit.activeProperty.value = false;
      }
      if ( newKit ) {
        newKit.activeProperty.value = true;

        // Determine the visibility of the arrow cues when switching to new kit
        this.collectionBoxes.forEach( box => {
          box.cueVisibilityProperty.reset();
          newKit.molecules.forEach( molecule => {

            // Only handle visibility for the first collection
            if ( molecule && options.enableCues && box.willAllowMoleculeDrop( molecule ) ) {
              box.cueVisibilityProperty.value = true;
            }
          } );
        } );
      }
    } );

  }

  /**
   * Add a kit to this kit collection. Here is where we add listeners to the added kit
   */
  public addKit( kit: Kit, options?: { triggerCue?: boolean } | number ): void {
    // Handle case where this is called via forEach which passes (item, index, array)
    let kitOptions: { triggerCue?: boolean } | undefined;
    if ( typeof options === 'number' ) {
      kitOptions = undefined;
    }
    else {
      kitOptions = options;
    }
    this.kits.push( kit );
    const dropListener = ( atom: Atom2 ) => {

      // don't drop an atom from the kit to the collection box directly
      if ( kit.isAtomInPlay( atom ) ) {
        const molecule = kit.getMolecule( atom )!;

        // check to see if we are trying to drop it in a collection box.
        const numBoxes = this.collectionBoxes.length;
        for ( let i = 0; i < numBoxes; i++ ) {
          const box = this.collectionBoxes[ i ];

          // permissive, so that if the box bounds and molecule bounds intersect, we call it a 'hit'
          if ( box.dropBoundsProperty.value.intersectsBounds( molecule.positionBounds ) ) {

            // if our box takes this type of molecule
            if ( box.willAllowMoleculeDrop( molecule ) ) {
              kit.moleculePutInCollectionBox( molecule, box );
              break;
            }
          }
        }
      }
    };

    // Add dropped listeners for each atom in this kit
    kit.atoms.forEach( atom => {
      atom.droppedByUserEmitter.addListener( dropListener );
    } );


    // Cycle through molecules in the play area and check if the arrow cue needs to be updated
    kit.addedMoleculeEmitter.addListener( () => {
      this.collectionBoxes.forEach( box => {
        kit.molecules.forEach( molecule => {

          // Added molecules should trigger an arrow cue if it can be dropped in a collection box
          if ( box.willAllowMoleculeDrop( molecule ) && ( kitOptions && kitOptions.triggerCue ) ) {
            box.cueVisibilityProperty.value = true;

            // Trigger box blinking only if it has not blinked already
            if ( !this.hasBlinkedOnce ) {
              box.acceptedMoleculeCreationEmitter.emit( molecule );
              this.hasBlinkedOnce = true;
            }
          }
        } );

        // All boxes should not show an arrow cue if the box is full
        if ( box.isFull() ) {
          box.cueVisibilityProperty.value = false;
        }
      } );
    } );

    // When a molecule is removed we need to check all of the molecules remaining to determine if they could
    // possibly go in one of the collection oxes.
    kit.removedMoleculeEmitter.addListener( molecule => {
      this.collectionBoxes.forEach( box => {

        // Hide arrow cues for the removed molecule. This works independently from other molecules that are present
        // in the kit play area.
        if ( box.willAllowMoleculeDrop( molecule ) && molecule && ( kitOptions && kitOptions.triggerCue ) ) {
          box.cueVisibilityProperty.value = false;
        }

        // Cycle through all the remaining molecules and trigger the arrow cue if the molecule exists in the
        // kit play area.
        kit.molecules.forEach( remainingMolecule => {
          if ( box.willAllowMoleculeDrop( remainingMolecule ) && molecule && ( kitOptions && kitOptions.triggerCue ) ) {
            box.cueVisibilityProperty.value = box.willAllowMoleculeDrop( remainingMolecule ) && remainingMolecule && ( kitOptions && kitOptions.triggerCue );
          }

          // Last sanity check to make sure a full box doesn't have an arrow cue shown.
          if ( box.isFull() ) {
            box.cueVisibilityProperty.value = false;
          }
        } );
      } );
    } );
  }

  /**
   * Add a collection box
   */
  public addCollectionBox( box: CollectionBox ): void {
    this.collectionBoxes.push( box );

    // listen to when our collection boxes change, so that we can identify when all of our collection boxes are filled
    box.quantityProperty.lazyLink( () => {
      const allFull = _.every( this.collectionBoxes, collectionBox => {
        return collectionBox.isFull();
      } );

      // Used for debugging.
      if ( BAMQueryParameters.easyMode ) {
        this.allCollectionBoxesFilledProperty.value = true;
      }
      else {
        this.allCollectionBoxesFilledProperty.value = this.collectionBoxes.length > 0 && allFull;
      }
    } );
  }

  /**
   * Reset this kitCollection
   */
  public reset(): void {
    this.collectionBoxes.forEach( box => { box.reset(); } );
    this.kits.forEach( kit => { kit.reset(); } );
    this.hasBlinkedOnce = false;
    this.allCollectionBoxesFilledProperty.reset();
  }

  /**
   * Reset only the kits and boxes
   */
  public resetKitsAndBoxes(): void {
    this.kits.forEach( kit => {
      kit.reset();
    } );
    this.collectionBoxes.forEach( box => {
      box.reset();
    } );
  }
}

buildAMolecule.register( 'KitCollection', KitCollection );
export default KitCollection;