// Copyright 2020, University of Colorado Boulder

/**
 * Contains the kit background and controls for switching between kits
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
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
import KitNode from './KitNode.js';

class KitPanel extends Node {
  /**
   * @param {KitCollection} kitCollection
   * @param {number} kitNodeWidth
   * @param {number} kitNodeHeight
   * @param {MoleculeCollectingScreenView|BAMScreenView} view
   * @param {boolean} isCollectingView
   */
  constructor( kitCollection, kitNodeWidth, kitNodeHeight, view, isCollectingView ) {
    super();

    // Keep track of the KitCollection
    const kitCollectionProperty = new Property( kitCollection );

    // create kitNodes and unify their heights
    const kitNodes = [];
    kitCollectionProperty.link( kitCollection => {
      kitCollection.kits.forEach( kit => {
        const kitNode = new KitNode( kit, view );
        const kitNodeBounds = kitNode.getLocalBounds();
        kitNode.setLocalBounds( kitNodeBounds.dilatedY( ( kitNodeHeight - kitNodeBounds.getHeight() ) / 2 ) );

        // We only want to adjust width of kit panel on collection views.
        if ( isCollectingView ) {
          kitNode.setLocalBounds( kitNodeBounds.dilatedX( ( kitNodeWidth - kitNodeBounds.getWidth() ) / 2 ) );
        }
        else {
          kitNode.setLocalBounds( kitNodeBounds.dilatedX( ( kitNodeWidth - kitNodeBounds.getWidth() ) * 0.02 ) );
        }
        kitNodes.push( kitNode );
      } );
    } );

    // @public {Carousel} Treats each kit as an item in the Carousel.
    this.kitCarousel = new Carousel( kitNodes, {
      fill: BAMConstants.KIT_BACKGROUND,
      stroke: BAMConstants.KIT_BORDER,
      xMargin: 10,
      itemsPerPage: 1,
      animationEnabled: false,
      buttonSoundPlayer: Playable.NO_SOUND
    } );

    // When the page number changes update the current collection.
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
   * @override
   */
  reset() {
    this.kitCarousel.reset();
  }
}

buildAMolecule.register( 'KitPanel', KitPanel );
export default KitPanel;