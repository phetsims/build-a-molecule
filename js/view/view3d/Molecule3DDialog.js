// Copyright 2002-2014, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * TODO: custom rotation, ball and stick view, perspective, optimization
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BUILD_A_MOLECULE/namespace' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var Molecule3DNode = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DNode' );
  var CloseButton = require( 'BUILD_A_MOLECULE/view/view3d/CloseButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Property = require( 'AXON/Property' );

  // strings
  var spaceFillString = require( 'string!BUILD_A_MOLECULE/3d.spaceFilling' );
  var ballAndStickString = require( 'string!BUILD_A_MOLECULE/3d.ballAndStick' );

  var size = 200;
  var verticalOffset = size + 5;
  var stageCenterX = Constants.stageSize.width / 2;
  var stageCenterY = Constants.stageSize.height / 2;
  var optionsHorizontalPadding = 40;

  var Molecule3DDialog = namespace.Molecule3DDialog = function Molecule3DDialog( completeMolecule, trail, view ) {
    var dialog = this;
    Node.call( this );

    this.initialTrail = trail;

    var scene = trail.rootNode();

    var outsideNode = new Rectangle( 0, 0, 50, 50, { fill: 'rgba(0,0,0,0.5)' } );
    outsideNode.addInputListener( {
      down: function( event ) {
        dialog.disposeView();
      }
    } );
    this.addChild( outsideNode );

    var background = new Rectangle( 0, 0, 50, 50, { fill: 'rgba(0,0,0,0.85)' } );
    this.addChild( background );

    var width = 0;
    var height = 0;
    var matrix = trail.getMatrix().copy();
    var stageWindowPadding = 35;

    var viewStyleProperty = new Property( 'spaceFill' ); // spaceFill or ballAndStick

    /*---------------------------------------------------------------------------*
     * Chemical formula label
     *----------------------------------------------------------------------------*/
    var formulaText = new SubSupText( completeMolecule.getGeneralFormulaFragment(), {
      font: new PhetFont( 20 ),
      fill: '#bbb',
      centerX: stageCenterX,
      bottom: stageCenterY - verticalOffset
    } );
    this.addChild( formulaText );

    /*---------------------------------------------------------------------------*
     * Display name label
     *----------------------------------------------------------------------------*/
    var nameText = new Text( completeMolecule.getDisplayName(), {
      font: new PhetFont( 30 ),
      fill: 'white',
      centerX: stageCenterX,
      bottom: formulaText.top - 5
    } );
    this.addChild( nameText );

    /*---------------------------------------------------------------------------*
     * Space fill / Ball and stick radio buttons
     *----------------------------------------------------------------------------*/

    var buttonTextOptions = {
      font: new PhetFont( 20 ),
      fill: 'white'
    };
    var spaceFillText = new Text( spaceFillString, buttonTextOptions );
    var ballAndStickText = new Text( ballAndStickString, buttonTextOptions );

    var radioButtonOptions = {
      selectedColor: 'rgba(255,255,255,0.4)', // fill
      deselectedColor: 'black', // center
      centerColor: 'white', // center
      radius: 16,
      xSpacing: 8,
      stroke: 'white' // border
    };
    var spaceFillButton = new AquaRadioButton( viewStyleProperty, 'spaceFill', spaceFillText, radioButtonOptions );
    spaceFillButton.touchArea = Shape.bounds( spaceFillButton.localBounds.dilated( optionsHorizontalPadding / 2 ) );
    var ballAndStickButton = new AquaRadioButton( viewStyleProperty, 'ballAndStick', ballAndStickText, radioButtonOptions );
    ballAndStickButton.touchArea = Shape.bounds( ballAndStickButton.localBounds.dilated( optionsHorizontalPadding / 2 ) );
    ballAndStickButton.left = spaceFillButton.right + optionsHorizontalPadding;
    var buttonHolder = new Node( {
      children: [ spaceFillButton, ballAndStickButton ],
      centerX: stageCenterX,
      top: stageCenterY + verticalOffset
    } );
    buttonHolder.addInputListener( {
      // don't start drags on the close button
      down: function( evt ) {
        evt.handle();
      }
    } );
    buttonHolder.touchArea = Shape.bounds( buttonHolder.localBounds.dilated( 20 ) );
    this.addChild( buttonHolder );

    /*---------------------------------------------------------------------------*
     * Close button
     *----------------------------------------------------------------------------*/

    var closeButton = new CloseButton( function() { dialog.disposeView(); }, {
      centerX: Constants.stageSize.width - stageWindowPadding,
      centerY: stageWindowPadding
    } );
    closeButton.addInputListener( {
      // don't start drags on the close button
      down: function( event ) { event.handle(); }
    } );
    this.addChild( closeButton );

    /*---------------------------------------------------------------------------*
     * 3D view
     *----------------------------------------------------------------------------*/
    var moleculeNode = new Molecule3DNode( completeMolecule, this.getGlobalCanvasBounds( view ), true );
    moleculeNode.updateCSSTransform = function( transform, element ) {}; // don't CSS transform it
    moleculeNode.touchArea = moleculeNode.mouseArea = Shape.bounds( this.getLocalCanvasBounds() );
    moleculeNode.initializeDrag( this );
    this.addChild( moleculeNode );

    var transformMatrix = Molecule3DNode.initialTransforms[ completeMolecule.getGeneralFormula() ];
    if ( transformMatrix ) {
      moleculeNode.transformMolecule( transformMatrix );
    }

    function updateLayout() {
      var sceneWidth = window.innerWidth;
      var sceneHeight = window.innerHeight;
      var newMatrix = view.getMatrix();
      if ( sceneWidth === width && sceneHeight === height && matrix.equals( newMatrix ) ) {
        return;
      }
      width = sceneWidth;
      height = sceneHeight;
      matrix = newMatrix.copy();

      var screenBounds = view.globalToLocalBounds( new Bounds2( 0, 0, width, height ) );
      outsideNode.setRectBounds( screenBounds.roundedOut() );
      var windowBounds = Constants.stageSize.toBounds().eroded( stageWindowPadding );
      background.setRectBounds( windowBounds );

      var backgroundGradient = new RadialGradient( windowBounds.centerX, windowBounds.centerY, 0,
        windowBounds.centerX, windowBounds.centerY, Math.max( windowBounds.centerX, windowBounds.centerY ) );
      backgroundGradient.addColorStop( 0, 'rgba(0,0,0,0.95)' );
      backgroundGradient.addColorStop( 1, 'rgba(0,0,0,0.85)' );

      background.fill = backgroundGradient;

      moleculeNode.setMoleculeBounds( dialog.getGlobalCanvasBounds( view ) );
    }

    updateLayout();
    scene.addEventListener( 'resize', updateLayout );
    view.addEventListener( 'bounds', updateLayout );

    moleculeNode.draggingProperty.link( function( dragging ) {
      var cursor = dragging ? 'scenery-grabbing-pointer' : 'scenery-grab-pointer';
      background.cursor = cursor;
      moleculeNode.cursor = cursor;
    } );

    var tick = moleculeNode.tick.bind( moleculeNode );
    var clock = view.collectionList.clock;
    clock.on( 'tick', tick );

    this.disposeView = function() {
      scene.removeEventListener( 'resize', updateLayout );
      view.removeEventListener( 'bounds', updateLayout );
      view.removeChild( dialog );
      clock.off( 'tick', tick );
    };
  };

  return inherit( Node, Molecule3DDialog, {
    getLocalCanvasBounds: function() {
      var centerX = stageCenterX;
      var centerY = stageCenterY;
      return new Bounds2( centerX - size, centerY - size, centerX + size, centerY + size );
    },

    getGlobalCanvasBounds: function( view ) {
      return view.localToGlobalBounds( this.getLocalCanvasBounds() ).roundedOut();
    }
  } );
} );
