// Copyright 2002-2012, University of Colorado

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  "use strict";
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  
  var Fort = require( 'FORT/Fort' );
  var extend = require( 'PHET_CORE/extend' );
  
  var Bond = Fort.Model.extend( {
    defaults: {
      a: null, // required
      b: null // required
    },
    
    init: function() {
      var bond = this;
      
      assert && assert( this.a !== this.b, 'Bonds cannot connect an atom to itself' );
      if ( assert ) {
        this.on( 'change:a change:b', function() {
          assert( bond.a !== bond.b, 'Bonds cannot conenct an atom to itself' );
        } );
      }
      
      extend( this, {
        // be defensive in case either atom gets changed
        get id() {
          return this.a.id + '-' + this.b.id;
        }
      } );
    },
    
    equals: function( other ) {
      return this.a === other.a && this.b === other.b;
    },
    
    contains: function( atom ) {
      return atom === this.a || atom === this.b;
    },
    
    getOtherAtom: function( atom ) {
      assert && assert( this.contains( atom ) );
      
      return ( this.a === atom ? this.b : this.a );
    },
    
    toSerial2: function( index ) {
      return index + '';
    }
  } );
  
  return Bond;
} );
