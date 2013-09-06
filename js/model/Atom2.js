// Copyright 2002-2013, University of Colorado

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var Atom = require( 'NITROGLYCERIN/Atom' );
  var extend = require( 'PHET_CORE/extend' );
  var inherit = require( 'PHET_CORE/inherit' );
  var namespace = require( 'BAM/namespace' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Strings = require( 'BAM/Strings' );
  var Vector2 = require( 'DOT/Vector2' );
  
  var motionVelocity = 800; // In picometers per second of sim time.
  
  /*
   * Events:
   *   grabbedByUser:    function( particle ) {}
   *   droppedByUser:    function( particle ) {}
   *   removedFromModel: function( particle ) {}
   */
  var Atom2 = namespace.Atom2 = function Atom2( element, clock ) {
    var atom = this;
    
    PropertySet.call( this, {
      position: Vector2.ZERO,
      userControlled: false, //True if the particle is being dragged by the user
      visible: true,
      addedToModel: true
    } );
    Atom.call( this, element );
    
    this.clock = clock;
    this.clockListener = this.stepInTime.bind( this );
    
    this.name = Strings.getAtomName( element );
    
    // considered mutable, public
    this.destination = this.position;
    
    this.userControlledProperty.lazyLink( function( controlled ) {
      if ( controlled ) {
        atom.trigger( 'grabbedByUser', atom );
      } else {
        atom.trigger( 'droppedByUser', atom );
      }
    } );
    
    this.addedToModelProperty.link( function( isAddedToModel ) {
      if ( isAddedToModel ) {
        // added to the model
        clock.on( 'tick', atom.clockListener );
      } else {
        // removed from the model
        clock.off( 'tick', atom.clockListener );
      }
    } );
  };
  
  inherit( PropertySet, Atom2, extend( {}, Atom.prototype, {
    get positionBounds() {
      return new Rectangle( this.position.x - this.radius, this.position.y - this.radius, this.diameter, this.diameter );
    },
    
    get destinationBounds() {
      return new Rectangle( this.destination.x - this.radius, this.destination.y - this.radius, this.diameter, this.diameter );
    },
    
    stepInTime: function( dt ) {
      if ( this.position.distance( this.destination ) !== 0 ) {
        // Move towards the current destination
        var distanceToTravel = motionVelocity * dt;
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
        } else {
          // Move towards the destination.
          var angle = Math.atan2( this.destination.y - this.position.y,
                                  this.destination.x - this.position.x );
          this.translate( distanceToTravel * Math.cos( angle ), distanceToTravel * Math.sin( angle ) );
        }
      }
    },
    
    setPosition: function( x, y ) { this.position = new Vector2( x, y ); },
    
    translatePositionAndDestination: function( delta ) {
      this.position    = this.position.plus( delta );
      this.destination = this.destination.plus( delta );
    },
    
    setPositionAndDestination: function( point ) {
      this.position = this.destination = point;
    },
    
    translate: function( x, y ) {
      this.position = new Vector2( this.position.x + x, this.position.y + y );
    },
    
    reset: function() {
      PropertySet.prototype.reset.call( this );
      this.destination = this.position;
    }
  } ) );
  
  return Atom2;
} );
