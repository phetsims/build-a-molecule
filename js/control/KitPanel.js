// Copyright 2013-2015, University of Colorado Boulder

/**
 * Contains the kit background and controls for switching between kits
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );
  var NextPreviousNavigationNode = require( 'SCENERY_PHET/NextPreviousNavigationNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

  // strings
  var kitLabelString = require( 'string!BUILD_A_MOLECULE/kit.label' );
  var kitResetKitString = require( 'string!BUILD_A_MOLECULE/kit.resetKit' );

  var kitArrowYOffset = 5; // vertical offset of the kit arrows from the top of the kit

  function KitPanel( kitCollectionModel, availableKitBounds ) {
    Node.call( this, {} );

    assert && assert( Constants.modelViewTransform.getMatrix().m11() < 0 ); // we assume this and correct for the inversed Y

    var kitViewBounds = Constants.modelViewTransform.modelToViewBounds( availableKitBounds );

    /*---------------------------------------------------------------------------*
     * background
     *----------------------------------------------------------------------------*/

    this.addChild( new Path( Shape.bounds( kitViewBounds ), {
      fill: Constants.kitBackground,
      stroke: Constants.kitBorder
    } ) );

    /*---------------------------------------------------------------------------*
     * label and next/previous
     *----------------------------------------------------------------------------*/

    var labelNode = new Text( '', {
      font: new PhetFont( {
        size: 18,
        weight: 'bold'
      } )
    } );
    kitCollectionModel.currentKitProperty.link( function() {
      labelNode.text = StringUtils.format( kitLabelString, kitCollectionModel.currentKitIndex + 1 );
    } );

    var navigationNode = new NextPreviousNavigationNode( labelNode, {
      arrowColor: Constants.kitArrowBackgroundEnabled,
      arrowStrokeColor: Constants.kitArrowBorderEnabled,
      arrowWidth: 17,
      arrowHeight: 24,
      next: function() {
        kitCollectionModel.goToNextKit();
      },
      previous: function() {
        kitCollectionModel.goToPreviousKit();
      },
      createTouchAreaShape: function( shape, isPrevious ) {
        // square touch area
        var dilatedShape = shape.bounds.dilated( 7 );
        return Shape.bounds( isPrevious ?
                             dilatedShape.withMaxX( shape.bounds.right + labelNode.width / 2 ) :
                             dilatedShape.withMinX( shape.bounds.left - labelNode.width / 2 ) );
      }
    } );
    kitCollectionModel.currentKitProperty.link( function() {
      navigationNode.hasNextProperty.value = kitCollectionModel.hasNextKit();
      navigationNode.hasPreviousProperty.value = kitCollectionModel.hasPreviousKit();
    } );
    navigationNode.setTranslation( kitViewBounds.maxX - navigationNode.width - 5, kitViewBounds.minY + kitArrowYOffset );
    this.addChild( navigationNode );

    /*---------------------------------------------------------------------------*
     * refill kit
     *----------------------------------------------------------------------------*/

    var refillButton = new TextPushButton( kitResetKitString, {
      listener: function() {
        kitCollectionModel.currentKit.resetKit();
      },
      baseColor: Color.ORANGE,
      font: new PhetFont( { size: 12, weight: 'bold' } ),
      x: kitViewBounds.minX + 5,
      y: kitViewBounds.minY + 5
    } );
    refillButton.touchArea = Shape.bounds( refillButton.selfBounds.union( refillButton.childBounds ).dilated( 10 ) );
    var updateRefillButton = function() {
      refillButton.enabled = kitCollectionModel.currentKit.hasAtomsOutsideOfBuckets();
    };
    _.each( kitCollectionModel.kits, function( kit ) {
      kit.on( 'addedMolecule', updateRefillButton );
      kit.on( 'removedMolecule', updateRefillButton );
    } );
    kitCollectionModel.currentKitProperty.link( updateRefillButton );
    this.addChild( refillButton );
  }
  buildAMolecule.register( 'KitPanel', KitPanel );

  return inherit( Node, KitPanel );
} );
