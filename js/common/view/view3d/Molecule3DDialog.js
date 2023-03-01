// Copyright 2020-2023, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../../axon/js/EnumerationDeprecatedProperty.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import Property from '../../../../../axon/js/Property.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import ThreeNode from '../../../../../mobius/js/ThreeNode.js';
import EnumerationDeprecated from '../../../../../phet-core/js/EnumerationDeprecated.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import PlayPauseButton from '../../../../../scenery-phet/js/buttons/PlayPauseButton.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Color, PressListener, Rectangle, RichText, Text, VBox } from '../../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Dialog from '../../../../../sun/js/Dialog.js';
import nullSoundPlayer from '../../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import buildAMolecule from '../../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../../BuildAMoleculeStrings.js';
import BAMConstants from '../../BAMConstants.js';
import MoleculeList from '../../model/MoleculeList.js';

// constants
const ViewStyle = EnumerationDeprecated.byKeys( [ 'SPACE_FILL', 'BALL_AND_STICK' ] );

class Molecule3DDialog extends Dialog {
  /**
   * @param {Property.<CompleteMolecule|null>} completeMoleculeProperty
   */
  constructor( completeMoleculeProperty ) {

    // Holds all of the content within the dialog. Dialog needs to be sized to content before content is added.
    const contentWrapper = new Rectangle( 0, 0, 300, 340 );
    const contentVBox = new VBox( { children: [ contentWrapper ], spacing: 13 } );
    const title = new Text( '', {
      font: new PhetFont( 28 ),
      maxWidth: contentWrapper.width - 20,
      fill: 'white'
    } );
    super( contentVBox, {
      fill: 'black',
      xAlign: 'center',
      title: title,
      resize: false,
      closeButtonColor: 'white'
    } );

    // @public {Property.<CompleteMolecule|null>}
    this.completeMoleculeProperty = completeMoleculeProperty;

    // @public {BooleanProperty} Property used for playing/pausing a rotating molecule
    this.isPlayingProperty = new BooleanProperty( true );

    // @public {BooleanProperty}
    this.userControlledProperty = new BooleanProperty( false );

    // @public {EnumerationDeprecatedProperty} View styles for space filled and ball and stick views.
    this.viewStyleProperty = new EnumerationDeprecatedProperty( ViewStyle, ViewStyle.SPACE_FILL );
    const playPauseButton = new PlayPauseButton( this.isPlayingProperty, {
      radius: 15,
      valueOffSoundPlayer: nullSoundPlayer,
      valueOnSoundPlayer: nullSoundPlayer,
      baseColor: Color.ORANGE
    } );

    // Reads out general formula for displayed molecule.
    const formulaText = new RichText( '', {
      font: new PhetFont( 18 ),
      fill: 'rgb(187, 187, 187)'
    } );

    // Update formula text for displayed molecule.
    completeMoleculeProperty.link( completeMolecule => {
      if ( completeMolecule ) {
        title.setString( StringUtils.fillIn( BuildAMoleculeStrings.moleculeNamePattern, {
          display: completeMolecule.getDisplayName()
        } ) );
        formulaText.setString( completeMolecule.getGeneralFormulaFragment() );
      }
    } );

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
        const offset = requiresAtomOffset ? ( -0.5 ) + ( i ) : 0;
        const color = colorSet ? Color.toColor( colorSet[ i ] ).toNumber() : Color.toColor( atom.element.color ).toNumber();
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
            matrix.m10(), matrix.m11(), matrix.m12(), midpointBetweenAtoms.y + originOffset + ( i ) * displacement,
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

    // Create a Space Filled icon and representation
    const spaceFilledIcon = new ThreeNode( 50, 50, iconOptions );
    const spaceFilledScene = spaceFilledIcon.stage.threeScene;
    const spaceFilledContainer = new THREE.Object3D();
    spaceFilledScene.add( spaceFilledContainer );
    buildAtomMesh( MoleculeList.O2, spaceFilledContainer, false, false, colorSet );

    // Listener to change the view style to the space filled representation
    spaceFilledIcon.addInputListener( new PressListener( {
      press: () => {
        this.viewStyleProperty.value = ViewStyle.SPACE_FILL;
      }
    } ) );

    // Create a Ball and Stick icon and representation
    const ballAndStickIcon = new ThreeNode( 50, 50, {
      cursor: 'pointer',
      cameraPosition: new Vector3( 0, 0, 7 )
    } );
    const ballAndStickScene = ballAndStickIcon.stage.threeScene;
    const ballAndStickContainer = new THREE.Object3D();
    ballAndStickScene.add( ballAndStickContainer );
    buildAtomMesh( MoleculeList.O2, ballAndStickContainer, true, false, colorSet );
    buildBondMesh( MoleculeList.O2, ballAndStickContainer, true, 0.2 );

    // Updates the view style to the ball and stick representation
    ballAndStickIcon.addInputListener( new PressListener( {
      press: () => {
        this.viewStyleProperty.value = ViewStyle.BALL_AND_STICK;
      }
    } ) );

    // Construct 3D view of moleculeNode
    const moleculeNode = new ThreeNode( 300, 200, {
      cameraPosition: new Vector3( 0, 0, 7 )
    } );
    const moleculeContainer = new THREE.Object3D();
    const moleculeScene = moleculeNode.stage.threeScene;
    moleculeScene.add( moleculeContainer );

    // Handle the each 3D representation based on the current view style
    Multilink.multilink( [ this.viewStyleProperty, completeMoleculeProperty ], ( viewStyle, completeMolecule ) => {
      if ( completeMolecule ) {

        // Remove all previous mesh elements if they exists from a previous build
        while ( moleculeContainer.children.length > 0 ) {
          moleculeContainer.remove( moleculeContainer.children[ 0 ] );
        }

        // Handle building mesh for space fill representation
        if ( viewStyle === ViewStyle.SPACE_FILL && completeMolecule ) {
          buildAtomMesh( completeMolecule, moleculeContainer, false, false );
        }

        // Handle building mesh for ball and stick representation
        else {
          buildAtomMesh( completeMolecule, moleculeContainer, false, true );
          buildBondMesh( completeMolecule, moleculeContainer, false, 0.1 );
        }
      }
    } );

    // Create toggle buttons for scene selection
    const toggleButtonsContent = [ {
      value: ViewStyle.SPACE_FILL,
      createNode: () => spaceFilledIcon
    }, {
      value: ViewStyle.BALL_AND_STICK,
      createNode: () => ballAndStickIcon
    } ];

    // Create the icons for scene selection
    const sceneRadioButtonGroup = new RectangularRadioButtonGroup( this.viewStyleProperty, toggleButtonsContent, {
      orientation: 'horizontal',
      spacing: 30,
      radioButtonOptions: {
        xMargin: 5,
        baseColor: 'black',
        cornerRadius: BAMConstants.CORNER_RADIUS,
        buttonAppearanceStrategyOptions: {
          selectedStroke: 'yellow',
          deselectedStroke: 'white',
          selectedLineWidth: 1,
          deselectedLineWidth: 0.5,
          deselectedButtonOpacity: 0.25
        }
      }
    } );

    // Create and add lights to each scene for main molecule node and icons. Lights taken from MoleculeShapesScreenView.js
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

    // Correct the ordering of the dialogs children
    this.isShowingProperty.link( isShowing => {

      // Set the order of children for the VBox
      if ( isShowing ) {
        contentVBox.removeAllChildren();
        contentVBox.children = [ formulaText, moleculeNode, sceneRadioButtonGroup, playPauseButton ];
      }
      else {
        contentVBox.removeAllChildren();
      }
    } );

    // @private {Property.<THREE.Quaternion>} Update matrix of the 3D representation
    this.quaternionProperty = new Property( new THREE.Quaternion() );
    this.quaternionProperty.link( quaternion => {

      // Copy the new value into the Three object's quaternion and update the matrices.
      moleculeContainer.quaternion.copy( quaternion );
      moleculeContainer.updateMatrix();
      moleculeContainer.updateMatrixWorld();
    } );

    // @private {ThreeNode}
    this.moleculeNode = moleculeNode;

    // @private {ThreeNode}
    this.spaceFilledIcon = spaceFilledIcon;

    // @private {ThreeNode}
    this.ballAndStickIcon = ballAndStickIcon;
    let lastGlobalPoint = null;

    // Handles user input to rotate molecule
    const pressListener = new PressListener( {
      press: event => {
        this.userControlledProperty.value = true;
        lastGlobalPoint = event.pointer.point.copy();

        // mark the Intent of this pointer listener to indicate that we want to drag and therefore NOT
        // pan while zoomed in
        event.pointer.reserveForDrag();
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
   * @param {number} dt
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

buildAMolecule.register( 'Molecule3DDialog', Molecule3DDialog );
export default Molecule3DDialog;