// Copyright 2002-2013, University of Colorado

/**
 * STUB CLASS TODO
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Strings = require( 'BAM/Strings' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  
  var ShowMolecule3DButtonNode = namespace.ShowMolecule3DButtonNode = function ShowMolecule3DButtonNode() {
    Node.call( this, {} );
  };

  return inherit( Node, ShowMolecule3DButtonNode );
} );
