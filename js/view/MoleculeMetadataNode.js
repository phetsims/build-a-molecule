// Copyright 2002-2013, University of Colorado

/**
 * Displays the molecule name and 'X' to break apart the molecule
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var inherit = require( 'PHET_CORE/inherit' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ShowMolecule3DButtonNode = require( 'BAM/view/view3d/ShowMolecule3DButtonNode' );
  var splitIconImage = require( 'image!BAM/../images/split-blue.png' );
  
  var MoleculeMetadataNode = namespace.MoleculeMetadataNode = function MoleculeMetadataNode( kit, molecule ) {
    Node.call( this, {} );
    
    var selfNode = this;
    this.molecule = molecule;
    this.updatePositionListener = selfNode.updatePosition.bind( selfNode );
    
    if ( molecule.atoms.length < 2 ) {
      // we don't need anything at all if it is not a "molecule"
      return;
    }
    
    var completeMolecule = molecule.getMatchingCompleteMolecule();

    var currentX = 0;

    if ( completeMolecule ) {
      /*---------------------------------------------------------------------------*
      * label with chemical formula and common name
      *----------------------------------------------------------------------------*/
      var label = new Text( completeMolecule.getDisplayName(), {
        font: new PhetFont( { size: 14, weight: 'bold' } ),
        centerY: 9
      } );
      this.addChild( label );
      currentX += label.width + 10;

      /*---------------------------------------------------------------------------*
      * show 3d button
      *----------------------------------------------------------------------------*/
      if ( Constants.has3d ) {
        // TODO: add dialog!
        var button3d = new ShowMolecule3DButtonNode( completeMolecule, {
          x: currentX
        } );
        this.addChild( button3d );
        currentX += button3d.width + 5;
      }
    }

    /*---------------------------------------------------------------------------*
    * break-up button
    *----------------------------------------------------------------------------*/
    var buttonBreak = new Node( {
      children: [ new Image( splitIconImage ) ],
      x: currentX,
      cursor: 'pointer'
    } );
    buttonBreak.addInputListener( new ButtonListener( {
      fire: function( evt ) {
        kit.breakMolecule( molecule );
      }
    } ) );
    this.addChild( buttonBreak );
    
    _.each( molecule.atoms, function( atom ) {
      atom.positionProperty.link( selfNode.updatePositionListener );
    } );

    this.updatePosition(); // sanity check. should update (unfortunately) a number of times above

    // hide 3D dialogs when the kit is hidden
    kit.visibleProperty.link( function( isVisible ) {
      if ( !isVisible ) {
        // TODO: incomplete: throw new Error( 'dialog.hideDialogIfShown' );
      }
    } );
  };
  
  inherit( Node, MoleculeMetadataNode, {
    destruct: function() {
      var selfNode = this;
      _.each( this.molecule.atoms, function( atom ) {
        atom.positionProperty.unlink( selfNode.updatePositionListener );
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
