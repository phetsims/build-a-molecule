// Copyright 2002-2012, University of Colorado

/**
 * Lightweight logging that can be disabled with a has.js flag, and in the future can
 * be patched to change logging locations.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var flagName = 'log.build-a-molecule';
  
  var flagDefined = window.has && window.has( flagName ) !== undefined;
  var consoleLog = window.console && window.console.log && ( !flagDefined || window.has( flagName ) );
  
  return consoleLog ? function( msg ) { console.log( msg ); } : function(){};
} );
