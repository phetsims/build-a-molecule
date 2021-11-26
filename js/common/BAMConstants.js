// Copyright 2020-2021, University of Colorado Boulder

import Dimension2 from '../../../dot/js/Dimension2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import Element from '../../../nitroglycerin/js/Element.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import { Color } from '../../../scenery/js/imports.js';
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
   * Layout
   *----------------------------------------------------------------------------*/

  MODEL_VIEW_TRANSFORM: MODEL_VIEW_TRANSFORM,
  MODEL_SIZE: MODEL_SIZE,
  VIEW_PADDING: VIEW_PADDING,
  MODEL_PADDING: MODEL_PADDING,
  TEXT_MAX_WIDTH: 200,
  CORNER_RADIUS: 4,

  /*---------------------------------------------------------------------------*
   * Colors
   *----------------------------------------------------------------------------*/
  PLAY_AREA_BACKGROUND_COLOR: new Color( 198, 226, 246 ),      // main play area background
  MOLECULE_COLLECTION_BACKGROUND: new Color( 238, 238, 238 ), // collection area background
  MOLECULE_COLLECTION_BOX_HIGHLIGHT: Color.YELLOW,             // box highlight (border when it's full)
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
  SUPPORTED_ELEMENTS: [
    Element.B, Element.Br, Element.C, Element.Cl, Element.F, Element.H, Element.I, Element.N, Element.O, Element.P, Element.S, Element.Si
  ]
};

buildAMolecule.register( 'BAMConstants', BAMConstants );
export default BAMConstants;