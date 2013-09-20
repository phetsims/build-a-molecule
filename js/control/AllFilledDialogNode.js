// Copyright 2002-2013, University of Colorado

/**
 * Displays a dialog that tells the user that all collection boxes are full.
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
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TextButton = require( 'SUN/TextButton' );
  
  var AllFilledDialogNode = namespace.AllFilledDialogNode = function( availablePlayAreaBounds, regenerateCallback ) {
    Node.call( this, {} );
    var dialog = this;
    
    var smiley = new FaceNode( 120 ).smile();
    this.addChild( smiley );
    
    var text = new Text( Strings.collection_allFilled, {
      font: new PhetFont( {
        size: 20,
        weight: 'bold'
      } )
    } );
    this.addChild( text );
    
    var button = new TextButton( Strings.collection_tryWithDifferentMolecules, function() {
      regenerateCallback();
      dialog.visible = false;
    }, {
      font: new PhetFont( {
        size: 18,
        weight: 'bold'
      } ),
      rectangleFillUp: Color.ORANGE,
    } );
    this.addChild( button );
    
    // layout
    text.centerX = button.centerX = smiley.centerX = this.centerX;
    text.top = smiley.bottom + 10;
    button.top = text.bottom + 10;
    
    var background = new Rectangle( this.bounds.dilated( 10 ), {
      stroke: 'black',
      fill: Constants.completeBackgroundColor
    } );
    this.insertChild( 0, background );
    
    this.center = Constants.modelViewTransform.modelToViewBounds( availablePlayAreaBounds ).center;
  };

  return inherit( Node, AllFilledDialogNode );
} );
