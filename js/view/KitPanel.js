// Copyright 2013-2017, University of Colorado Boulder

/**
 * Contains the kit background and controls for switching between kits
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const KitView = require( 'BUILD_A_MOLECULE/view/KitView' );
  const NextPreviousNavigationNode = require( 'SCENERY_PHET/NextPreviousNavigationNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Shape = require( 'KITE/Shape' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );

  // strings
  const kitPatternString = require( 'string!BUILD_A_MOLECULE/kitPattern' );
  const resetKitString = require( 'string!BUILD_A_MOLECULE/resetKit' );

  const kitArrowYOffset = 5; // vertical offset of the kit arrows from the top of the kit

  class KitPanel extends Node {
    /**
     * @param {KitCollection} kitCollectionModel
     * @param {Rectangle} availableKitBounds
     * @constructor
     */
    constructor( kitCollectionModel, availableKitBounds ) {
      super();

      const kitViewBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( availableKitBounds );

      /*---------------------------------------------------------------------------*
       * background
       *----------------------------------------------------------------------------*/

      this.addChild( new Path( Shape.bounds( kitViewBounds ), {
        fill: BAMConstants.KIT_BACKGROUND,
        stroke: BAMConstants.KIT_BORDER
      } ) );

      /*---------------------------------------------------------------------------*
       * label and next/previous
       *----------------------------------------------------------------------------*/

      const labelNode = new Text( '', {
        font: new PhetFont( {
          size: 18,
          weight: 'bold'
        } )
      } );
      kitCollectionModel.currentKitProperty.link( () => {
        labelNode.text = StringUtils.fillIn( kitPatternString, { number: kitCollectionModel.currentKitIndex + 1 } );
      } );

      // REVIEW: Replace with the Carousel common type, so we don't have to do so much (and it has a better appearance)
      const navigationNode = new NextPreviousNavigationNode( labelNode, {
        arrowColor: BAMConstants.KIT_ARROW_BACKGROUND_ENABLED,
        arrowStrokeColor: BAMConstants.KIT_ARROW_BORDER_ENABLED,
        arrowWidth: 17,
        arrowHeight: 24,
        next: () => {
          kitCollectionModel.goToNextKit();
        },
        previous: () => {
          kitCollectionModel.goToPreviousKit();
        },
        createTouchAreaShape: ( shape, isPrevious ) => {
          // square touch area
          const dilatedShape = shape.bounds.dilated( 7 );
          return Shape.bounds( isPrevious ?
                               dilatedShape.withMaxX( shape.bounds.right + labelNode.width / 2 ) :
                               dilatedShape.withMinX( shape.bounds.left - labelNode.width / 2 ) );
        }
      } );
      kitCollectionModel.currentKitProperty.link( () => {
        navigationNode.hasNextProperty.value = kitCollectionModel.hasNextKit();
        navigationNode.hasPreviousProperty.value = kitCollectionModel.hasPreviousKit();
      } );
      navigationNode.setTranslation( kitViewBounds.maxX - navigationNode.width - 5, kitViewBounds.minY + kitArrowYOffset );
      this.addChild( navigationNode );

      /*---------------------------------------------------------------------------*
       * refill kit
       *----------------------------------------------------------------------------*/


      const refillButton = new TextPushButton( resetKitString, {
        listener: () => {
          kitCollectionModel.currentKitProperty.value.reset();
        },
        baseColor: Color.ORANGE,
        font: new PhetFont( { size: 12, weight: 'bold' } ),
        x: kitViewBounds.minX + 5,
        y: kitViewBounds.minY + 5
      } );
      refillButton.touchArea = Shape.bounds( refillButton.selfBounds.union( refillButton.childBounds ).dilated( 10 ) );
      const updateRefillButton = () => {
        refillButton.enabled = kitCollectionModel.currentKitProperty.value.hasAtomsOutsideOfBuckets();
      };
      kitCollectionModel.kits.forEach( ( kit ) => {
        kit.addedMoleculeEmitter.addListener( updateRefillButton );
        kit.removedMoleculeEmitter.addListener( updateRefillButton );
      } );
      kitCollectionModel.currentKitProperty.link( updateRefillButton );
      this.addChild( refillButton );
    }
  }

  return buildAMolecule.register( 'KitPanel', KitPanel );

} );
