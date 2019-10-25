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
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const ThreeNode = require( 'MOBIUS/ThreeNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const ballAndStickString = require( 'string!BUILD_A_MOLECULE/ballAndStick' ); // eslint-disable-line string-require-statement-match
  const spaceFillString = require( 'string!BUILD_A_MOLECULE/spaceFilling' ); // eslint-disable-line string-require-statement-match

  const size = 200;
  const optionsHorizontalPadding = 40;

  function Molecule3DDialog( completeMolecule ) {

    // Holds all of the content within the dialog
    const contentVBox = new VBox( { spacing: 12 } );

    Dialog.call( this, contentVBox, {
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
      fill: '#bbb'
    } );

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
      spacing: optionsHorizontalPadding
    } );

    // @private 3D view of moleculeNode using mobuis supported elements
    this.moleculeNode = new ThreeNode( 70, 70 );
    const moleculeScene = this.moleculeNode.stage.threeScene;

    moleculeScene.add( new THREE.Mesh(
      new THREE.SphereGeometry( 4, 30, 24 ), new THREE.MeshLambertMaterial( {
        color: 0xffaa44
      } ) ) );

    // Lights taken from MoleculeShapesScreenView.js
    const ambientLight = new THREE.AmbientLight( 0x191919 ); // closest to 0.1 like the original shader
    moleculeScene.add( ambientLight );

    const sunLight = new THREE.DirectionalLight( 0xffffff, 0.8 * 0.9 );
    sunLight.position.set( -1.0, 0.5, 2.0 );
    moleculeScene.add( sunLight );

    const moonLight = new THREE.DirectionalLight( 0xffffff, 0.6 * 0.9 );
    moonLight.position.set( 2.0, -1.0, 1.0 );
    moleculeScene.add( moonLight );

    // Set the order of children for the Vbox
    contentVBox.children = [ formulaText, this.moleculeNode, buttonHolder ];
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
    },

    /**
     * Render the molecule node scene
     *
     * @public
     */
    render: function() {
      this.moleculeNode.layout();
      this.moleculeNode.render( undefined );
    }
  } );
} );
