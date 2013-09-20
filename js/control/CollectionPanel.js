// Copyright 2002-2013, University of Colorado

/**
 * A panel that shows collection areas for different collections, and allows switching between those collections
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
  
  var CollectionPanel = namespace.CollectionPanel = function( kitCollectionModel, availableKitBounds ) {
    Node.call( this, {} );
    
  };

  return inherit( Node, CollectionPanel );
} );
