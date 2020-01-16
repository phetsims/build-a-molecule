// Copyright 2020, University of Colorado Boulder

/**
 * Represents a main running model for the 1st two tabs. Contains a collection of kits and boxes. Kits are responsible
 * for their buckets and atoms.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const BuildAMoleculeQueryParameters = require( 'BUILD_A_MOLECULE/common/BuildAMoleculeQueryParameters' );
  const Property = require( 'AXON/Property' );

  let currentId = 0;

  class KitCollection {
    /**
     * @constructor
     */
    constructor() {

      // @public {number}
      this.id = currentId++;

      // @public {Array.<Kit>}
      this.kits = [];

      // @public {Array.<CollectionBox>}
      this.collectionBoxes = [];

      // @private {boolean} Only show a blinking highlight once
      this.hasBlinkedOnce = false;

      // @public {Property.<boolean>} - this will remain false if we have no collection boxes
      this.allCollectionBoxesFilledProperty = new BooleanProperty( false );

      // @public {Property.<Kit|null>}
      this.currentKitProperty = new Property( null );
      this.currentKitProperty.lazyLink( ( newKit, oldKit ) => {
        if ( oldKit ) {
          oldKit.activeProperty.value = false;
        }
        if ( newKit ) {
          newKit.activeProperty.value = true;
        }
      } );

    }

    /**
     * @param kit
     * @public
     */
    addKit( kit ) {
      this.kits.push( kit );
      const dropListener = atom => {

        // don't drop an atom from the kit to the collection box directly
        if ( kit.isAtomInPlay( atom ) ) {
          const molecule = kit.getMolecule( atom );

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

      kit.atoms.forEach( atom => {
        atom.droppedByUserEmitter.addListener( dropListener );
      } );

      kit.addedMoleculeEmitter.addListener( molecule => {
        this.collectionBoxes.forEach( box => {
          box.cueVisibilityProperty.value = box.willAllowMoleculeDrop( molecule );
          if ( box.willAllowMoleculeDrop( molecule ) && !this.hasBlinkedOnce ) {
            box.acceptedMoleculeCreationEmitter.emit( molecule );
            this.hasBlinkedOnce = true;
          }
        } );

        // kit.atomsInPlayArea.addItemAddedListener( () => {
        //   this.collectionBoxes.forEach( box => {
        //     box.cueVisibilityProperty.value = box.willAllowMoleculeDrop( molecule );
        //   } );
        // } );
        kit.atomsInPlayArea.addItemRemovedListener( () => {
          this.collectionBoxes.forEach( box => {
            box.cueVisibilityProperty.value = box.willAllowMoleculeDrop( molecule );
          } );
        } );
      } );
    }

    /**
     *
     * @param {CollectionBox} box
     * @public
     */
    addCollectionBox( box ) {
      this.collectionBoxes.push( box );

      // listen to when our collection boxes change, so that we can identify when all of our collection boxes are filled
      box.quantityProperty.lazyLink( () => {
        const allFull = _.every( this.collectionBoxes, collectionBox => {
          return collectionBox.isFull();
        } );

        // REVIEW: Used for debugging.
        if ( BuildAMoleculeQueryParameters.easyMode ) {
          this.allCollectionBoxesFilledProperty.value = true;
        }
        else {
          this.allCollectionBoxesFilledProperty.value = this.collectionBoxes.length && allFull;
        }
      } );
    }

    /**
     * @public
     */
    resetAll() {
      this.collectionBoxes.forEach( box => { box.reset(); } );
      this.kits.forEach( kit => { kit.reset(); } );
      this.hasBlinkedOnce = false;
      this.allCollectionBoxesFilledProperty.reset();
    }
  }

  return buildAMolecule.register( 'KitCollection', KitCollection );
} );
