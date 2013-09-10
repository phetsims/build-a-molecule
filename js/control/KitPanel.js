// Copyright 2002-2013, University of Colorado

/**
 * Contains the kit background and controls for switching between kits
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Strings = require( 'BAM/Strings' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );
  var NextPreviousNavigationNode = require( 'SCENERY_PHET/NextPreviousNavigationNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var TextButton = require( 'SUN/TextButton' );
  
  var kitArrowYOffset = 5; // vertical offset of the kit arrows from the top of the kit

  var KitPanel = namespace.KitPanel = function( kitCollectionModel, availableKitBounds ) {
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
      labelNode.text = StringUtils.format( Strings.kit_label, kitCollectionModel.currentKitIndex + 1 );
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
      }
    } );
    kitCollectionModel.currentKitProperty.link( function() {
      navigationNode.hasNext = kitCollectionModel.hasNextKit();
      navigationNode.hasPrevious = kitCollectionModel.hasPreviousKit();
    } );
    navigationNode.setTranslation( kitViewBounds.maxX - navigationNode.width - 5, kitViewBounds.minY + kitArrowYOffset );
    this.addChild( navigationNode );

    /*---------------------------------------------------------------------------*
    * refill kit
    *----------------------------------------------------------------------------*/
    
    var refillButton = new TextButton( Strings.kit_resetKit, function() {
      kitCollectionModel.currentKit.resetKit();
    }, {
      rectangleFillUp: Color.ORANGE,
      font: new PhetFont( { size: 12, weight: 'bold' } ),
      x: kitViewBounds.minX + 5,
      y: kitViewBounds.minY + 5
    } );
    var updateRefillButton = function() {
      refillButton.enabled = kitCollectionModel.currentKit.hasAtomsOutsideOfBuckets();
    };
    _.each( kitCollectionModel.kits, function( kit ) {
      kit.on( 'addedMolecule', updateRefillButton );
      kit.on( 'removedMolecule', updateRefillButton );
    } );
    kitCollectionModel.currentKitProperty.link( updateRefillButton );
    this.addChild( refillButton );
  };

  return inherit( Node, KitPanel );
} );
