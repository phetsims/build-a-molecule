// Copyright 2013-2015, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KitView = require( 'BUILD_A_MOLECULE/view/KitView' );
  var KitPanel = require( 'BUILD_A_MOLECULE/control/KitPanel' );
  var Node = require( 'SCENERY/nodes/Node' );

  function KitCollectionNode( collectionList, collection, view ) {
    Node.call( this, {} );
    var self = this;

    this.addChild( new KitPanel( collection, collectionList.availableKitBounds ) );

    var kitMap = {}; // maps kit ID => KitView
    _.each( collection.kits, function( kit ) {
      var kitView = new KitView( kit, view );
      kitMap[ kit.id ] = kitView;
    } );

    // NOTE: appends to the KitCollectionNode. This works because the KitPanel is always behind (we have a shallower tree this way)
    collection.currentKitProperty.link( function( newKit, oldKit ) {
      if ( oldKit ) {
        self.removeChild( kitMap[ oldKit.id ] );
      }
      if ( newKit ) {
        self.addChild( kitMap[ newKit.id ] );
      }
    } );
  }
  buildAMolecule.register( 'KitCollectionNode', KitCollectionNode );

  inherit( Node, KitCollectionNode );

  return KitCollectionNode;
} );
