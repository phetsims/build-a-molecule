// Copyright 2013-2017, University of Colorado Boulder

/**
 * Displays the molecule name, 3D button, and 'X' button to break apart the molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );
  var ShowMolecule3DButtonNode = require( 'BUILD_A_MOLECULE/view/view3d/ShowMolecule3DButtonNode' );
  var Text = require( 'SCENERY/nodes/Text' );

  // images
  var splitIconImage = require( 'image!BUILD_A_MOLECULE/split-blue.png' );

  // constants
  var DILATION_FACTOR = 4 / 1.2;
  var SCALE = 1.2;

  /**
   * @param {Kit} kit
   * @param {Molecule} molecule
   * @constructor
   */
  function MoleculeControlsHBox( kit, molecule ) {
    HBox.call( this, {
      spacing: 9
    } );

    var self = this;
    this.molecule = molecule;

    if ( molecule.atoms.length < 2 ) {
      // we don't need anything at all if it is not a "molecule"
      return; // TODO: Horrible idea
      //REVIEW: Not sure why this is horrible. Maybe we shouldn't be creating this in the first place?
    }

    this.updatePositionListener = this.updatePosition.bind( this );

    // Check if molecule data exists
    var completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule( molecule );
    if ( completeMolecule ) {

      // Label with chemical formula and common name
      var label = new Text( completeMolecule.getDisplayName(), {
        font: new PhetFont( { size: 17, weight: 'bold' } ),
      } );
      this.addChild( label );

      // 3D button
      if ( BAMConstants.HAS_3D ) {
        var button3d = new ShowMolecule3DButtonNode( completeMolecule, {
          scale: SCALE
        } );
        button3d.touchArea = Shape.bounds( button3d.childBounds.dilated( DILATION_FACTOR ) );
        this.addChild( button3d );
      }
    }

    // Break-up button 'X'
    var buttonBreak = new RectangularPushButton( {
      content: new Image( splitIconImage ),
      scale: SCALE,
      cursor: 'pointer',
      xMargin: 0, // Setting margins to zero so the 'X' image takes up the whole button view
      yMargin: 0
    } );
    buttonBreak.touchArea = Shape.bounds( buttonBreak.childBounds.dilated( DILATION_FACTOR ) );
    buttonBreak.addInputListener( new ButtonListener( {
      fire: function() {
        kit.breakMolecule( molecule );
      }
    } ) );
    this.addChild( buttonBreak );

    molecule.atoms.forEach( function( atom ) {
      atom.positionProperty.link( self.updatePositionListener );
    } );

    // sanity check. should update (unfortunately) a number of times above
    this.updatePosition();
  }

  buildAMolecule.register( 'MoleculeControlsHBox', MoleculeControlsHBox );

  inherit( HBox, MoleculeControlsHBox, {
    /**
     * @override
     */
    dispose: function() {
      var listener = this.updatePositionListener;
      if ( listener ) {
        this.molecule.atoms.forEach( function( atom ) {
          atom.positionProperty.unlink( listener );
        } );
      }
      HBox.prototype.dispose.call( this );
    },

    updatePosition: function() {
      var modelPositionBounds = this.molecule.positionBounds;
      var moleculeViewBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( modelPositionBounds );

      this.setTranslation( moleculeViewBounds.centerX - this.width / 2, // horizontally center
        moleculeViewBounds.minY - this.height - BAMConstants.BUTTON_PADDING ); // offset from top of molecule
    }
  } );
  return MoleculeControlsHBox;
} );
