// Copyright 2020, University of Colorado Boulder

/**
 * Contains the kit background and controls for switching between kits
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import Carousel from '../../../../sun/js/Carousel.js';
import PageControl from '../../../../sun/js/PageControl.js';
import Playable from '../../../../tambo/js/Playable.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import KitView from './KitView.js';

class KitPanel extends Node {
  /**
   * @param {KitCollection} kitCollection
   * @param {number} kitViewWidth
   * @param {number} kitViewHeight
   * @param {MoleculeCollectingScreenView|BAMScreenView} view
   * @param {boolean} isCollectingView
   * @constructor
   */
  constructor( kitCollection, kitViewWidth, kitViewHeight, view, isCollectingView ) {
    super();

    // Keep track of the KitCollection
    const kitCollectionProperty = new Property( kitCollection );

    // create kitViews and unify their heights
    const kitViews = [];
    kitCollectionProperty.link( kitCollection => {
      kitCollection.kits.forEach( kit => {
        const kitView = new KitView( kit, view );
        const kitViewBounds = kitView.getLocalBounds();
        kitView.setLocalBounds( kitViewBounds.dilatedY( ( kitViewHeight - kitViewBounds.getHeight() ) / 2 ) );

        // We only want to adjust width of kit panel on collection views.
        if ( isCollectingView ) {
          kitView.setLocalBounds( kitViewBounds.dilatedX( ( kitViewWidth - kitViewBounds.getWidth() ) / 2 ) );
        }
        else {
          kitView.setLocalBounds( kitViewBounds.dilatedX( ( kitViewWidth - kitViewBounds.getWidth() ) * 0.02 ) );
        }
        kitViews.push( kitView );
      } );
    } );

    // @public {Carousel} Treats each kit as an item.
    this.kitCarousel = new Carousel( kitViews, {
      fill: BAMConstants.KIT_BACKGROUND,
      stroke: BAMConstants.KIT_BORDER,
      xMargin: 10,
      itemsPerPage: 1,
      animationEnabled: false,
      buttonSoundPlayer: Playable.NO_SOUND
    } );

    this.kitCarousel.pageNumberProperty.link( page => {
      kitCollectionProperty.value.currentKitProperty.value = kitCollectionProperty.value.kits[ page ];
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

buildAMolecule.register( 'KitPanel', KitPanel );
export default KitPanel;