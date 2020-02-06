// Copyright 2020, University of Colorado Boulder

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
  // const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  // const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const Dialog = require( 'SUN/Dialog' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/common/model/MoleculeList' );
  // const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Playable = require( 'TAMBO/Playable' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const PressListener = require( 'SCENERY/listeners/PressListener' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const ThreeNode = require( 'MOBIUS/ThreeNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector3 = require( 'DOT/Vector3' );

  // strings
  // const ballAndStickString = require( 'string!BUILD_A_MOLECULE/ballAndStick' ); // eslint-disable-line string-require-statement-match
  // const spaceFillString = require( 'string!BUILD_A_MOLECULE/spaceFilling' ); // eslint-disable-line string-require-statement-match

  // constants
  const VIEW_STYLE = Enumeration.byKeys( [ 'SPACE_FILL', 'BALL_AND_STICK' ] );

  class Molecule3DDialog extends Dialog {
    /**
     *
     * @param {Property.<CompleteMolecule|null>} completeMoleculeProperty
     * @constructor
     */
    constructor( completeMoleculeProperty ) {
      const title = new Text( '', {
        font: new PhetFont( 28 ),
        fill: 'white'
      } );
      // Holds all of the content within the dialog. Dialog needs to be sized to content before content is added.
      const contentWrapper = new Rectangle( 0, 0, 300, 325, { background: 'white' } );
      const contentVBox = new VBox( { children: [ contentWrapper ], spacing: 10 } );
      super( contentVBox, {
        fill: 'black',
        xAlign: 'center',
        title: title,
        resize: false,
        closeButtonColor: 'white'
      } );

      // @public {BooleanProperty} Property used for playing/pausing a rotating molecule
      this.isPlayingProperty = new BooleanProperty( true );
      this.userControlledProperty = new BooleanProperty( false );
      const playPauseButton = new PlayPauseButton( this.isPlayingProperty, {
        radius: 15,
        valueOffSoundPlayer: Playable.NO_SOUND,
        valueOnSoundPlayer: Playable.NO_SOUND,
        baseColor: Color.ORANGE
      } );

      // @public {Property.<CompleteMoleculeProperty>}
      this.completeMoleculeProperty = completeMoleculeProperty;
      const formulaText = new RichText( '', {
        font: new PhetFont( 18 ),
        fill: '#bbb'
      } );
      completeMoleculeProperty.link( completeMolecule => {
        if ( completeMolecule ) {
          title.setText( completeMolecule.getDisplayName() );
          formulaText.setText( completeMolecule.getGeneralFormulaFragment() );
        }
      } );
      const viewStyleProperty = new EnumerationProperty( VIEW_STYLE, VIEW_STYLE.SPACE_FILL );

      // // Space fill / Ball and stick radio buttons
      // const buttonTextOptions = {
      //   font: new PhetFont( 18 ),
      //   fill: 'white',
      //   maxWidth: BAMConstants.TEXT_MAX_WIDTH - 100
      // };
      // const spaceFillText = new Text( spaceFillString, buttonTextOptions );
      // const ballAndStickText = new Text( ballAndStickString, buttonTextOptions );
      //
      // const radioButtonOptions = {
      //   selectedColor: 'rgba(255,255,255,0.4)',
      //   deselectedColor: 'black',
      //   centerColor: 'white',
      //   radius: 8,
      //   xSpacing: 8,
      //   stroke: 'white',
      //   soundPlayer: Playable.NO_SOUND
      // };

      /**
       * Build and add atom mesh to container.
       * @param {CompleteMolecule} completeMolecule
       * @param {Object3D} container
       * @param {boolean} requiresAtomOffset
       * @param {boolean} scaledRadius
       * @param {Array.<Color>} [colorSet]
       *
       * @private
       */
      const buildAtomMesh = ( completeMolecule, container, requiresAtomOffset, scaledRadius, colorSet ) => {
        for ( let i = 0; i < completeMolecule.atoms.length; i++ ) {
          const atom = completeMolecule.atoms[ i ];

          // Handle parameters for icon vs non-icon build
          const radius = scaledRadius ? 0.35 : atom.covalentRadius / 80;
          const offset = requiresAtomOffset ? (-0.5) + (i) : 0;
          const color = colorSet ? Color.toColor( colorSet[ i ] ).toNumber() : Color.toColor( atom.element.color ).toNumber();
          console.log( 'color = ' + color );
          const iconMesh = new THREE.Mesh( new THREE.SphereGeometry( radius, 30, 24 ), new THREE.MeshLambertMaterial( {
            color: color
          } ) );
          container.add( iconMesh );
          iconMesh.position.set( atom.x3d + offset, atom.y3d, atom.z3d );
        }
      };

      /**
       * Build and add atom mesh to container.
       * @param {CompleteMolecule} completeMolecule
       * @param {Object3D} container
       * @param {boolean} requiresBondOffset
       * @param {boolean} meshThickness
       *
       * @private
       */
      const buildBondMesh = ( completeMolecule, container, requiresBondOffset, meshThickness ) => {
        completeMolecule.bonds.forEach( bond => {
          let originOffset = -0.25;
          let displacement = 0;

          // If a bond has a high order we need to adjust the bond mesh in the y-axis
          for ( let i = 0; i < bond.order; i++ ) {

            // Offset for single bond
            if ( bond.order === 1 ) {
              originOffset = 0;
              displacement = 0;
            }
            // Offset for double bond
            else if ( bond.order === 2 ) {
              originOffset = -0.25;
              displacement = 0.5;
            }
            // Offset for triple bond
            else if ( bond.order === 3 ) {
              originOffset = -0.25;
              displacement = 0.25;
            }
            // Handle building bonds for ball and stick icon (O2)
            if ( requiresBondOffset ) {
              originOffset = -0.5;
              displacement = 1;
            }

            // Establish parameters for bond mesh
            const bondAPosition = new Vector3( bond.a.x3d, bond.a.y3d, bond.a.z3d );
            const bondBPosition = new Vector3( bond.b.x3d, bond.b.y3d, bond.b.z3d );
            const distance = bondAPosition.distance( bondBPosition );
            const bondMesh = new THREE.Mesh(
              new THREE.CylinderGeometry( meshThickness, meshThickness, distance, 32, false ),
              new THREE.MeshLambertMaterial( { color: Color.gray } )
            );

            // Vector3
            const cylinderDefaultOrientation = Vector3.Y_UNIT;

            const neededOrientation = bondAPosition.minus( bondBPosition ).normalized();

            // Matrix3
            const matrix = Matrix3.rotateAToB( cylinderDefaultOrientation, neededOrientation );

            // Vector3
            const midpointBetweenAtoms = bondAPosition.average( bondBPosition );
            container.add( bondMesh );

            // Enforce a manual update to the bondMesh matrix.
            bondMesh.matrixAutoUpdate = false;
            bondMesh.matrix.set(
              matrix.m00(), matrix.m01(), matrix.m02(), midpointBetweenAtoms.x,
              matrix.m10(), matrix.m11(), matrix.m12(), midpointBetweenAtoms.y + originOffset + (i) * displacement,
              matrix.m20(), matrix.m21(), matrix.m22(), midpointBetweenAtoms.z,
              0, 0, 0, 1
            );
          }
        } );
      };

      // Construct icons from MoleculeList.O2, see https://github.com/phetsims/build-a-molecule/issues/139.
      // Options for ThreeNode icons.
      const iconOptions = {
        cursor: 'pointer',
        cameraPosition: new Vector3( 0, 0, 5 )
      };
      const colorSet = [ new Color( 159, 102, 218 ), new Color( 255, 255, 255 ) ];
      // Build the icon the space filled representation
      const spaceFilledIcon = new ThreeNode( 50, 50, iconOptions );
      const spaceFilledScene = spaceFilledIcon.stage.threeScene;
      const spaceFilledContainer = new THREE.Object3D();
      spaceFilledScene.add( spaceFilledContainer );
      buildAtomMesh( MoleculeList.O2, spaceFilledContainer, false, false, colorSet );

      // Listener to change the view style to the space filled representation
      spaceFilledIcon.addInputListener( new PressListener( {
        press: () => {
          viewStyleProperty.value = VIEW_STYLE.SPACE_FILL;
        }
      } ) );

      // Ball and stick icon
      const ballAndStickIcon = new ThreeNode( 50, 50, {
        cursor: 'pointer',
        cameraPosition: new Vector3( 0, 0, 5 )
      } );
      const ballAndStickScene = ballAndStickIcon.stage.threeScene;
      const ballAndStickContainer = new THREE.Object3D();
      ballAndStickScene.add( ballAndStickContainer );
      buildAtomMesh( MoleculeList.O2, ballAndStickContainer, true, false, colorSet );
      buildBondMesh( MoleculeList.O2, ballAndStickContainer, true, 0.2 );

      // Listener to change the view style to the ball and stick representation
      ballAndStickIcon.addInputListener( new PressListener( {
        press: () => {
          viewStyleProperty.value = VIEW_STYLE.BALL_AND_STICK;
        }
      } ) );

      // Construct 3D view of moleculeNode
      const moleculeNode = new ThreeNode( 300, 200, {
        cameraPosition: new Vector3( 0, 0, 5 )
      } );
      const moleculeContainer = new THREE.Object3D();
      const moleculeScene = moleculeNode.stage.threeScene;
      moleculeScene.add( moleculeContainer );

      Property.multilink( [ viewStyleProperty, completeMoleculeProperty ], ( viewStyle, completeMolecule ) => {
        if ( completeMolecule ) {

          // Remove all previous mesh elements if they exists from a previous build
          while ( moleculeContainer.children.length > 0 ) {
            moleculeContainer.remove( moleculeContainer.children[ 0 ] );
          }

          // Handle building mesh for space fill representation
          if ( viewStyle === VIEW_STYLE.SPACE_FILL && completeMolecule ) {
            buildAtomMesh( completeMolecule, moleculeContainer, false, false );
          }

          // Handle building mesh for ball and stick representation
          else {
            buildAtomMesh( completeMolecule, moleculeContainer, false, true );
            buildBondMesh( completeMolecule, moleculeContainer, false, 0.1 );
          }
        }
      } );
      // const spaceFillButton = new AquaRadioButton( viewStyleProperty, VIEW_STYLE.SPACE_FILL, spaceFilledIcon, radioButtonOptions );
      // const ballAndStickButton = new AquaRadioButton( viewStyleProperty, VIEW_STYLE.BALL_AND_STICK, ballAndStickText, radioButtonOptions );
      const buttonHolder = new HBox( {
        children: [ spaceFilledIcon, ballAndStickIcon ],
        spacing: 40
      } );

      // Add lights to each scene for main molecule node and icons. Lights taken from MoleculeShapesScreenView.js
      const ambientLight = new THREE.AmbientLight( 0x191919 ); // closest to 0.1 like the original shader
      moleculeScene.add( ambientLight );
      spaceFilledScene.add( ambientLight.clone() );
      ballAndStickScene.add( ambientLight.clone() );

      const sunLight = new THREE.DirectionalLight( 0xffffff, 0.8 * 0.9 );
      sunLight.position.set( -1.0, 0.5, 2.0 );
      moleculeScene.add( sunLight );
      spaceFilledScene.add( sunLight.clone() );
      ballAndStickScene.add( sunLight.clone() );

      const moonLight = new THREE.DirectionalLight( 0xffffff, 0.6 * 0.9 );
      moonLight.position.set( 2.0, -1.0, 1.0 );
      moleculeScene.add( moonLight );
      spaceFilledScene.add( moonLight.clone() );
      ballAndStickScene.add( moonLight.clone() );

      this.isShowingProperty.link( isShowing => {
        // Set the order of children for the VBox
        if ( isShowing ) {

          // TODO: ThreeNode needs to be reset/childrenRemoved?
          contentVBox.removeAllChildren();
          contentVBox.children = [ formulaText, moleculeNode, buttonHolder, playPauseButton ];
        }
        else {
          contentVBox.removeAllChildren();
        }
      } );

      // @private {Property.<THREE.Quaternion>}
      this.quaternionProperty = new Property( new THREE.Quaternion() );
      this.quaternionProperty.link( quaternion => {

        // Copy the new value into the Three object's quaternion and update the matricies.
        moleculeContainer.quaternion.copy( quaternion );
        moleculeContainer.updateMatrix();
        moleculeContainer.updateMatrixWorld();
      } );

      // @private
      this.moleculeNode = moleculeNode;
      this.spaceFilledIcon = spaceFilledIcon;
      this.ballAndStickIcon = ballAndStickIcon;
      let lastGlobalPoint = null;

      // Listener that handles user input to rotate molecule
      const pressListener = new PressListener( {
        press: event => {
          this.userControlledProperty.value = true;
          lastGlobalPoint = event.pointer.point.copy();
        },
        drag: event => {
          const delta = event.pointer.point.minus( lastGlobalPoint );
          lastGlobalPoint = event.pointer.point.copy();

          // Compensate for the size of the sim screen by scaling the amount we rotate in THREE.Euler
          const scale = 1 / ( 100 * window.phet.joist.sim.scaleProperty.value );
          const newQuaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( delta.y * scale, delta.x * scale, 0 ) );
          newQuaternion.multiply( this.quaternionProperty.value );
          this.quaternionProperty.value = newQuaternion;
        },
        release: () => {
          this.userControlledProperty.value = false;
        }
      } );
      moleculeNode.addInputListener( pressListener );
    }


    /**
     * @param dt
     * @public
     */
    step( dt ) {
      if ( this.isPlayingProperty.value && !this.userControlledProperty.value ) {

        // Define a quaternion that is offset by a rotation determined by theta.
        // Multiply the rotated quaternion by the previous quaternion of the THREE object and render it with its new
        // quaternion
        const theta = Math.PI / 6 * dt;
        const newQuaternion = new THREE.Quaternion();
        newQuaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), theta );
        newQuaternion.multiply( this.quaternionProperty.value );
        this.quaternionProperty.value = newQuaternion;
      }
      this.render();
    }

    /**
     * Render each ThreeNode scene
     *
     * @private
     */
    render() {

      // Main molecule
      this.moleculeNode.layout();
      this.moleculeNode.render( undefined );

      // Space filled icon
      this.spaceFilledIcon.layout();
      this.spaceFilledIcon.render( undefined );

      // Ball and stick icon
      this.ballAndStickIcon.layout();
      this.ballAndStickIcon.render( undefined );
    }
  }

  return buildAMolecule.register( 'Molecule3DDialog', Molecule3DDialog );

} );
