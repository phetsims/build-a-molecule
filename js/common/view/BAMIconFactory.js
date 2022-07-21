// Copyright 2020-2022, University of Colorado Boulder

/**
 * Factory to create icons for home screens and the nav-bar.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Image, Rectangle } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../../common/BAMConstants.js';
import MoleculeList from '../../common/model/MoleculeList.js';
import Molecule3DNode from '../../common/view/view3d/Molecule3DNode.js';

// Options for screen icons
const SCREEN_ICON_OPTIONS = {
  maxIconWidthProportion: 1,
  maxIconHeightProportion: 1
};

const BAMIconFactory = {
  /**
   * Create an image for the complete molecule with preferred Image options.
   *
   * @param {CompleteMolecule} completeMolecule
   * @param {number} width
   * @param {number} height
   * @param {number} scale
   * @param {boolean} toCollectionBox
   * @returns {Image}
   */
  createIconImage( completeMolecule, width, height, scale, toCollectionBox ) {
    const moleculeNode = new Molecule3DNode( completeMolecule, new Bounds2( 0, 0, width, height ), false );
    const transformMatrix = Molecule3DNode.initialTransforms[ completeMolecule.getGeneralFormula() ];
    if ( transformMatrix ) {
      moleculeNode.transformMolecule( transformMatrix );
    }
    moleculeNode.draw();
    return new Image( moleculeNode.canvas.toDataURL(), {
      initialWidth: toCollectionBox ? 0 : moleculeNode.canvas.width,
      initialHeight: toCollectionBox ? 0 : moleculeNode.canvas.height,
      scale: scale
    } );
  },

  /**
   * Create the home screen and nav-bar icon for the Single screen.
   *
   * @public
   * @returns {ScreenIcon}
   */
  createSingleScreenIcon() {

    // Create icon from complete Molecule
    const moleculeIcon = BAMIconFactory.createIconImage(
      MoleculeList.H2O,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height,
      0.85,
      false
    );

    const wrapperNode = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
      fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR,
      children: [ moleculeIcon ]
    } );

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
  createMultipleScreenIcon() {

    // Iconize first O2 Molecule
    const moleculeIconOne = BAMIconFactory.createIconImage(
      MoleculeList.O2,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height,
      0.50,
      false
    );

    // Iconize second O2 Molecule
    const moleculeIconTwo = BAMIconFactory.createIconImage(
      MoleculeList.O2,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height,
      0.50,
      false
    );

    // Wrapper node to house molecule icons
    const wrapperNode = new Rectangle(
      0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
        fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR,
        children: [ moleculeIconOne, moleculeIconTwo ]
      } );

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
  createPlaygroundScreenIcon() {

    // Iconize first O2 Molecule
    const moleculeIcon = BAMIconFactory.createIconImage(
      MoleculeList.C2H4O2,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height,
      0.95,
      false
    );

    const wrapperNode = new Rectangle(
      0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
        fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR,
        children: [ moleculeIcon ]
      } );
    moleculeIcon.center = wrapperNode.center.minusXY( 0, 10 );
    return new ScreenIcon( wrapperNode, SCREEN_ICON_OPTIONS );
  }
};

buildAMolecule.register( 'BAMIconFactory', BAMIconFactory );
export default BAMIconFactory;