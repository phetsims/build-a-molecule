// Copyright 2013-2019, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * TODO: custom rotation, ball and stick view, perspective, optimization
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Dialog = require( 'SUN/Dialog' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Molecule3DNode = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const HBox = require( 'SCENERY/nodes/HBox' );

  // strings
  const ballAndStickString = require( 'string!BUILD_A_MOLECULE/ballAndStick' ); // eslint-disable-line string-require-statement-match
  const spaceFillString = require( 'string!BUILD_A_MOLECULE/spaceFilling' ); // eslint-disable-line string-require-statement-match

  const size = 200;
  const optionsHorizontalPadding = 40;

  //REVIEW: Note that this may change significantly if we go with a three.js/webgl solution
  function Molecule3DDialog( completeMolecule, view ) {

    // Holds all of the content within the dialog
    const contentNode = new Node();

    Dialog.call( this, contentNode, {
      modal: true,
      fill: 'black',
      xAlign: 'center',
      title: new Text( completeMolecule.getDisplayName(), {
        font: new PhetFont( 30 ),
        fill: 'white'
      } )
    } );

    // Used for radio buttons
    const viewStyle = new Enumeration( [ 'SPACE_FILL', 'BALL_AND_STICK' ] );
    const viewStyleProperty = new EnumerationProperty( viewStyle, viewStyle.SPACE_FILL );

    // Chemical formula label
    const formulaText = new RichText( completeMolecule.getGeneralFormulaFragment(), {
      font: new PhetFont( 20 ),
      fill: '#bbb',
      centerX: this.center.x,
      top: this.top + 10

    } );
    contentNode.addChild( formulaText );

    // Space fill / Ball and stick radio buttons
    const buttonTextOptions = {
      font: new PhetFont( 20 ),
      fill: 'white'
    };
    const spaceFillText = new Text( spaceFillString, buttonTextOptions );
    const ballAndStickText = new Text( ballAndStickString, buttonTextOptions );

    const radioButtonOptions = {
      selectedColor: 'rgba(255,255,255,0.4)',
      deselectedColor: 'black',
      centerColor: 'white',
      radius: 16,
      xSpacing: 8,
      stroke: 'white'
    };
    const spaceFillButton = new AquaRadioButton( viewStyleProperty, viewStyle.SPACE_FILL, spaceFillText, radioButtonOptions );
    const ballAndStickButton = new AquaRadioButton( viewStyleProperty, viewStyle.BALL_AND_STICK, ballAndStickText, radioButtonOptions );

    const buttonHolder = new HBox( {
      children: [ spaceFillButton, ballAndStickButton ],
      centerX: this.centerX,
      top: this.bottom,
      spacing: optionsHorizontalPadding
    } );

    contentNode.addChild( buttonHolder );

    // REVIEW: Ask for JO input on scaling molecule to fit within dialog. This may change if we use three.js
    /*---------------------------------------------------------------------------*
     * 3D view
     *----------------------------------------------------------------------------*/
    const moleculeNode = new Molecule3DNode( completeMolecule, view.layoutBounds, true );
    // moleculeNode.updateCSSTransform = function( transform, element ) {}; // don't CSS transform it
    // moleculeNode.touchArea = moleculeNode.mouseArea = Shape.bounds( this.getLocalCanvasBounds() );
    moleculeNode.initializeDrag( this );
    // contentNode.addChild( moleculeNode );

    // var transformMatrix = Molecule3DNode.initialTransforms[ completeMolecule.getGeneralFormula() ];
    // if ( transformMatrix ) {
    //   moleculeNode.transformMolecule( transformMatrix );
    // }

    // function updateLayout() {
    //   var sceneWidth = window.innerWidth;
    //   var sceneHeight = window.innerHeight;
    //   var newMatrix = view.getMatrix();
    //   if ( sceneWidth === width && sceneHeight === height && matrix.equals( newMatrix ) ) {
    //     return;
    //   }
    //   width = sceneWidth;
    //   height = sceneHeight;
    //   matrix = newMatrix.copy();
    //
    //   var screenBounds = view.globalToLocalBounds( new Bounds2( 0, 0, width, height ) );
    //   outsideNode.setRectBounds( screenBounds.roundedOut() );
    //   var windowBounds = BAMConstants.STAGE_SIZE.toBounds().eroded( stageWindowPadding );
    //   background.setRectBounds( windowBounds );
    //
    //
    //   moleculeNode.setMoleculeBounds( self.getGlobalCanvasBounds( view ) );
    // }

    // updateLayout();
    // view.on( 'bounds', updateLayout );

    // moleculeNode.draggingProperty.link( function( dragging ) {
    //   var cursor = dragging ? 'scenery-grabbing-pointer' : 'scenery-grab-pointer';
    //   background.cursor = cursor;
    //   moleculeNode.cursor = cursor;
    // } );

    const tick = moleculeNode.tick.bind( moleculeNode );
    const stepEmitter = view.kitCollectionList.stepEmitter;
    stepEmitter.addListener( tick );
    //
    // this.disposeMolecule3DDialog = function() {
    //   view.off( 'bounds', updateLayout );
    //   view.removeChild( self );
    //   stepEmitter.removeListener( tick );
    // };

  }

  buildAMolecule.register( 'Molecule3DDialog', Molecule3DDialog );

  return inherit( Dialog, Molecule3DDialog, {
    getLocalCanvasBounds: function() {
      const centerX = this.center;
      const centerY = this.center;
      return new Bounds2( centerX - size, centerY - size, centerX + size, centerY + size );
    },

    getGlobalCanvasBounds: function( view ) {
      return view.localToGlobalBounds( this.getLocalCanvasBounds() ).roundedOut();
    }
  } );
} );
