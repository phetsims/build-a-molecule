// Copyright 2002-2013, University of Colorado

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  
  var MoleculeBondNode = namespace.MoleculeBondNode = function MoleculeBondNode( bond, kit, view ) {
    Node.call( this, {} );
    
    // TODO: all of MoleculeBondNode
  };
  
  inherit( Node, MoleculeBondNode, {
    destruct: function() {
      
    }
  } );
  
  return MoleculeBondNode;
} );
