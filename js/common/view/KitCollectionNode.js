// Copyright 2020, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const KitPanel = require( 'BUILD_A_MOLECULE/common/view/KitPanel' );
  const KitView = require( 'BUILD_A_MOLECULE/common/view/KitView' );
  const Node = require( 'SCENERY/nodes/Node' );

  class KitCollectionNode extends Node {
    /**
     * @param {KitCollection} collection
     * @param {MoleculeCollectingView} view
     * @param {boolean} isCollectingView
     * @constructor
     */
    constructor( collection, view, isCollectingView ) {
      super();
      this.kitPanel = new KitPanel( collection, BAMConstants.KIT_VIEW_WIDTH, BAMConstants.KIT_VIEW_HEIGHT, view, isCollectingView );
      this.kitPanel.bottom = BAMConstants.STAGE_SIZE.bottom - BAMConstants.VIEW_PADDING;
      this.kitPanel.left = BAMConstants.STAGE_SIZE.left + BAMConstants.VIEW_PADDING;

      this.addChild( this.kitPanel );

      const kitMap = []; // maps kit ID => KitView
      collection.kits.forEach( kit => {
        kitMap[ kit.id ] = new KitView( kit, view );
      } );
    }
  }

  return buildAMolecule.register( 'KitCollectionNode', KitCollectionNode );
} );
