// Copyright 2020, University of Colorado Boulder

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import Element from '../../../nitroglycerin/js/Element.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Color from '../../../scenery/js/util/Color.js';
import buildAMolecule from '../buildAMolecule.js';

// constants
const VIEW_SIZE = ScreenView.DEFAULT_LAYOUT_BOUNDS;
const MODEL_VIEW_TRANSFORM = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
  Vector2.ZERO,
  new Vector2( Utils.roundSymmetric( VIEW_SIZE.width * 0.5 ), Utils.roundSymmetric( VIEW_SIZE.height * 0.5 ) ),
  0.27 * 1.2 // "Zoom factor" - smaller zooms out, larger zooms in
);
const MODEL_SIZE = new Dimension2(
  MODEL_VIEW_TRANSFORM.viewToModelDeltaX( VIEW_SIZE.width ),
  Math.abs( MODEL_VIEW_TRANSFORM.viewToModelDeltaY( VIEW_SIZE.height ) )
);
const VIEW_PADDING = 18;
const MODEL_PADDING = MODEL_VIEW_TRANSFORM.viewToModelDeltaX( VIEW_PADDING );

const BAMConstants = {


  /*---------------------------------------------------------------------------*
   * Features
   *----------------------------------------------------------------------------*/

  //REVIEW: This is always true, presumably we can remove it?
  HAS_3D: true,

  /*---------------------------------------------------------------------------*
   * Layout
   *----------------------------------------------------------------------------*/

  //REVIEW: I don't see why we're using a constant here, instead of using the ScreenView's layoutBounds in each use of this
  STAGE_SIZE: VIEW_SIZE, // the size of our "view" coordinate area
  MODEL_VIEW_TRANSFORM: MODEL_VIEW_TRANSFORM,
  MODEL_SIZE: MODEL_SIZE,
  VIEW_PADDING: VIEW_PADDING,
  MODEL_PADDING: MODEL_PADDING,
  TEXT_MAX_WIDTH: 200,
  //REVIEW: I only see one usage of BUTTON_PADDING, can it be inlined?
  BUTTON_PADDING: 5, // vertical space between molecule and name/buttons
  //REVIEW: I don't see a usage of RESET_BUTTON_RADIUS
  RESET_BUTTON_RADIUS: 27,
  CORNER_RADIUS: 4,

  //REVIEW: I only see one usage of the kit view width/height, can we move these to the usage, or is there a reason they are factored out?
  KIT_VIEW_HEIGHT: 148, // empirically determined as the height of the tallest bucket of atoms
  KIT_VIEW_WIDTH: 655, // empirically determined as the width of the kit panel,

  /*---------------------------------------------------------------------------*
   * Colors
   *----------------------------------------------------------------------------*/

  //REVIEW: I dont' see a usage of SCREEN_OPTIONS, can we remove it?
  SCREEN_OPTIONS: { backgroundColorProperty: new Property( new Color( 198, 226, 246 ) ) },
  //REVIEW: What is the purpose of the word "canvas" here?
  CANVAS_BACKGROUND_COLOR: new Color( 198, 226, 246 ),      // main play area background
  MOLECULE_COLLECTION_BACKGROUND: new Color( 238, 238, 238 ), // collection area background
  //REVIEW: I don't see a usage of MOLECULE_COLLECTION_BORDER
  MOLECULE_COLLECTION_BORDER: Color.BLACK,                    // border around the collection area
  MOLECULE_COLLECTION_BOX_HIGHLIGHT: Color.YELLOW,             // box highlight (border when it's full)
  MOLECULE_COLLECTION_BOX_BACKGROUND: Color.BLACK,             // box background
  MOLECULE_COLLECTION_BOX_BACKGROUND_BLINK: Color.BLACK,        // box background while blinking
  MOLECULE_COLLECTION_BOX_BORDER_BLINK: Color.BLUE,             // box border when blinking
  KIT_BACKGROUND: Color.WHITE,                               // kit area background
  KIT_BORDER: Color.BLACK,                                   // border around the kit area
  KIT_ARROW_BACKGROUND_ENABLED: Color.YELLOW,                  // kit next/prev arrow background
  KIT_ARROW_BORDER_ENABLED: Color.BLACK,                       // kit next/prev arrow border
  COMPLETE_BACKGROUND_COLOR: new Color( 238, 238, 238 ),      // background when complete

  /*---------------------------------------------------------------------------*
   * Misc
   *----------------------------------------------------------------------------*/

  DRAG_LENGTH_THRESHOLD: 5000,
  //REVIEW: Can we remove this, since it's constant now?
  ALLOW_BOND_BREAKING: true,
  SUPPORTED_ELEMENTS: [
    Element.B, Element.Br, Element.C, Element.Cl, Element.F, Element.H, Element.I, Element.N, Element.O, Element.P, Element.S, Element.Si
  ]
};

buildAMolecule.register( 'BAMConstants', BAMConstants );
export default BAMConstants;