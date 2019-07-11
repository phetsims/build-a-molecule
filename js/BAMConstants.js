// Copyright 2019, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var VIEW_SIZE = ScreenView.DEFAULT_LAYOUT_BOUNDS;
  var MODEL_VIEW_TRANSFORM = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
    Vector2.ZERO,
    new Vector2( Util.roundSymmetric( VIEW_SIZE.width * 0.5 ), Util.roundSymmetric( VIEW_SIZE.height * 0.5 ) ),
    0.3 * 1.2 // "Zoom factor" - smaller zooms out, larger zooms in
  );
  var MODEL_SIZE = new Dimension2(
    MODEL_VIEW_TRANSFORM.viewToModelDeltaX( VIEW_SIZE.width ),
    Math.abs( MODEL_VIEW_TRANSFORM.viewToModelDeltaY( VIEW_SIZE.height ) )
  );
  var VIEW_PADDING = 18;
  var MODEL_PADDING = MODEL_VIEW_TRANSFORM.viewToModelDeltaX( VIEW_PADDING );

  var BAMConstants = {


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
     * Layout
     *----------------------------------------------------------------------------*/

    BUTTON_PADDING: 5, // vertical space between molecule and name/buttons

    /*---------------------------------------------------------------------------*
     * Misc
     *----------------------------------------------------------------------------*/

    ALLOW_BOND_BREAKING: true,
    SUPPORTED_ELEMENTS: [
      Element.B, Element.Br, Element.C, Element.Cl, Element.F, Element.H, Element.I, Element.N, Element.O, Element.P, Element.S, Element.Si
    ]
  };
  buildAMolecule.register( 'BAMConstants', BAMConstants );

  return BAMConstants;
} );
