// Copyright 2013-2015, University of Colorado Boulder

/**
 * Displays a dialog that tells the user that all collection boxes are full.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var Shape = require( 'KITE/Shape' );

  // strings
  var collectionAllFilledString = require( 'string!BUILD_A_MOLECULE/collection.allFilled' );
  var collectionTryWithDifferentMoleculesString = require( 'string!BUILD_A_MOLECULE/collection.tryWithDifferentMolecules' );

  function AllFilledDialogNode( availablePlayAreaBounds, regenerateCallback ) {
    Node.call( this, {} );
    var self = this;

    var smiley = new FaceNode( 120 ).smile();
    this.addChild( smiley );

    var text = new Text( collectionAllFilledString, {
      font: new PhetFont( {
        size: 20,
        weight: 'bold'
      } )
    } );
    this.addChild( text );

    var button = new TextPushButton( collectionTryWithDifferentMoleculesString, {
      listener: function() {
        regenerateCallback();
        self.visible = false;
      },
      font: new PhetFont( {
        size: 18,
        weight: 'bold'
      } ),
      baseColor: Color.ORANGE
    } );
    button.touchArea = Shape.bounds( button.localBounds.dilated( 20 ) );
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
  }
  buildAMolecule.register( 'AllFilledDialogNode', AllFilledDialogNode );

  return inherit( Node, AllFilledDialogNode );
} );
