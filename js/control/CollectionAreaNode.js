// Copyright 2013-2015, University of Colorado Boulder

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
  var MultipleCollectionBoxNode = require( 'BUILD_A_MOLECULE/control/MultipleCollectionBoxNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SingleCollectionBoxNode = require( 'BUILD_A_MOLECULE/control/SingleCollectionBoxNode' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

  // strings
  var collectionResetString = require( 'string!BUILD_A_MOLECULE/collection.reset' );

  function CollectionAreaNode( collection, isSingleCollectionMode, toModelBounds ) {
    Node.call( this, {} );
    var self = this;

    this.collectionBoxNodes = [];

    var maximumBoxWidth = isSingleCollectionMode ? SingleCollectionBoxNode.maxWidth : MultipleCollectionBoxNode.maxWidth;
    var maximumBoxHeight = isSingleCollectionMode ? SingleCollectionBoxNode.maxHeight : MultipleCollectionBoxNode.maxHeight;

    var y = 0;

    // add nodes for all of our collection boxes.
    _.each( collection.collectionBoxes, function( collectionBox ) {
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
      collectionBoxHolder.addChild( new Rectangle( 0, 0, maximumBoxWidth, maximumBoxHeight, { visible: false, stroke: null } ) ); // TODO: Spacer node for Scenery?
      collectionBoxHolder.addChild( collectionBoxNode );
      self.addChild( collectionBoxHolder );
      collectionBoxHolder.top = y;
      y += collectionBoxHolder.height + 15; // TODO: GeneralLayoutNode for Scenery?
    } );

    /*---------------------------------------------------------------------------*
     * Reset Collection button
     *----------------------------------------------------------------------------*/
    var resetCollectionButton = new TextPushButton( collectionResetString, {
      listener: function() {
        // when clicked, empty collection boxes
        _.each( collection.collectionBoxes, function( box ) {
          box.clear();
        } );
        _.each( collection.kits, function( kit ) {
          kit.resetKit();
        } );
      },
      font: new PhetFont( 14 ),
      baseColor: Color.ORANGE
    } );
    resetCollectionButton.touchArea = Shape.bounds( resetCollectionButton.bounds.dilated( 7 ) );

    function updateEnabled() {
      var enabled = false;
      _.each( collection.collectionBoxes, function( box ) {
        if ( box.quantity > 0 ) {
          enabled = true;
        }
      } );
      resetCollectionButton.enabled = enabled;
    }

    // when any collection box quantity changes, re-update whether we are enabled
    _.each( collection.collectionBoxes, function( box ) {
      box.quantityProperty.link( updateEnabled );
    } );

    resetCollectionButton.top = y;
    this.addChild( resetCollectionButton );

    // center everything
    var centerX = this.width / 2; // TODO: better layout code
    _.each( this.children, function( child ) {
      child.centerX = centerX;
    } );
  }
  buildAMolecule.register( 'CollectionAreaNode', CollectionAreaNode );

  return inherit( Node, CollectionAreaNode, {
    updateCollectionBoxLocations: function() {
      _.each( this.collectionBoxNodes, function( collectionBoxNode ) {
        collectionBoxNode.updateLocation();
      } );
    }
  } );
} );
