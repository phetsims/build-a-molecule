// Copyright 2002-2014, University of Colorado Boulder

/**
 * Node canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var KitCollectionNode = require( 'BUILD_A_MOLECULE/view/KitCollectionNode' );

  var BAMView = namespace.BAMView = function BAMView( collectionList ) {
    ScreenView.call( this, { layoutBounds: new Rectangle( 0, 0, Constants.stageSize.width, Constants.stageSize.height ) } );
    var view = this;

    this.baseNode = new Node();
    this.addChild( this.baseNode );

    this.kitCollectionMap = {}; // maps KitCollection ID => KitCollectionNode

    this.collectionList = collectionList;

    this.addCollection( collectionList.currentCollection );

    collectionList.currentCollectionProperty.link( function( newCollection, oldCollection ) {
      if ( oldCollection ) {
        view.removeChild( view.kitCollectionMap[ oldCollection.id ] );
      }
      if ( newCollection ) {
        view.addChild( view.kitCollectionMap[ newCollection.id ] );
      }
    } );

    collectionList.on( 'addedCollection', this.addCollection.bind( this ) );
  };

  return inherit( ScreenView, BAMView, {
    isBAMView: true, // because require.js doesn't like to load us in some places!

    addCollection: function( collection ) {
      var kitCollectionNode = new KitCollectionNode( this.collectionList, collection, this );
      this.kitCollectionMap[ collection.id ] = kitCollectionNode;

      // supposedly: return this so we can manipulate it in an override....?
      return kitCollectionNode;
    }
  } );
} );
