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
  var Fort = require( 'FORT/Fort' );
  
  var Atom2 = Fort.Model.extend( {
    defaults: {
      element: null, // required
      
      position: Vector2.ZERO,
      destination: Vector2.ZERO,
      userControlled: false
    },
    
    init: function() {
      assert && assert( this.element, 'element is required for an Atom2' );
      
      this.symbol = this.element.symbol;
      this.radius = this.element.radius;
      this.diameter = this.element.radius * 2;
      this.electronegativity = this.element.electronegativity;
      this.atomicWeight = this.element.atomicWeight;
      this.color = this.element.color;
    },
    
    set positionAndDestination( value ) {
      this.position = this.destination = value;
    }
  } );
  window.Atom2 = Atom2;
  
  return Atom2;
} );
