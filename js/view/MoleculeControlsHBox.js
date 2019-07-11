// Copyright 2013-2019, University of Colorado Boulder

/**
 * Displays the molecule name, 3D button, and 'X' button to break apart the molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Image = require( 'SCENERY/nodes/Image' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Shape = require( 'KITE/Shape' );
  const ShowMolecule3DButtonNode = require( 'BUILD_A_MOLECULE/view/view3d/ShowMolecule3DButtonNode' );
  const Text = require( 'SCENERY/nodes/Text' );

  // images
  const splitIconImage = require( 'image!BUILD_A_MOLECULE/split-blue.png' );

  // constants
  const DILATION_FACTOR = 4 / 1.2;
  const SCALE = 1.2;

  /**
   * @param {Kit} kit
   * @param {Molecule} molecule
   * @constructor
   */
  class MoleculeControlsHBox extends HBox {
    constructor( kit, molecule ) {
      super( { spacing: 9 } );

      const self = this;
      this.molecule = molecule;

      if ( molecule.atoms.length < 2 ) {
        // we don't need anything at all if it is not a "molecule"
        return;
      }

      this.updatePositionListener = this.updatePosition.bind( this );

      // Check if molecule data exists
      const completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule( molecule );
      if ( completeMolecule ) {

        // Label with chemical formula and common name
        const label = new Text( completeMolecule.getDisplayName(), {
          font: new PhetFont( { size: 17, weight: 'bold' } )
        } );
        this.addChild( label );

        // 3D button
        if ( BAMConstants.HAS_3D ) {
          const button3d = new ShowMolecule3DButtonNode( completeMolecule, {
            scale: SCALE
          } );
          button3d.touchArea = Shape.bounds( button3d.childBounds.dilated( DILATION_FACTOR ) );
          this.addChild( button3d );
        }
      }

      // Break-up button 'X'
      const buttonBreak = new RectangularPushButton( {
        content: new Image( splitIconImage ),
        scale: SCALE,
        cursor: 'pointer',
        xMargin: 0, // Setting margins to zero so the 'X' image takes up the whole button view
        yMargin: 0
      } );
      buttonBreak.touchArea = Shape.bounds( buttonBreak.childBounds.dilated( DILATION_FACTOR ) );
      buttonBreak.addInputListener( new ButtonListener( {
        fire: () => {
          kit.breakMolecule( molecule );
        }
      } ) );
      this.addChild( buttonBreak );

      molecule.atoms.forEach( atom => {
        atom.positionProperty.link( self.updatePositionListener );
      } );

      // sanity check. should update (unfortunately) a number of times above
      this.updatePosition();
    }

    /**
     * @override
     */
    dispose() {
      const listener = this.updatePositionListener;
      if ( listener ) {
        this.molecule.atoms.forEach( atom => {
          atom.positionProperty.unlink( listener );
        } );
      }
      HBox.prototype.dispose.call( this );
    }

    updatePosition() {
      const modelPositionBounds = this.molecule.positionBounds;
      const moleculeViewBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( modelPositionBounds );

      this.setTranslation( moleculeViewBounds.centerX - this.width / 2, // horizontally center
        moleculeViewBounds.minY - this.height - BAMConstants.BUTTON_PADDING ); // offset from top of molecule
    }
  }

  return buildAMolecule.register( 'MoleculeControlsHBox', MoleculeControlsHBox );
} );
