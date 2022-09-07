// Copyright 2020-2022, University of Colorado Boulder

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
import { Color, Text, VBox } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import nullSoundPlayer from '../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
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
        this.center = dialog.layoutBounds.center.minusXY( 75, 75 );
      }
    }, options );

    super( new VBox( {
      spacing: 7,
      align: 'center',
      children: [

        // Add smiley face
        new FaceNode( 120 ).smile(),

        // Add a message regarding the completed collection
        new Text( BuildAMoleculeStrings.youCompletedYourCollection, {
          font: new PhetFont( {
            size: 20,
            weight: 'bold'
          } ),
          maxWidth: BAMConstants.TEXT_MAX_WIDTH * 1.5
        } ),

        // Add the next collection button
        new TextPushButton( BuildAMoleculeStrings.nextCollection, {
          font: new PhetFont( {
            size: 18,
            weight: 'bold'
          } ),
          maxWidth: BAMConstants.TEXT_MAX_WIDTH * 1.5,
          touchAreaXDilation: 20,
          touchAreaYDilation: 20,
          baseColor: Color.ORANGE,
          soundPlayer: nullSoundPlayer,
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