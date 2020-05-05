// Copyright 2020, University of Colorado Boulder

/**
 * Factory to create icons for home screens and the nav-bar.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../../common/BAMConstants.js';
import MoleculeList from '../../common/model/MoleculeList.js';
import Molecule3DNode from '../../common/view/view3d/Molecule3DNode.js';
import Screen from '../../../../joist/js/Screen.js';

// Options for screen icons
const SCREEN_ICON_OPTIONS = {
  maxIconWidthProportion: 1,
  maxIconHeightProportion: 1
};

//REVIEW: Some duplicated code here and with CollectionBoxNode.lookupThumbnail. Can we factor this out?
const BAMIconFactory = {

  /**
   * Create the home screen and nav-bar icon for the Single screen.
   *
   * @public
   * @returns {ScreenIcon}
   */
  createSingleScreen() {

    // Iconize Molecule for home screen and nav-bar
    const wrapperNode = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
      fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR
    } );
    const moleculeNode = new Molecule3DNode(
      MoleculeList.H2O,
      new Bounds2( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height ),
      false
    );
    const transformMatrix = Molecule3DNode.initialTransforms[ MoleculeList.H2O.getGeneralFormula() ];
    if ( transformMatrix ) {
      moleculeNode.transformMolecule( transformMatrix );
    }
    moleculeNode.draw();

    // Create icon from
    const moleculeIcon = new Image( moleculeNode.canvas.toDataURL(), {
      initialWidth: moleculeNode.canvas.width,
      initialHeight: moleculeNode.canvas.height,
      scale: 0.85
    } );
    wrapperNode.addChild( moleculeIcon );

    // Adjust the position of the molecule icon.
    moleculeIcon.center = wrapperNode.center.plusXY( 0, 20 );

    // Return the icon in its wrapper
    return new ScreenIcon( wrapperNode, SCREEN_ICON_OPTIONS );
  },

  /**
   * Create the home screen and nav-bar icon for the Multiple
   *
   * @public
   * @returns {ScreenIcon}
   */
  createMultipleScreen() {

    // Iconize first O2 Molecule
    const moleculeNodeOne = new Molecule3DNode(
      MoleculeList.O2,
      new Bounds2( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height ),
      false
    );
    const transformMatrix = Molecule3DNode.initialTransforms[ MoleculeList.O2.getGeneralFormula() ];
    if ( transformMatrix ) {
      moleculeNodeOne.transformMolecule( transformMatrix );
    }
    moleculeNodeOne.draw();
    const moleculeIconOne = new Image( moleculeNodeOne.canvas.toDataURL(), {
      initialWidth: moleculeNodeOne.canvas.width,
      initialHeight: moleculeNodeOne.canvas.height,
      scale: .50
    } );

    // Iconize second O2 molecule
    const moleculeNodeTwo = new Molecule3DNode(
      MoleculeList.O2,
      new Bounds2( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height ),
      false
    );
    if ( transformMatrix ) {
      moleculeNodeTwo.transformMolecule( transformMatrix );
    }
    moleculeNodeTwo.draw();
    const moleculeIconTwo = new Image( moleculeNodeTwo.canvas.toDataURL(), {
      initialWidth: moleculeNodeOne.canvas.width,
      initialHeight: moleculeNodeOne.canvas.height,
      scale: .50
    } );

    // Wrapper node to house molecule icons
    const wrapperNode = new Rectangle(
      0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
        fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR
      } );
    wrapperNode.addChild( moleculeIconOne );
    wrapperNode.addChild( moleculeIconTwo );

    // Adjust the position of the molecule icons.
    moleculeIconOne.center = wrapperNode.center.minusXY( 125, 0 );
    moleculeIconTwo.center = wrapperNode.center.plusXY( 115, 0 );

    return new ScreenIcon( wrapperNode, SCREEN_ICON_OPTIONS );
  },

  /**
   * Create the home screen and nav-bar icon for the Playground screen.
   *
   * @public
   * @returns {ScreenIcon}
   */
  createPlaygroundScreen() {

    // Iconize Molecule for home screen and nav-bar
    const moleculeNode = new Molecule3DNode(
      MoleculeList.C2H4O2,
      new Bounds2( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height ),
      false
    );
    const transformMatrix = Molecule3DNode.initialTransforms[ MoleculeList.C2H4O2.getGeneralFormula() ];
    if ( transformMatrix ) {
      moleculeNode.transformMolecule( transformMatrix );
    }
    moleculeNode.draw();
    const moleculeIcon = new Image( moleculeNode.canvas.toDataURL(), {
      initialWidth: moleculeNode.canvas.width,
      initialHeight: moleculeNode.canvas.height,
      scale: 0.95
    } );
    const wrapperNode = new Rectangle(
      0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
        fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR
      } );
    wrapperNode.addChild( moleculeIcon );
    moleculeIcon.center = wrapperNode.center.minusXY( 0, 10 );

    return new ScreenIcon( wrapperNode, SCREEN_ICON_OPTIONS );
  }
};

buildAMolecule.register( 'BAMIconFactory', BAMIconFactory );
export default BAMIconFactory;