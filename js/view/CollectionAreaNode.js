// Copyright 2013-2017, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultipleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/MultipleCollectionBoxNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var SingleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/SingleCollectionBoxNode' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var resetCollectionString = require( 'string!BUILD_A_MOLECULE/resetCollection' );

  /**
   * @param {KitCollection} collection
   * @param {boolean} isSingleCollectionMode
   * @param {Function} toModelBounds
   * @constructor
   */
  function CollectionAreaNode( collection, isSingleCollectionMode, toModelBounds ) {
    Node.call( this, {} );
    var self = this;

    // Array for the black box for its text
    this.collectionBoxNodes = [];

    // Container for collection boxes and reset collection button.
    var allCollectionItemsVBox = new VBox( { spacing: 10 } );
    this.addChild( allCollectionItemsVBox );

    // Create and add all collection box nodes.
    collection.collectionBoxes.forEach( function( collectionBox ) {
      var collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds ) : new MultipleCollectionBoxNode( collectionBox, toModelBounds );
      self.collectionBoxNodes.push( collectionBoxNode );
      allCollectionItemsVBox.addChild( collectionBoxNode );
    } );

    // Reset Collection Button
    var resetCollectionButton = new TextPushButton( resetCollectionString, {
      listener: function() {
        // when clicked, empty collection boxes
        collection.collectionBoxes.forEach( function( box ) {
          box.reset();
        } );
        collection.kits.forEach( function( kit ) {
          kit.reset();
        } );
      },
      font: new PhetFont( 14 ),
      baseColor: Color.ORANGE
    } );
    resetCollectionButton.touchArea = Shape.bounds( resetCollectionButton.bounds.dilated( 7 ) );
    allCollectionItemsVBox.addChild( resetCollectionButton );

    /**
     * Toggles whether our reset collection button is enabled.
     * @private
     */
    function updateEnabled() {
      var enabled = false;
      collection.collectionBoxes.forEach( function( box ) {
        if ( box.quantityProperty.value > 0 ) {
          enabled = true;
        }
      } );
      resetCollectionButton.enabled = enabled;
    }

    // when any collection box quantity changes, re-update whether we are enabled
    collection.collectionBoxes.forEach( function( box ) {
      box.quantityProperty.link( updateEnabled );
    } );
  }

  buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
  return inherit( Node, CollectionAreaNode, {

    // REVIEW: Add doc
    updateCollectionBoxLocations: function() {
      this.collectionBoxNodes.forEach( function( collectionBoxNode ) {
        collectionBoxNode.updateLocation();
      } );
    }
  } );
} );
