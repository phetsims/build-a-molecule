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
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
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

  //REVIEW: "Controls" may be a better word rather than "Metadata"
  /**
   * @param {Kit} kit
   * @param {Molecule} molecule
   * @constructor
   */
  function MoleculeMetadataNode( kit, molecule ) {
    //REVIEW: No need to have empty objects in cases like this
    Node.call( this, {} );

    var self = this;
    this.molecule = molecule;

    if ( molecule.atoms.length < 2 ) {
      // we don't need anything at all if it is not a "molecule"
      return; // TODO: Horrible idea
      //REVIEW: Not sure why this is horrible. Maybe we shouldn't be creating this in the first place?
    }

    this.updatePositionListener = this.updatePosition.bind( this );

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
      if ( BAMConstants.HAS_3D ) {
        var button3d = new ShowMolecule3DButtonNode( completeMolecule, {
          x: currentX,
          scale: 1.2
        } );
        //REVIEW: Should factor out constants if possible, like the 1.2, and 4 / 1.2.
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

    molecule.atoms.forEach( function( atom ) {
      atom.positionProperty.link( self.updatePositionListener );
    } );

    this.updatePosition(); // sanity check. should update (unfortunately) a number of times above

    } );
  }

  buildAMolecule.register( 'MoleculeMetadataNode', MoleculeMetadataNode );

  inherit( Node, MoleculeMetadataNode, {
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
      Node.prototype.dispose.call( this );

      // TODO: incomplete: throw new Error( 'dialog.hideDialogIfShown' );
    },

    updatePosition: function() {
      var modelPositionBounds = this.molecule.positionBounds;
      var moleculeViewBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( modelPositionBounds );

      this.setTranslation( moleculeViewBounds.centerX - this.width / 2, // horizontally center
        moleculeViewBounds.minY - this.height - BAMConstants.BUTTON_PADDING ); // offset from top of molecule
    }
  } );

  return MoleculeMetadataNode;
} );
