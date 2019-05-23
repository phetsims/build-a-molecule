// Copyright 2013-2017, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * TODO: custom rotation, ball and stick view, perspective, optimization
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CloseButton = require( 'BUILD_A_MOLECULE/view/view3d/CloseButton' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Molecule3DNode = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var ballAndStickString = require( 'string!BUILD_A_MOLECULE/ballAndStick' ); // eslint-disable-line string-require-statement-match
  var spaceFillString = require( 'string!BUILD_A_MOLECULE/spaceFilling' ); // eslint-disable-line string-require-statement-match

  var size = 200;
  var verticalOffset = size + 5;
  var stageCenterX = BAMConstants.STAGE_SIZE.width / 2;
  var stageCenterY = BAMConstants.STAGE_SIZE.height / 2;
  var optionsHorizontalPadding = 40;

  //REVIEW: Note that this may change significantly if we go with a three.js/webgl solution
  //REVIEW: Also, can we just use a Dialog?
  function Molecule3DDialog( completeMolecule, trail, view ) {
    var self = this;
    Node.call( this );

    this.initialTrail = trail;

    var outsideNode = new Rectangle( 0, 0, 50, 50, { fill: 'rgba(0,0,0,0.5)' } );
    outsideNode.addInputListener( {
      down: function( event ) {
        self.disposeMolecule3DDialog();
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
    var formulaText = new RichText( completeMolecule.getGeneralFormulaFragment(), {
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

    var closeButton = new CloseButton( function() { self.disposeMolecule3DDialog(); }, {
      centerX: BAMConstants.STAGE_SIZE.width - stageWindowPadding,
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
      var windowBounds = BAMConstants.STAGE_SIZE.toBounds().eroded( stageWindowPadding );
      background.setRectBounds( windowBounds );

      var backgroundGradient = new RadialGradient( windowBounds.centerX, windowBounds.centerY, 0,
        windowBounds.centerX, windowBounds.centerY, Math.max( windowBounds.centerX, windowBounds.centerY ) );
      backgroundGradient.addColorStop( 0, 'rgba(0,0,0,0.95)' );
      backgroundGradient.addColorStop( 1, 'rgba(0,0,0,0.85)' );

      background.fill = backgroundGradient;

      moleculeNode.setMoleculeBounds( self.getGlobalCanvasBounds( view ) );
    }

    updateLayout();
    view.on( 'bounds', updateLayout );

    moleculeNode.draggingProperty.link( function( dragging ) {
      var cursor = dragging ? 'scenery-grabbing-pointer' : 'scenery-grab-pointer';
      background.cursor = cursor;
      moleculeNode.cursor = cursor;
    } );

    var tick = moleculeNode.tick.bind( moleculeNode );
    var stepEmitter = view.kitCollectionList.stepEmitter;
    stepEmitter.addListener( tick );

    this.disposeMolecule3DDialog = function() {
      view.off( 'bounds', updateLayout );
      view.removeChild( self );
      stepEmitter.removeListener( tick );
    };
  }
  buildAMolecule.register( 'Molecule3DDialog', Molecule3DDialog );

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
