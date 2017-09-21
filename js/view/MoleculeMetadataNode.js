// Copyright 2013-2017, University of Colorado Boulder

/**
 * Displays the molecule name and 'X' to break apart the molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var ShowMolecule3DButtonNode = require( 'BUILD_A_MOLECULE/view/view3d/ShowMolecule3DButtonNode' );
  var Text = require( 'SCENERY/nodes/Text' );

  // images
  var splitIconImage = require( 'image!BUILD_A_MOLECULE/split-blue.png' );

  function MoleculeMetadataNode( kit, molecule ) {
    Node.call( this, {} );

    var self = this;
    this.molecule = molecule;
    this.updatePositionListener = self.updatePosition.bind( self );

    if ( molecule.atoms.length < 2 ) {
      // we don't need anything at all if it is not a "molecule"
      return;
    }

    var completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule( molecule );

    var currentX = 0;

    if ( completeMolecule ) {
      /*---------------------------------------------------------------------------*
       * label with chemical formula and common name
       *----------------------------------------------------------------------------*/
      var label = new Text( completeMolecule.getDisplayName(), {
        font: new PhetFont( { size: 17, weight: 'bold' } ),
        centerY: 11
      } );
      this.addChild( label );
      currentX += label.width + 10;

      /*---------------------------------------------------------------------------*
       * show 3d button
       *----------------------------------------------------------------------------*/
      if ( Constants.has3d ) {
        // TODO: add dialog!
        var button3d = new ShowMolecule3DButtonNode( completeMolecule, {
          x: currentX,
          scale: 1.2
        } );
        button3d.touchArea = Shape.bounds( button3d.childBounds.dilated( 4 / 1.2 ) );
        this.addChild( button3d );
        currentX += button3d.width + 8;
      }
    }

    /*---------------------------------------------------------------------------*
     * break-up button
     *----------------------------------------------------------------------------*/
    var buttonBreak = new Node( {
      children: [ new Image( splitIconImage ) ],
      x: currentX,
      scale: 1.2,
      cursor: 'pointer'
    } );
    buttonBreak.touchArea = Shape.bounds( buttonBreak.childBounds.dilated( 4 / 1.2 ) );
    buttonBreak.addInputListener( new ButtonListener( {
      fire: function( evt ) {
        kit.breakMolecule( molecule );
      }
    } ) );
    this.addChild( buttonBreak );

    _.each( molecule.atoms, function( atom ) {
      atom.positionProperty.link( self.updatePositionListener );
    } );

    this.updatePosition(); // sanity check. should update (unfortunately) a number of times above

    // hide 3D dialogs when the kit is hidden
    kit.visibleProperty.link( function( isVisible ) {
      if ( !isVisible ) {
        // TODO: incomplete: throw new Error( 'dialog.hideDialogIfShown' );
      }
    } );
  }
  buildAMolecule.register( 'MoleculeMetadataNode', MoleculeMetadataNode );

  inherit( Node, MoleculeMetadataNode, {
    destruct: function() {
      var self = this;
      _.each( this.molecule.atoms, function( atom ) {
        atom.positionProperty.unlink( self.updatePositionListener );
      } );
      // TODO: incomplete: throw new Error( 'dialog.hideDialogIfShown' );
    },

    updatePosition: function() {
      var modelPositionBounds = this.molecule.positionBounds;
      var moleculeViewBounds = Constants.modelViewTransform.modelToViewBounds( modelPositionBounds );

      this.setTranslation( moleculeViewBounds.centerX - this.width / 2, // horizontally center
        moleculeViewBounds.minY - this.height - Constants.metadataPaddingBetweenNodeAndMolecule ); // offset from top of molecule
    }
  } );

  return MoleculeMetadataNode;
} );
