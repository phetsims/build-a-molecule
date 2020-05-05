// Copyright 2020, University of Colorado Boulder

/**
 * Displays a node that tells the user that all collection boxes are full. Allows the user
 * to create a new collection.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import Playable from '../../../../tambo/js/Playable.js';
import buildAMolecule from '../../buildAMolecule.js';
import buildAMoleculeStrings from '../../buildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';

class AllFilledDialog extends Dialog {
  /**
   * @param {Property.<Boolean>} buttonClickedProperty
   * @param {function} regenerateCallback
   * @param {Object} [options]
   */
  constructor( buttonClickedProperty, regenerateCallback, options ) {
    options = merge( {
      stroke: new Color( 0, 0, 0 ),
      fill: BAMConstants.COMPLETE_BACKGROUND_COLOR,
      center: Vector2.ZERO,
      bottomMargin: 10,
      cornerRadius: BAMConstants.CORNER_RADIUS,
      layoutStrategy: ( dialog, simBounds, screenBounds, scale ) => {
        this.center = screenBounds.center.times( 1.0 / scale ).minusXY( 75, 75 );
      }
    }, options );

    super( new VBox( {
      spacing: 7,
      align: 'center',
      children: [

        // Add smiley face
        new FaceNode( 120 ).smile(),

        // Add a message regarding the completed collection
        new Text( buildAMoleculeStrings.youCompletedYourCollection, {
          font: new PhetFont( {
            size: 20,
            weight: 'bold'
          } ),
          maxWidth: BAMConstants.TEXT_MAX_WIDTH * 1.5
        } ),

        // Add the next collection button
        new TextPushButton( buildAMoleculeStrings.nextCollection, {
          font: new PhetFont( {
            size: 18,
            weight: 'bold'
          } ),
          maxWidth: BAMConstants.TEXT_MAX_WIDTH * 1.5,
          touchAreaXDilation: 20,
          touchAreaYDilation: 20,
          baseColor: Color.ORANGE,
          soundPlayer: Playable.NO_SOUND,
          listener: () => {
            buttonClickedProperty.value = true;
            regenerateCallback();
            this.hide();
          }
        } )
      ]
    } ), options );
  }
}

buildAMolecule.register( 'AllFilledDialog', AllFilledDialog );
export default AllFilledDialog;