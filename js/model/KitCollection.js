// Copyright 2013-2017, University of Colorado Boulder

/**
 * Represents a main running model for the 1st two tabs. Contains a collection of kits and boxes. Kits are responsible
 * for their buckets and atoms.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  function KitCollection() {
    var currentId = 0;

    // @public {number}
    this.id = currentId++;

    this.kits = [];
    this.collectionBoxes = [];

    // @public {Property.<Kit|null>}
    this.currentKitProperty = new Property( null );

    // @public {Property.<boolean>} - this will remain false if we have no collection boxes
    this.allCollectionBoxesFilledProperty = new BooleanProperty( false );
  }

  buildAMolecule.register( 'KitCollection', KitCollection );

  inherit( Object, KitCollection, {
    addKit: function( kit ) {
      var self = this;

      if ( this.currentKitProperty.value ) {
        kit.hide();
      }
      else {
        // first kit, generally
        this.currentKitProperty.value = kit;
        kit.show();

        // handle kit visibility when this changes
        this.currentKitProperty.lazyLink( function( newKit, oldKit ) {
          newKit.show();
          oldKit.hide();
        } );
      }

      this.kits.push( kit );

      var dropListener = function( atom ) {
        var wasDroppedInCollectionBox = false;

        // don't drop an atom from the kit to the collection box directly
        if ( kit.isAtomInPlay( atom ) ) {
          var molecule = kit.getMolecule( atom );

          // check to see if we are trying to drop it in a collection box.
          var numBoxes = self.collectionBoxes.length;
          for ( var i = 0; i < numBoxes; i++ ) {
            var box = self.collectionBoxes[ i ];

            // permissive, so that if the box bounds and molecule bounds intersect, we call it a 'hit'
            if ( box.dropBoundsProperty.value.intersectsBounds( molecule.positionBounds ) ) {

              // if our box takes this type of molecule
              if ( box.willAllowMoleculeDrop( molecule ) ) {
                kit.moleculePutInCollectionBox( molecule, box );
                wasDroppedInCollectionBox = true;
                break;
              }
            }
          }
        }

        if ( !wasDroppedInCollectionBox ) {
          kit.atomDropped( atom );
        }
      };

      kit.atoms.forEach( function( atomModel ) {
        atomModel.droppedByUserEmitter.addListener( dropListener );
      } );

      kit.addedMoleculeEmitter.addListener( function( molecule ) {
        self.collectionBoxes.forEach( function( box ) {
          if ( box.willAllowMoleculeDrop( molecule ) ) {
            box.acceptedMoleculeCreationEmitter.emit( molecule );
          }
        } );
      } );
    },

    // returns {CollectionBox} or undefined
    getFirstTargetBox: function( molecule ) {
      return _.first( this.collectionBoxes, function( box ) { return box.willAllowMoleculeDrop( molecule ); } );
    },

    addCollectionBox: function( box ) {
      var self = this;
      this.collectionBoxes.push( box );

      // listen to when our collection boxes change, so that we can identify when all of our collection boxes are filled
      box.quantityProperty.link( function() {
        var allFull = _.every( self.collectionBoxes, function( collectionBox ) { return collectionBox.isFull(); } );
        self.allCollectionBoxesFilledProperty.value = self.collectionBoxes.length && allFull;
      } );
    },

    get currentKitIndex() {
      // TODO: consider a direct reference to the index?
      return _.indexOf( this.kits, this.currentKitProperty.value );
    },

    hasNextKit: function() {
      return this.currentKitIndex + 1 < this.kits.length;
    },

    hasPreviousKit: function() {
      return this.currentKitIndex - 1 >= 0;
    },

    goToNextKit: function() {
      if ( this.hasNextKit() ) {
        this.currentKitProperty.value = this.kits[ this.currentKitIndex + 1 ];
      }
    },

    goToPreviousKit: function() {
      if ( this.hasPreviousKit() ) {
        this.currentKitProperty.value = this.kits[ this.currentKitIndex - 1 ];
      }
    },

    resetAll: function() {
      this.collectionBoxes.forEach( function( box ) { box.reset(); } );
      this.kits.forEach( function( kit ) { kit.resetKit(); } );
      while ( this.hasPreviousKit() ) {
        this.goToPreviousKit();
      }
    }
  } );

  return KitCollection;
} );
