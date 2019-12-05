// Copyright 2013-2019, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MultipleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/MultipleCollectionBoxNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const RefreshButton = require( 'SCENERY_PHET/buttons/RefreshButton' );
  const Shape = require( 'KITE/Shape' );
  const SingleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/SingleCollectionBoxNode' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {KitCollection} collection
   * @param {boolean} isSingleCollectionMode
   * @param {function} toModelBounds
   * @param {function} showDialogCallback
   * @param {function} updateRefillButton
   * @constructor
   */
  function CollectionAreaNode( collection, isSingleCollectionMode, toModelBounds, showDialogCallback, updateRefillButton ) {
    Node.call( this, {} );
    const self = this;

    // Array for the black box for its text
    this.collectionBoxNodes = [];

    // Container for collection boxes and reset collection button.
    const allCollectionItemsVBox = new VBox( { spacing: 7 } );
    this.addChild( allCollectionItemsVBox );

    // Create and add all collection box nodes.
    collection.collectionBoxes.forEach( function( collectionBox ) {
      const collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback ) :
                                new MultipleCollectionBoxNode( collectionBox, toModelBounds, showDialogCallback );
      self.collectionBoxNodes.push( collectionBoxNode );
      allCollectionItemsVBox.addChild( collectionBoxNode );
    } );

    // Reset collection button
    var resetCollectionButton = new RefreshButton( {
      listener: function() {
        // when clicked, empty collection boxes
        collection.collectionBoxes.forEach( function( box ) {
          box.reset();
        } );
        collection.kits.forEach( function( kit ) {
          kit.reset();
        } );
        updateRefillButton();
      },
      iconScale: 0.5,
      xMargin: 15,
      yMargin: 5,
      baseColor: Color.ORANGE
    } );
    resetCollectionButton.touchArea = Shape.bounds( resetCollectionButton.bounds.dilated( 7 ) );

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
    allCollectionItemsVBox.addChild( resetCollectionButton );
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
