// Copyright 2013-2019, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const KitPanel = require( 'BUILD_A_MOLECULE/view/KitPanel' );
  const KitView = require( 'BUILD_A_MOLECULE/view/KitView' );
  const Node = require( 'SCENERY/nodes/Node' );

  class KitCollectionNode extends Node {
    /**
     * @param {KitCollection} collection
     * @param {MoleculeCollectingView} view
     * @constructor
     */
    constructor( collection, view ) {
      super( {} );

      const kitPanel = new KitPanel( collection, BAMConstants.KIT_VIEW_HEIGHT, view );
      kitPanel.bottom = BAMConstants.STAGE_SIZE.bottom - BAMConstants.VIEW_PADDING;
      kitPanel.left = BAMConstants.STAGE_SIZE.left + BAMConstants.VIEW_PADDING;

      this.addChild( kitPanel );

      const kitMap = []; // maps kit ID => KitView
      collection.kits.forEach( ( kit ) => {
        kitMap[ kit.id ] = new KitView( kit, view );
      } );

      // NOTE: appends to the KitCollectionNode. This works because the KitPanel is always behind (we have a shallower tree this way)
      collection.currentKitProperty.link( ( newKit, oldKit ) => {
        if ( oldKit ) {
          // self.removeChild( kitMap[ oldKit.id ] );
        }
        if ( newKit ) {
          // self.addChild( kitMap[ newKit.id ] );
        }
      } );
    }
  }

  return buildAMolecule.register( 'KitCollectionNode', KitCollectionNode );
} );
