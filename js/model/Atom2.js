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
  var Bounds2 = require( 'DOT/Bounds2' );
  var Fort = require( 'FORT/Fort' );
  
  var MOTION_VELOCITY = 800; // In picometers per second of sim time.
  
  var Atom2 = Fort.Model.extend( {
    defaults: {
      element: null, // required
      
      position: Vector2.ZERO,
      destination: Vector2.ZERO,
      userControlled: false
    },
    
    init: function() {
      assert && assert( this.element, 'element is required for an Atom2' );
      var atom = this;
      
      this.symbol = this.element.symbol;
      this.radius = this.element.radius;
      this.diameter = this.element.radius * 2;
      this.electronegativity = this.element.electronegativity;
      this.atomicWeight = this.element.atomicWeight;
      this.color = this.element.color;
      
      this.on( 'change:userControlled', function( controlled ) {
        this.trigger( controlled ? 'grabbedByUser' : 'droppedByUser', atom );
      } );
    },
    
    getPositionBounds: function() {
      return new Bounds2( this.position.x - this.radius, this.position.y - this.radius, this.position.x + this.radius, this.position.y + this.radius );
    },
    
    getDestinationBounds: function() {
      return new Bounds2( this.destination.x - this.radius, this.destination.y - this.radius, this.destination.x + this.radius, this.destination.y + this.radius );
    },
    
    stepInTime: function( dt ) {
      if ( this.position.distance( this.destination ) != 0 ) {
        // Move towards the current destination.
        var distanceToTravel = MOTION_VELOCITY * dt;
        var distanceToTarget = this.position.distance( this.destination );

        var farDistanceMultiple = 10; // if we are this many times away, we speed up

        // if we are far from the target, let's speed up the velocity
        if ( distanceToTarget > distanceToTravel * farDistanceMultiple ) {
          var extraDistance = distanceToTarget - distanceToTravel * farDistanceMultiple;
          distanceToTravel *= 1 + extraDistance / 300;
        }

        if ( distanceToTravel >= distanceToTarget ) {
          // Closer than one step, so just go there.
          this.position = this.destination;
        }
        else {
          // Move towards the destination.
          var angle = Math.atan2( this.destination.y - this.position.y,
                                  this.destination.x - this.position.x );
          this.translate( Vector2.createPolar( distanceToTravel, angle ) );
        }
      }
    },
    
    setPositionAndDestination: function( point ) {
      this.destination = this.position = point;
    },
    
    translatePositionAndDestination: function( delta ) {
      this.position = this.position.plus( delta );
      this.destination = this.destination.plus( delta );
    },
    
    translate: function( delta ) {
      assert && assert( arguments.length === 1 ); // Java code also had translate( x, y )
      this.position = this.position.plus( delta );
    }
  } );
  
  return Atom2;
} );
