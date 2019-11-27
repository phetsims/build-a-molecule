// Copyright 2013-2019, University of Colorado Boulder

/**
 * Represents a main running model for the 1st two tabs. Contains a collection of kits and boxes. Kits are responsible
 * for their buckets and atoms.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const inherit = require( 'PHET_CORE/inherit' );
  const BuildAMoleculeQueryParameters = require( 'BUILD_A_MOLECULE/common/BuildAMoleculeQueryParameters' );
  const Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  function KitCollection() {
    let currentId = 0;

    // @public {number}
    this.id = currentId++;

    this.kits = [];
    this.collectionBoxes = [];

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

    // @public {Property.<boolean>} - this will remain false if we have no collection boxes
    this.allCollectionBoxesFilledProperty = new BooleanProperty( false );
  }

  buildAMolecule.register( 'KitCollection', KitCollection );

  inherit( Object, KitCollection, {
    addKit: function( kit ) {
      const self = this;

      this.kits.push( kit );

      const dropListener = function( atom ) {
        // var wasDroppedInCollectionBox = false;

        // don't drop an atom from the kit to the collection box directly
        if ( kit.isAtomInPlay( atom ) ) {
          const molecule = kit.getMolecule( atom );

          // check to see if we are trying to drop it in a collection box.
          const numBoxes = self.collectionBoxes.length;
          for ( let i = 0; i < numBoxes; i++ ) {
            const box = self.collectionBoxes[ i ];

            // permissive, so that if the box bounds and molecule bounds intersect, we call it a 'hit'
            if ( box.dropBoundsProperty.value.intersectsBounds( molecule.positionBounds ) ) {

              // if our box takes this type of molecule
              if ( box.willAllowMoleculeDrop( molecule ) ) {
                kit.moleculePutInCollectionBox( molecule, box );
                // wasDroppedInCollectionBox = true;
                break;
              }
            }
          }
        }

        // if ( !wasDroppedInCollectionBox ) {
        //   kit.atomDropped( atom );
        // }
      };

      kit.atoms.forEach( function( atom ) {
        atom.droppedByUserEmitter.addListener( dropListener );
      } );

      kit.addedMoleculeEmitter.addListener( function( molecule ) {
        self.collectionBoxes.forEach( function( box ) {
          if ( box.willAllowMoleculeDrop( molecule ) ) {
            box.acceptedMoleculeCreationEmitter.emit( molecule );
          }
        } );
      } );
    },


    addCollectionBox: function( box ) {
      const self = this;
      this.collectionBoxes.push( box );

      // listen to when our collection boxes change, so that we can identify when all of our collection boxes are filled
      box.quantityProperty.lazyLink( () => {
        const allFull = _.every( self.collectionBoxes, function( collectionBox ) { return collectionBox.isFull(); } );

        // REVIEW: Used for debugging.
        if ( BuildAMoleculeQueryParameters.easyMode ) {
          self.allCollectionBoxesFilledProperty.value = true;
        }
        else {
          self.allCollectionBoxesFilledProperty.value = self.collectionBoxes.length && allFull;
        }
      } );
    },

    resetAll: function() {
      this.collectionBoxes.forEach( function( box ) { box.reset(); } );
      this.kits.forEach( function( kit ) { kit.reset(); } );
    }
  } );

  return KitCollection;
} );
