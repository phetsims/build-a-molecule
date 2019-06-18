// Copyright 2013-2017, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  // const Carousel = require( 'SUN/Carousel' );
  const KitPanel = require( 'BUILD_A_MOLECULE/view/KitPanel' );
  const KitView = require( 'BUILD_A_MOLECULE/view/KitView' );
  const Node = require( 'SCENERY/nodes/Node' );

  class KitCollectionNode extends Node {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @param {KitCollection} collection
     * @param {MoleculeCollectingView} view
     * @constructor
     */
    constructor( kitCollectionList, collection, view ) {
      super( {} );
      const self = this;

      this.addChild( new KitPanel( collection, kitCollectionList.availableKitBounds ) );

      const kitMap = []; // maps kit ID => KitView
      collection.kits.forEach( ( kit ) => {
        kitMap[ kit.id ] = new KitView( kit, view );
      } );
      // var kit = new KitView( collection.currentKitProperty.value );
      // var kits = [new KitView( collection.kits[0]) ];
      // this.addChild( new Carousel( kits ),{
      //   fill: BAMConstants.KIT_BACKGROUND,
      //   stroke: BAMConstants.KIT_BORDER,
      //   itemsPerPage:1
      // } );


      // NOTE: appends to the KitCollectionNode. This works because the KitPanel is always behind (we have a shallower tree this way)
      collection.currentKitProperty.link( ( newKit, oldKit ) => {
        if ( oldKit ) {
          self.removeChild( kitMap[ oldKit.id ] );
        }
        if ( newKit ) {
          self.addChild( kitMap[ newKit.id ] );
        }
      } );
    }
  }

  return buildAMolecule.register( 'KitCollectionNode', KitCollectionNode );
} );
