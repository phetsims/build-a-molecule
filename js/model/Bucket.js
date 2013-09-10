// Copyright 2002-2013, University of Colorado

/**
 * A bucket for Atom2s
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var Atom2 = require( 'BAM/model/Atom2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Strings = require( 'BAM/Strings' );
  
  /**
   * Constructor.  The dimensions used are just numbers, i.e. they are not
   * meant to be any specific size (such as meters).  This enabled
   * reusability in any 2D model.
   *
   * @param size     Physical size of the bucket (model space)
   * @param element  The element of the atoms in the bucket
   * @param quantity The number of atoms starting in the bucket
   */
  var Bucket = namespace.Bucket = function Bucket( size, clock, element, quantity ) {
    this._position = null;
    
    SphereBucket.call( this, {
      position: Vector2.ZERO,
      size: size,
      sphereRadius: element.radius,
      baseColor: element.color,
      caption: Strings.getAtomName( element ),
      captionColor: 'black'
    } );
    
    this.element = element;
    this.width = this.containerShape.computeBounds().width;
    
    for ( var i = 0; i < quantity; i++ ) {
      this.addParticleFirstOpen( new Atom2( element, clock ), false );
    }
  };
  
  inherit( SphereBucket, Bucket, {
    get atoms() {
      return this.getParticleList();
    },
    
    set position( point ) {
      this._position = point;
      
      // when we move the bucket, we must also move our contained atoms
      var delta = point.minus( this.position );
      
      _.each( this.atoms, function( atom ) {
        atom.setPositionAndDestination( atom.position.plus( delta ) );
      } );
    },
    
    get position() {
      return this._position;
    },
    
    // Instantly place the atom in the correct position, whether or not it is in the bucket
    placeAtom: function( atom ) {
      if ( this.containsParticle( atom ) ) {
        this.removeParticle( atom, true );
      }
      this.addParticleFirstOpen( atom, false );
    }
  } );
  
  /**
   * Make sure we can fit all of our atoms in just two rows
   *
   * @param radius   Atomic radius (picometers)
   * @param quantity Quantity of atoms in bucket
   * @return Width of bucket
   */
  Bucket.calculateIdealBucketWidth = function( radius, quantity ) {
    // calculate atoms to go on the bottom row
    var numOnBottomRow = Math.floor( ( quantity <= 2 ) ? quantity : ( quantity / 2 + 1 ) );

    // figure out our width, accounting for radius-padding on each side
    var width = 2 * radius * ( numOnBottomRow + 1 );

    // add a bit, and make sure we don't go under 350
    return Math.floor( Math.max( 350, width + 1 ) );
  };
  
  Bucket.createAutoSized = function( clock, element, quantity ) {
    return new Bucket( new Dimension2( Bucket.calculateIdealBucketWidth( element.radius, quantity ), 200 ), clock, element, quantity );
  };
  
  return Bucket;
} );
