// Copyright 2002-2013, University of Colorado

/**
 * Represents a main running model for the 1st two tabs. Contains a collection of kits and boxes. Kits are responsible
 * for their buckets and atoms.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  
  var KitCollection = namespace.KitCollection = function KitCollection() {
    PropertySet.call( this, {
      currentKit: null,
      allCollectionBoxesFilled: false // this will remain false if we have no collection boxes
    } );
    
    this.kits = [];
    this.collectionBoxes = [];
  };
  
  inherit( PropertySet, KitCollection, {
    addKit: function( kit ) {
      var kitCollection = this;
      
      if ( this.currentKit ) {
        kit.hide();
      } else {
        // first kit, generally
        this.currentKit = kit;
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
          var numBoxes = kitCollection.collectionBoxes.length;
          for ( var i = 0; i < numBoxes; i++ ) {
            var box = kitCollection.collectionBoxes[i];
            
            // permissive, so that if the box bounds and molecule bounds intersect, we call it a 'hit'
            if ( box.dropBounds.intersectsBounds( molecule.positionBounds ) ) {

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
      
      _.each( kit.atoms, function( atomModel ) {
        atomModel.on( 'droppedByUser', dropListener );
      } );
      
      kit.on( 'addedMolecule', function( molecule ) {
        _.each( kitCollection.collectionBoxes, function( box ) {
          if ( box.willAllowMoleculeDrop( molecule ) ) {
            box.trigger( 'acceptedMoleculeCreation', molecule );
          }
        } );
      } );
    },
    
    // returns {CollectionBox} or undefined
    getFirstTargetBox: function( molecule ) {
      return _.first( this.collectionBoxes, function( box ) { return box.willAllowMoleculeDrop( molecule ); } );
    },

    addCollectionBox: function( box ) {
      var kitCollection = this;
      this.collectionBoxes.push( box );

      // listen to when our collection boxes change, so that we can identify when all of our collection boxes are filled
      box.quantityProperty.link( function() {
        var allFull = _.every( kitCollection.collectionBoxes, function( collectionBox ) { return collectionBox.isFull(); } );
        kitCollection.allCollectionBoxesFilled = kitCollection.collectionBoxes.length && allFull;
      } );
    },
    
    get currentKitIndex() {
      // TODO: consider a direct reference to the index?
      return _.indexOf( this.kits, this.currentKit );
    },

    hasNextKit: function() {
      return this.currentKitIndex + 1 < this.kits.length;
    },

    hasPreviousKit: function() {
      return this.currentKitIndex - 1 >= 0;
    },

    goToNextKit: function() {
      if ( this.hasNextKit() ) {
        this.currentKit = this.kits[this.currentKitIndex + 1];
      }
    },

    goToPreviousKit: function() {
      if ( this.hasPreviousKit() ) {
        this.currentKit = this.kits[this.currentKitIndex - 1];
      }
    },

    resetAll: function() {
      _.each( this.collectionBoxes, function( box ) { box.clear(); } );
      _.each( this.kits, function( kit ) { kit.resetKit(); } );
      while ( this.hasPreviousKit() ) {
        this.goToPreviousKit();
      }
    }
  } );
  
  return KitCollection;
} );
