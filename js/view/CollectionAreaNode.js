// Copyright 2013-2019, University of Colorado Boulder

/**
 * Area that shows all of the collection boxes and a reset collection button
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MultipleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/MultipleCollectionBoxNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const SingleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/SingleCollectionBoxNode' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {KitCollection} collection
   * @param {boolean} isSingleCollectionMode
   * @param {Function} toModelBounds
   * @constructor
   */
  function CollectionAreaNode( collection, isSingleCollectionMode, toModelBounds ) {
    Node.call( this, {} );
    const self = this;

    // Array for the black box for its text
    this.collectionBoxNodes = [];

    // Container for collection boxes and reset collection button.
    const allCollectionItemsVBox = new VBox( { spacing: 10 } );
    this.addChild( allCollectionItemsVBox );

    // Create and add all collection box nodes.
    collection.collectionBoxes.forEach( function( collectionBox ) {
      const collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds ) : new MultipleCollectionBoxNode( collectionBox, toModelBounds );
      self.collectionBoxNodes.push( collectionBoxNode );
      allCollectionItemsVBox.addChild( collectionBoxNode );
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
