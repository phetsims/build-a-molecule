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

    // modules
    const AquaRadioButton = require( 'SUN/AquaRadioButton' );
    const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
    const Bounds2 = require( 'DOT/Bounds2' );
    const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
    const Color = require( 'SCENERY/util/Color' );
    const Dialog = require( 'SUN/Dialog' );
    const Enumeration = require( 'PHET_CORE/Enumeration' );
    const EnumerationProperty = require( 'AXON/EnumerationProperty' );
    const inherit = require( 'PHET_CORE/inherit' );
    const Matrix3 = require( 'DOT/Matrix3' );
    const PhetFont = require( 'SCENERY_PHET/PhetFont' );
    const Property = require( 'AXON/Property' );
    const Rectangle = require( 'SCENERY/nodes/Rectangle' );
    const RichText = require( 'SCENERY/nodes/RichText' );
    const ThreeNode = require( 'MOBIUS/ThreeNode' );
    const Text = require( 'SCENERY/nodes/Text' );
    const HBox = require( 'SCENERY/nodes/HBox' );
    const VBox = require( 'SCENERY/nodes/VBox' );
    const Vector3 = require( 'DOT/Vector3' );

    // strings
    const ballAndStickString = require( 'string!BUILD_A_MOLECULE/ballAndStick' ); // eslint-disable-line string-require-statement-match
    const spaceFillString = require( 'string!BUILD_A_MOLECULE/spaceFilling' ); // eslint-disable-line string-require-statement-match

    // constants
    const SIZE = 200;

    /**
     *
     * @param {Property.<CompleteMolecule|null>} completeMoleculeProperty
     * @constructor
     */
    function Molecule3DDialog( completeMoleculeProperty ) {
      //@public
      this.completeMoleculeProperty = completeMoleculeProperty;
      const formulaText = new RichText( '', {
        font: new PhetFont( 20 ),
        fill: '#bbb'
      } );
      const title = new Text( '', {
        font: new PhetFont( 30 ),
        fill: 'white'
      } );
      completeMoleculeProperty.link( completeMolecule => {
        if ( completeMolecule ) {
          title.setText( completeMolecule.getDisplayName() );
          formulaText.setText( completeMolecule.getGeneralFormulaFragment() );
        }
      } );

      // Holds all of the content within the dialog. Dialog needs to be sized to content before content is added.
      // TODO: Find largest size for dialog and fill content with that size bounds
      const contentWrapper = new Rectangle( 0, 0, 350, 300, { background: 'white' } );
      const contentVBox = new VBox( { children: [ contentWrapper ], spacing: 12 } );

      Dialog.call( this, contentVBox, {
        fill: 'black',
        xAlign: 'center',
        title: title,
        resize: false
      } );

      // Used for radio buttons
      const ViewStyle = new Enumeration( [ 'SPACE_FILL', 'BALL_AND_STICK' ] );
      const viewStyleProperty = new EnumerationProperty( ViewStyle, ViewStyle.SPACE_FILL );

      // Space fill / Ball and stick radio buttons
      const buttonTextOptions = {
        font: new PhetFont( 20 ),
        fill: 'white',
        maxWidth: BAMConstants.TEXT_MAX_WIDTH
      };
      const spaceFillText = new Text( spaceFillString, buttonTextOptions );
      const ballAndStickText = new Text( ballAndStickString, buttonTextOptions );

      const radioButtonOptions = {
        selectedColor: 'rgba(255,255,255,0.4)',
        deselectedColor: 'black',
        centerColor: 'white',
        radius: 12,
        xSpacing: 8,
        stroke: 'white'
      };
      const spaceFillButton = new AquaRadioButton( viewStyleProperty, ViewStyle.SPACE_FILL, spaceFillText, radioButtonOptions );
      const ballAndStickButton = new AquaRadioButton( viewStyleProperty, ViewStyle.BALL_AND_STICK, ballAndStickText, radioButtonOptions );
      const buttonHolder = new HBox( {
        children: [ spaceFillButton, ballAndStickButton ],
        spacing: 40
      } );

      // 3D view of moleculeNode using mobius supported elements
      const moleculeNode = new ThreeNode( 300, 200, {
        cameraPosition: new Vector3( 0, 0, 5 )
      } );
      const moleculeContainer = new THREE.Object3D();
      const moleculeScene = moleculeNode.stage.threeScene;
      moleculeScene.add( moleculeContainer );

      Property.multilink( [ viewStyleProperty, completeMoleculeProperty ], ( viewStyle, completeMolecule ) => {
        if ( completeMolecule ) {
          while ( moleculeContainer.children.length > 0 ) {
            moleculeContainer.remove( moleculeContainer.children[ 0 ] );
          }
          if ( viewStyle === ViewStyle.SPACE_FILL && completeMolecule ) {
            completeMoleculeProperty.value.atoms.forEach( atom => {
              const atomMesh = new THREE.Mesh( new THREE.SphereGeometry( atom.covalentRadius / 80, 30, 24 ), new THREE.MeshLambertMaterial( {
                color: Color.toColor( atom.element.color ).toNumber()
              } ) );
              const mesh = atomMesh;
              moleculeContainer.add( mesh );
              mesh.position.set( atom.x3d, atom.y3d, atom.z3d );
            } );
          }
          else {
            completeMolecule.atoms.forEach( atom => {
              const atomMesh = new THREE.Mesh( new THREE.SphereGeometry( 0.35, 30, 24 ), new THREE.MeshLambertMaterial( {
                color: Color.toColor( atom.element.color ).toNumber()
              } ) );
              moleculeContainer.add( atomMesh );
              atomMesh.position.set( atom.x3d, atom.y3d, atom.z3d );
            } );
            completeMolecule.bonds.forEach( bond => {
              const bondAPosition = new Vector3( bond.a.x3d, bond.a.y3d, bond.a.z3d );
              const bondBPosition = new Vector3( bond.b.x3d, bond.b.y3d, bond.b.z3d );
              const distance = bondAPosition.distance( bondBPosition );
              const bondMesh = new THREE.Mesh( new THREE.CylinderGeometry( 0.1, 0.1, distance, 32, false ), new THREE.MeshLambertMaterial( {
                color: Color.gray
              } ) );

              // Vector3
              const cylinderDefaultOrientation = Vector3.Y_UNIT;

              const neededOrientation = bondAPosition.minus( bondBPosition ).normalized();

              // Matrix3
              const matrix = Matrix3.rotateAToB( cylinderDefaultOrientation, neededOrientation );

              // Vector3
              const midpointBetweenAtoms = bondAPosition.average( bondBPosition );
              moleculeContainer.add( bondMesh );

              // Enforce a manual update to the bondMesh matrix.
              bondMesh.matrixAutoUpdate = false;
              bondMesh.matrix.set(
                matrix.m00(), matrix.m01(), matrix.m02(), midpointBetweenAtoms.x,
                matrix.m10(), matrix.m11(), matrix.m12(), midpointBetweenAtoms.y,
                matrix.m20(), matrix.m21(), matrix.m22(), midpointBetweenAtoms.z,
                0, 0, 0, 1
              );
            } );
          }
        }
      } );

      // Lights taken from MoleculeShapesScreenView.js
      const ambientLight = new THREE.AmbientLight( 0x191919 ); // closest to 0.1 like the original shader
      moleculeScene.add( ambientLight );

      const sunLight = new THREE.DirectionalLight( 0xffffff, 0.8 * 0.9 );
      sunLight.position.set( -1.0, 0.5, 2.0 );
      moleculeScene.add( sunLight );

      const moonLight = new THREE.DirectionalLight( 0xffffff, 0.6 * 0.9 );
      moonLight.position.set( 2.0, -1.0, 1.0 );
      moleculeScene.add( moonLight );

      this.isShowingProperty.link( isShowing => {
        // Set the order of children for the VBox
        if ( isShowing ) {

          // TODO: ThreeNode needs to be reset/childrenRemoved?
          contentVBox.removeAllChildren();
          contentVBox.children = [ formulaText, moleculeNode, buttonHolder ];
        }
        else {
          contentVBox.removeAllChildren();
        }
      } );

      // @private
      this.moleculeNode = moleculeNode;
    }

    buildAMolecule.register( 'Molecule3DDialog', Molecule3DDialog );

    return inherit( Dialog, Molecule3DDialog, {
      getLocalCanvasBounds: function() {
        const centerX = this.center;
        const centerY = this.center;
        return new Bounds2( centerX - SIZE, centerY - SIZE, centerX + SIZE, centerY + SIZE );
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
  }
);
