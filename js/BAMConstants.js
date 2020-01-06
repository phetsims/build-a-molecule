// Copyright 2019, University of Colorado Boulder

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Element = require( 'NITROGLYCERIN/Element' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Utils = require( 'DOT/Utils' );
  const Vector2 = require( 'DOT/Vector2' );

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

    HAS_3D: true,

    /*---------------------------------------------------------------------------*
     * Layout
     *----------------------------------------------------------------------------*/

    STAGE_SIZE: VIEW_SIZE, // the size of our "view" coordinate area
    MODEL_VIEW_TRANSFORM: MODEL_VIEW_TRANSFORM,
    MODEL_SIZE: MODEL_SIZE,
    VIEW_PADDING: VIEW_PADDING,
    MODEL_PADDING: MODEL_PADDING,
    TEXT_MAX_WIDTH: 200,
    BUTTON_PADDING: 5, // vertical space between molecule and name/buttons
    RESET_BUTTON_RADIUS: 27,
    KIT_VIEW_HEIGHT: 148, // empirically determined as the height of the tallest bucket of atoms
    KIT_VIEW_WIDTH: 655, // empirically determined as the width of the kit panel,

    /*---------------------------------------------------------------------------*
     * Colors
     *----------------------------------------------------------------------------*/

    CANVAS_BACKGROUND_COLOR: new Color( 198, 226, 246 ),      // main play area background
    MOLECULE_COLLECTION_BACKGROUND: new Color( 238, 238, 238 ), // collection area background
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
    ALLOW_BOND_BREAKING: true,
    SUPPORTED_ELEMENTS: [
      Element.B, Element.Br, Element.C, Element.Cl, Element.F, Element.H, Element.I, Element.N, Element.O, Element.P, Element.S, Element.Si
    ]
  };

  return buildAMolecule.register( 'BAMConstants', BAMConstants );
} );
