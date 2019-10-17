// Copyright 2013-2019, University of Colorado Boulder

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Molecule3DDialog = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DDialog' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  //REVIEW: Could rename the string key so we don't have to disable the lint rule here?
  const threeDString = require( 'string!BUILD_A_MOLECULE/threeD' ); // eslint-disable-line string-require-statement-match

  function ShowMolecule3DButtonNode( completeMolecule, options ) {
    const self = this;
    RectangularPushButton.call( this, merge( {
      content: new Text( threeDString, {
        font: new PhetFont( {
          size: 12,
          weight: 'bold'
        } ),
        fill: 'white'
      } ),
      baseColor: new Color( 112, 177, 84 ),
      xMargin: 3,  //
      yMargin: 3,  //
      cursor: 'pointer'
    }, options ) );

    this.addInputListener( new ButtonListener( {
      fire: function() {
        const trail = self.getUniqueTrail();
        //REVIEW: (JO) See if we can just check for a ScreenView, so that we don't use this special check.
        const view = _.find( trail.nodes, function( node ) {
          if ( node instanceof ScreenView ) {
            return node;
          }
        } );
        const dialog = new Molecule3DDialog( completeMolecule, view );

        dialog.show();
      }
    } ) );
  }

  buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );

  return inherit( Node, ShowMolecule3DButtonNode );
} );
