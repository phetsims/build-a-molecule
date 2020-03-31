// Copyright 2020, University of Colorado Boulder

/**
 * Displays a node that tells the user that all collection boxes are full. Allows the user
 * to create a new collection.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import Playable from '../../../../tambo/js/Playable.js';
import buildAMoleculeStrings from '../../buildAMoleculeStrings.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

const nextCollectionString = buildAMoleculeStrings.nextCollection;
const youCompletedYourCollectionString = buildAMoleculeStrings.youCompletedYourCollection;

class AllFilledDialog extends Dialog {
  /**
   * @param {BooleanProperty} buttonClickedProperty
   * @param {Function} regenerateCallback
   * @param {Object} [options]
   * @constructor
   */
  constructor( buttonClickedProperty, regenerateCallback, options ) {
    options = merge( {
      stroke: new Color( 0, 0, 0 ),
      fill: BAMConstants.COMPLETE_BACKGROUND_COLOR,
      center: new Vector2( 0, 0 ),
      bottomMargin: 10,
      cornerRadius: BAMConstants.CORNER_RADIUS
    }, options );
    const contentVBox = new VBox( { spacing: 7, align: 'center' } );

    // Add smiley face
    const smiley = new FaceNode( 120 ).smile();
    contentVBox.addChild( smiley );

    // Add text
    const text = new Text( youCompletedYourCollectionString, {
      font: new PhetFont( {
        size: 20,
        weight: 'bold',
        maxWidth: BAMConstants.TEXT_MAX_WIDTH
      } )
    } );
    contentVBox.addChild( text );

    // Add button
    const button = new TextPushButton( nextCollectionString, {
      font: new PhetFont( {
        size: 18,
        weight: 'bold',
        maxWidth: BAMConstants.TEXT_MAX_WIDTH
      } ),
      baseColor: Color.ORANGE,
      soundPlayer: Playable.NO_SOUND
    } );
    button.touchArea = Shape.bounds( button.localBounds.dilated( 20 ) );
    contentVBox.addChild( button );
    super( contentVBox, options );

    // @private
    button.addListener( () => {
      buttonClickedProperty.value = true;
      regenerateCallback();
      this.hide();
    } );
  }
}

buildAMolecule.register( 'AllFilledDialog', AllFilledDialog );
export default AllFilledDialog;