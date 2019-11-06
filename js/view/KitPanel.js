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
  const Color = require( 'SCENERY/util/Color' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const KitView = require( 'BUILD_A_MOLECULE/view/KitView' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PageControl = require( 'SUN/PageControl' );

  class KitPanel extends Node {
    /**
     * @param {KitCollection} kitCollection
     * @param {number} kitViewWidth
     * @param {number} kitViewHeight
     * @param {MoleculeCollectingView|BAMView} view
     * @param {boolean} isCollectingView
     * @constructor
     */
    constructor( kitCollection, kitViewWidth, kitViewHeight, view, isCollectingView ) {
      super();

      // @private
      this.kitCollection = kitCollection;

      // create kitViews and unify their heights
      const kitViews = [];
      kitCollection.kits.forEach( kit => {
        const kitView = new KitView( kit, view );
        const kitViewBounds = kitView.getLocalBounds();
        kitView.setLocalBounds( kitViewBounds.dilatedY( ( kitViewHeight - kitViewBounds.getHeight() ) / 2 ) );

        // We only want to adjust width of kit panel on collection views.
        if ( isCollectingView ) {
          kitView.setLocalBounds( kitViewBounds.dilatedX( ( kitViewWidth - kitViewBounds.getWidth() ) / 2 ) );
        }
        kitViews.push( kitView );
      } );

      // @public {Carousel} Treats each kit as an item.
      this.kitCarousel = new Carousel( kitViews, {
        fill: BAMConstants.KIT_BACKGROUND,
        stroke: BAMConstants.KIT_BORDER,
        margin: 10,
        itemsPerPage: 1,
        animationEnabled: false
      } );

      this.kitCarousel.pageNumberProperty.link( page => {
        this.kitCollection.currentKitProperty.value = this.kitCollection.kits[ page ];
      } );
      this.addChild( this.kitCarousel );

      // Page control for input carousel
      const inputPageControl = new PageControl( this.kitCarousel.numberOfPages, this.kitCarousel.pageNumberProperty, {
        top: this.kitCarousel.bottom + BAMConstants.VIEW_PADDING / 2,
        centerX: this.kitCarousel.centerX,
        pageFill: Color.WHITE,
        pageStroke: Color.BLACK,
        interactive: true,
        dotTouchAreaDilation: 4,
        dotMouseAreaDilation: 4
      } );
      this.addChild( inputPageControl );
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