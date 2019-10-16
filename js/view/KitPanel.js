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
     * @param {number} kitViewHeight
     * @param {MoleculeCollectingView} view
     * @constructor
     */
    constructor( kitCollection, kitViewHeight, view ) {
      super();

      // @private
      this.kitCollection = kitCollection;

      // create kitViews and unify their heights
      const kitViews = [];
      kitCollection.kits.forEach( kit => {
        const kitView = new KitView( kit, view );
        const kitViewBounds = kitView.getLocalBounds();
        kitView.setLocalBounds( kitViewBounds.dilatedY( ( kitViewHeight - kitViewBounds.getHeight() ) / 2 ) );
        kitViews.push( kitView );
      } );

      this.kitCarousel = new Carousel( kitViews, {
        fill: BAMConstants.KIT_BACKGROUND,
        stroke: BAMConstants.KIT_BORDER,
        margin: 10,
        itemsPerPage: 1
      } );

      this.kitCarousel.pageNumberProperty.link( page => {
        this.kitCollection.currentKitProperty.value = this.kitCollection.kits[ page ];
      } );
      this.addChild( this.kitCarousel );
    }

    /**
     * @public
     */
    reset() {
      this.kitCarousel.reset();
    }
  }

  return buildAMolecule.register( 'KitPanel', KitPanel );

} );