// Copyright 2013-2019, University of Colorado Boulder

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  //REVIEW: Could rename the string key so we don't have to disable the lint rule here?
  const threeDString = require( 'string!BUILD_A_MOLECULE/threeD' ); // eslint-disable-line string-require-statement-match

  /**
   *
   * @param {CompleteMolecule} completeMolecule
   * @param {function} showDialogCallback
   * @param {Object} options
   * @constructor
   */
  function ShowMolecule3DButtonNode( completeMolecule, showDialogCallback, options ) {
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
        showDialogCallback( completeMolecule );
      }
    } ) );
  }

  buildAMolecule.register( 'ShowMolecule3DButtonNode', ShowMolecule3DButtonNode );

  return inherit( Node, ShowMolecule3DButtonNode );
} );
