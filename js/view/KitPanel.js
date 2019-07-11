// Copyright 2013-2019, University of Colorado Boulder

/**
 * Contains the kit background and controls for switching between kits
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Carousel = require( 'SUN/Carousel' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const KitView = require( 'BUILD_A_MOLECULE/view/KitView' );
  const Node = require( 'SCENERY/nodes/Node' );

  class KitPanel extends Node {
    /**
     * @param {KitCollection} kitCollection
     * @param {Rectangle} availableKitBounds
     * @param {MoleculeCollectingView} view
     * @constructor
     */
    constructor( kitCollection, availableKitBounds, view ) {
      super();
      // const kitViewBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( availableKitBounds );

      var kits = [];
      kitCollection.kits.forEach( function( kit ) {
        kits.push( new KitView( kit, view ) );
        // kits.push(  new Rectangle( 0, 0, 60, 60, { fill: "pink", stroke: 'black' } ))
      } );
      // kits.push(  new KitView( kitCollection.kits[0], kitViewBounds ));


      this.addChild( new Carousel( kits, {
        fill: BAMConstants.KIT_BACKGROUND,
        stroke: BAMConstants.KIT_BORDER,
        margin: 10,
        itemsPerPage: 1
      } ) );
    }
  }

  return buildAMolecule.register( 'KitPanel', KitPanel );

} );
