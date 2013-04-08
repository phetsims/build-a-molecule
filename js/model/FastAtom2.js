// Copyright 2002-2012, University of Colorado

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  "use strict";
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  
  var Vector2 = require( 'DOT/Vector2' );
  
  var idCounter = 1;
  
  var Atom2 = function Atom2( element ) {
    this.element = element;
    this.symbol = this.element.symbol;
    this.radius = this.element.radius;
    this.diameter = this.element.radius * 2;
    this.electronegativity = this.element.electronegativity;
    this.atomicWeight = this.element.atomicWeight;
    this.color = this.element.color;
    
    this.position = Vector2.ZERO;
    this.destination = Vector2.ZERO;
    
    this.id = idCounter++;
  }
  
  return Atom2;
} );
