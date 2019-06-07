// Copyright 2013-2017, University of Colorado Boulder

/**
 * Node canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KitCollectionNode = require( 'BUILD_A_MOLECULE/view/KitCollectionNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'DOT/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );

  /**
   * @param {KitCollectionList} kitCollectionList
   * @constructor
   */
  function BAMView( kitCollectionList ) {

    ScreenView.call( this );
    var self = this;

    this.baseNode = new Node();
    this.addChild( this.baseNode );

    this.kitCollectionMap = {}; // maps KitCollection ID => KitCollectionNode

    this.kitCollectionList = kitCollectionList;

    this.addCollection( kitCollectionList.currentCollectionProperty.value );

    kitCollectionList.currentCollectionProperty.link( function( newCollection, oldCollection ) {
      if ( oldCollection ) {
        self.removeChild( self.kitCollectionMap[ oldCollection.id ] );
      }
      if ( newCollection ) {
        self.addChild( self.kitCollectionMap[ newCollection.id ] );
      }
    } );

    kitCollectionList.addedCollectionEmitter.addListener( this.addCollection.bind( this ) );
  }
  buildAMolecule.register( 'BAMView', BAMView );

  return inherit( ScreenView, BAMView, {

    addCollection: function( collection ) {
      var kitCollectionNode = new KitCollectionNode( this.kitCollectionList, collection, this );
      this.kitCollectionMap[ collection.id ] = kitCollectionNode;

      // supposedly: return this so we can manipulate it in an override....?
      return kitCollectionNode;
    }
  } );
} );
