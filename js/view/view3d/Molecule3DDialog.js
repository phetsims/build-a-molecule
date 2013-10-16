// Copyright 2002-2013, University of Colorado

/**
 * 3D Molecule display that takes up the entire screen
 *
 * TODO: custom rotation, ball and stick view, perspective, optimization
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Molecule3DNode = require( 'BAM/view/view3d/Molecule3DNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector3 = require( 'DOT/Vector3' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Bounds3 = require( 'DOT/Bounds3' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Quaternion = require( 'DOT/Quaternion' );
  var Node = require( 'SCENERY/nodes/Node' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );
  var Shape = require( 'KITE/Shape' );
  var Arc = require( 'KITE/segments/Arc' );
  var EllipticalArc = require( 'KITE/segments/EllipticalArc' );
  var DotUtil = require( 'DOT/Util' );
  var Ray3 = require( 'DOT/Ray3' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Property = require( 'AXON/Property' );
  var spaceFillString = require( 'string!BAM/3d.spaceFilling' );
  var ballAndStickString = require( 'string!BAM/3d.ballAndStick' );
  
  var size = 200;
  var verticalOffset = size + 15;
  var stageCenterX = Constants.stageSize.width / 2;
  var stageCenterY = Constants.stageSize.height / 2;
  var optionsHorizontalPadding = 40;
  
  var Molecule3DDialog = namespace.Molecule3DDialog = function Molecule3DDialog( completeMolecule, trail ) {
    var that = this;
    Node.call( this, { renderer: 'svg' } );
    
    this.initialTrail = trail;
    
    var scene = trail.rootNode();
    var view = _.find( trail.nodes, function( node ) { return node.isBAMView; } );
    
    var viewChild = new Node();
    
    var background = new Rectangle( 0, 0, 50, 50, { fill: 'rgba(0,0,0,0.85)' } );
    this.addChild( background );
    
    var width = 0;
    var height = 0;
    var matrix = trail.getMatrix();
    
    var viewStyleProperty = new Property( 'spaceFill' ); // spaceFill or ballAndStick
    
    var moleculeNode = new Molecule3DNode( completeMolecule, this.getGlobalCanvasBounds( view ), true );
    this.addChild( viewChild );
    this.addChild( moleculeNode );
    
    var transformMatrix = Molecule3DNode.initialTransforms[completeMolecule.getGeneralFormula()];
    if ( transformMatrix ) {
      moleculeNode.transformMolecule( transformMatrix );
    }
    
    /*---------------------------------------------------------------------------*
    * Chemical formula label
    *----------------------------------------------------------------------------*/
    var formulaText = new HTMLText( completeMolecule.getGeneralFormulaFragment(), {
      font: new PhetFont( 20 ),
      fill: '#bbb',
      centerX: stageCenterX,
      bottom: stageCenterY - verticalOffset
    } );
    viewChild.addChild( formulaText );
    
    /*---------------------------------------------------------------------------*
    * Display name label
    *----------------------------------------------------------------------------*/
    var nameText = new Text( completeMolecule.getDisplayName(), {
      font: new PhetFont( 30 ),
      fill: 'white',
      centerX: stageCenterX,
      bottom: formulaText.top - 5
    } );
    viewChild.addChild( nameText );
    
    /*---------------------------------------------------------------------------*
    * Space fill / Ball and stick radio buttons
    *----------------------------------------------------------------------------*/
    
    var buttonTextOptions = {
      font: new PhetFont( 22 ),
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
      children: [spaceFillButton, ballAndStickButton],
      centerX: stageCenterX,
      top: stageCenterY + verticalOffset
    } );
    buttonHolder.addInputListener( {
      up: function( evt ) {
        evt.handle();
      }
    } );
    buttonHolder.touchArea = Shape.bounds( buttonHolder.localBounds.dilated( 20 ) );
    viewChild.addChild( buttonHolder );
    
    function updateLayout() {
      var sceneWidth = window.innerWidth;
      var sceneHeight = window.innerHeight;
      var newMatrix = trail.getMatrix();
      if ( sceneWidth === width && sceneHeight === height && matrix.equals( newMatrix ) ) {
        return;
      }
      width = sceneWidth;
      height = sceneHeight;
      matrix = newMatrix;
      
      background.rectWidth = width;
      background.rectHeight = height;
      
      var backgroundGradient = new RadialGradient( width / 2, height / 2, 0, width / 2, height / 2, Math.max( width / 2, height / 2 ) );
      backgroundGradient.addColorStop( 0, 'rgba(0,0,0,0.95)' );
      backgroundGradient.addColorStop( 1, 'rgba(0,0,0,0.85)' );
      
      background.fill = backgroundGradient;
      
      viewChild.matrix = view.getMatrix();
      
      moleculeNode.setMoleculeBounds( that.getGlobalCanvasBounds( view ) );
    }
    updateLayout();
    scene.addEventListener( 'resize', updateLayout );
    view.addEventListener( 'bounds', updateLayout );
    
    var tick = moleculeNode.tick.bind( moleculeNode );
    namespace.timeTick.on( 'tick', tick );
    
    this.addInputListener( {
      up: function( event ) {
        scene.removeEventListener( 'resize', updateLayout );
        view.removeEventListener( 'bounds', updateLayout );
        scene.removeChild( that );
        namespace.timeTick.off( 'tick', tick );
        that.removeChild( viewChild );
      }
    } );
  };

  return inherit( Node, Molecule3DDialog, {
    getGlobalCanvasBounds: function( view ) {
      var centerX = stageCenterX;
      var centerY = stageCenterY;
      var bounds = new Bounds2( centerX - size, centerY - size, centerX + size, centerY + size );
      return view.localToGlobalBounds( bounds ).roundedOut();
    }
  } );
} );
