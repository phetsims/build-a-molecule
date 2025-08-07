// Copyright 2020-2025, University of Colorado Boulder

/**
 * Displays a node that tells the user that all collection boxes are full. Allows the user
 * to create a new collection.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Property from '../../../../axon/js/Property.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import BAMConstants from '../BAMConstants.js';

type SelfOptions = {
  // No additional options for this dialog
};

export type AllFilledDialogOptions = SelfOptions;

class AllFilledDialog extends Dialog {

  /**
   * @param buttonClickedProperty - Property to track if the button was clicked
   * @param regenerateCallback - Callback function to regenerate the collection
   * @param providedOptions - Dialog options
   */
  public constructor( buttonClickedProperty: Property<boolean>, regenerateCallback: () => void, providedOptions?: AllFilledDialogOptions ) {
    const options = optionize<AllFilledDialogOptions, SelfOptions>()( {
      stroke: new Color( 0, 0, 0 ),
      fill: BAMConstants.COMPLETE_BACKGROUND_COLOR,
      center: Vector2.ZERO,
      bottomMargin: 10,
      cornerRadius: BAMConstants.CORNER_RADIUS,
      layoutStrategy: ( dialog: Dialog, simBounds: Bounds2, screenBounds: Bounds2, scale: number ) => {
        dialog.center = dialog.layoutBounds!.center.minusXY( 75, 75 );
      }
    }, providedOptions );

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