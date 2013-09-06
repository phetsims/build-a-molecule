// Copyright 2002-2013, University of Colorado

define( function( require ) {
  'use strict';
  
  var namespace = require( 'BAM/namespace' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Color = require( 'SCENERY/util/Color' );
  
  namespace.Constants = {
    /*---------------------------------------------------------------------------*
    * Colors
    *----------------------------------------------------------------------------*/
    
    canvasBackgroundColor:                new Color( 198, 226, 246 ), // main play area background
    moleculeCollectionBackground:         new Color( 238, 238, 238 ), // collection area background
    moleculeCollectionBorder:             Color.BLACK,                // border around the collection area
    moleculeCollectionBoxHighlight:       Color.YELLOW,               // box highlight (border when it's full)
    moleculeCollectionBoxBackground:      Color.BLACK,                // box background
    moleculeCollectionBoxBackgroundBlink: Color.BLACK,                // box background while blinking
    moleculeCollectionBoxBorderBlink:     Color.BLUE,                 // box border when blinking
    kitBackground:                        Color.WHITE,                // kit area background
    kitBorder:                            Color.BLACK,                // border around the kit area
    kitArrowBackgroundEnabled:            Color.YELLOW,               // kit next/prev arrow background
    kitArrowBorderEnabled:                Color.BLACK,                // kit next/prev arrow border
    completeBackgroundColor:              new Color( 238, 238, 238 ), // background when complete
    
    /*---------------------------------------------------------------------------*
    * Layout
    *----------------------------------------------------------------------------*/
    
    metadataPaddingBetweenNodeAndMolecule: 5, // vertical space between molecule and name/buttons
    
    /*---------------------------------------------------------------------------*
    * Misc
    *----------------------------------------------------------------------------*/
    
    supportedElements: [
      Element.B, Element.Br, Element.C, Element.Cl, Element.F, Element.H, Element.I, Element.N, Element.O, Element.P, Element.S, Element.Si
    ]
  };
  
  return namespace.Constants;
} );
