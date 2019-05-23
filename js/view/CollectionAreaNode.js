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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SingleCollectionBoxNode = require( 'BUILD_A_MOLECULE/view/SingleCollectionBoxNode' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

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

    this.collectionBoxNodes = [];

    var maximumBoxWidth = isSingleCollectionMode ? SingleCollectionBoxNode.maxWidth : MultipleCollectionBoxNode.maxWidth;
    var maximumBoxHeight = isSingleCollectionMode ? SingleCollectionBoxNode.maxHeight : MultipleCollectionBoxNode.maxHeight;

    var y = 0;

    // add nodes for all of our collection boxes.
    collection.collectionBoxes.forEach( function( collectionBox ) {
      var collectionBoxNode = isSingleCollectionMode ? new SingleCollectionBoxNode( collectionBox, toModelBounds ) : new MultipleCollectionBoxNode( collectionBox, toModelBounds );
      self.collectionBoxNodes.push( collectionBoxNode );

      // TODO: can we fix this up somehow to be better? easier way to force height?
      // center box horizontally and put at bottom vertically in our holder
      function layoutBoxNode() {
        // compute correct offsets
        var offsetX = ( maximumBoxWidth - collectionBoxNode.width ) / 2;
        var offsetY = maximumBoxHeight - collectionBoxNode.height;

        // only apply these if they are different. otherwise we run into infinite recursion
        if ( collectionBoxNode.x !== offsetX || collectionBoxNode.y !== offsetY ) {
          collectionBoxNode.setTranslation( offsetX, offsetY );
        }
      }

      layoutBoxNode();

      // also position if its size changes in the future
      collectionBoxNode.on( 'bounds', layoutBoxNode );

      var collectionBoxHolder = new Node();
      // enforce consistent bounds of the maximum size. reason: we don't want switching between collections to alter the positions of the collection boxes
      //REVIEW: Use Spacer
      collectionBoxHolder.addChild( new Rectangle( 0, 0, maximumBoxWidth, maximumBoxHeight, {
        visible: false,
        stroke: null
      } ) ); // TODO: Spacer node for Scenery?
      collectionBoxHolder.addChild( collectionBoxNode );
      self.addChild( collectionBoxHolder );
      collectionBoxHolder.top = y;
      y += collectionBoxHolder.height + 15; //REVIEW: VBox?
    } );

    /*---------------------------------------------------------------------------*
     * Reset Collection button
     *----------------------------------------------------------------------------*/
    var resetCollectionButton = new TextPushButton( resetCollectionString, {
      listener: function() {
        // when clicked, empty collection boxes
        collection.collectionBoxes.forEach( function( box ) {
          box.reset();
        } );
        collection.kits.forEach( function( kit ) {
          kit.resetKit();
        } );
      },
      font: new PhetFont( 14 ),
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

    resetCollectionButton.top = y;
    this.addChild( resetCollectionButton );

    // center everything
    var centerX = this.width / 2; // TODO: better layout code
    this.children.forEach( function( child ) {
      child.centerX = centerX;
    } );
  }

  buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );
  return inherit( Node, CollectionAreaNode, {
    updateCollectionBoxLocations: function() {
      this.collectionBoxNodes.forEach( function( collectionBoxNode ) {
        collectionBoxNode.updateLocation();
      } );
    }
  } );
} );
