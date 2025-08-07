// Copyright 2020-2025, University of Colorado Boulder

/**
 * Factory to create icons for home screens and the nav-bar.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../../common/BAMConstants.js';
import CompleteMolecule from '../../common/model/CompleteMolecule.js';
import { COMMON_MOLECULES } from '../model/MoleculeList.js';
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
   * @param completeMolecule - The molecule to create an icon for
   * @param width - The width of the icon area
   * @param height - The height of the icon area
   * @param scale - The scaling factor
   * @param toCollectionBox - Whether this icon is for a collection box
   * @returns The molecule icon image
   */
  createIconImage( completeMolecule: CompleteMolecule, width: number, height: number, scale: number, toCollectionBox: boolean ): Image {
    const moleculeNode = new Molecule3DNode( completeMolecule, new Bounds2( 0, 0, width, height ), false );
    const transformMatrix = ( Molecule3DNode ).initialTransforms[ completeMolecule.getGeneralFormula() ];
    if ( transformMatrix ) {
      ( moleculeNode ).transformMolecule( transformMatrix );
    }
    ( moleculeNode ).draw();
    return new Image( ( moleculeNode ).canvas.toDataURL(), {
      initialWidth: toCollectionBox ? 0 : ( moleculeNode ).canvas.width,
      initialHeight: toCollectionBox ? 0 : ( moleculeNode ).canvas.height,
      scale: scale
    } );
  },

  /**
   * Create the home screen and nav-bar icon for the Single screen.
   *
   * @returns The Single screen icon
   */
  createSingleScreenIcon(): ScreenIcon {

    // Create icon from complete Molecule
    const moleculeIcon = BAMIconFactory.createIconImage(
      COMMON_MOLECULES.H2O,
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
   * Create the home screen and nav-bar icon for the Multiple screen.
   *
   * @returns The Multiple screen icon
   */
  createMultipleScreenIcon(): ScreenIcon {

    // Iconize first O2 Molecule
    const moleculeIconOne = BAMIconFactory.createIconImage(
      COMMON_MOLECULES.O2,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width,
      Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height,
      0.50,
      false
    );

    // Iconize second O2 Molecule
    const moleculeIconTwo = BAMIconFactory.createIconImage(
      COMMON_MOLECULES.O2,
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
   * @returns The Playground screen icon
   */
  createPlaygroundScreenIcon(): ScreenIcon {

    // Iconize first O2 Molecule
    const moleculeIcon = BAMIconFactory.createIconImage(
      COMMON_MOLECULES.C2H4O2,
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