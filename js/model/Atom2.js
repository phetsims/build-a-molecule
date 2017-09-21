// Copyright 2013-2017, University of Colorado Boulder

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Atom = require( 'NITROGLYCERIN/Atom' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Emitter = require( 'AXON/Emitter' );
  var extend = require( 'PHET_CORE/extend' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Strings = require( 'BUILD_A_MOLECULE/Strings' );
  var Vector2 = require( 'DOT/Vector2' );

  var motionVelocity = 800; // In picometers per second of sim time.

  function Atom2( element, tickEmitter ) {
    var self = this;

    Atom.call( this, element );

    // @public {Property.<Vector2>}
    this.positionProperty = new Property( Vector2.ZERO );
    this.destinationProperty = new Property( Vector2.ZERO );

    // @public {Property.<boolean>}
    this.userControlledProperty = new BooleanProperty( false );
    this.visibleProperty = new BooleanProperty( true );
    this.addedToModelProperty = new BooleanProperty( true );

    // @public {Emitter} - Called with one parameter: particle
    this.grabbedByUserEmitter = new Emitter();
    this.droppedByUserEmitter = new Emitter();
    this.removedFromModelEmitter = new Emitter(); //REVIEW: Umm, not triggered?

    this.tickEmitter = tickEmitter;
    this.clockListener = this.stepInTime.bind( this );

    this.name = Strings.getAtomName( element );

    this.userControlledProperty.lazyLink( function( controlled ) {
      if ( controlled ) {
        self.grabbedByUserEmitter.emit1( self );
      }
      else {
        self.droppedByUserEmitter.emit1( self );
      }
    } );

    this.addedToModelProperty.link( function( isAddedToModel ) {
      if ( isAddedToModel ) {
        // added to the model
        tickEmitter.addListener( self.clockListener );
      }
      else {
        // removed from the model
        tickEmitter.removeListener( self.clockListener );
      }
    } );
  }
  buildAMolecule.register( 'Atom2', Atom2 );

  inherit( Object, Atom2, extend( {}, Atom.prototype, {
    get positionBounds() {
      return new Rectangle( this.positionProperty.value.x - this.covalentRadius, this.positionProperty.value.y - this.covalentRadius, this.covalentDiameter, this.covalentDiameter );
    },

    get destinationBounds() {
      return new Rectangle( this.destinationProperty.value.x - this.covalentRadius, this.destinationProperty.value.y - this.covalentRadius, this.covalentDiameter, this.covalentDiameter );
    },

    stepInTime: function( dt ) {
      if ( this.positionProperty.value.distance( this.destinationProperty.value ) !== 0 ) {
        // Move towards the current destination
        var distanceToTravel = motionVelocity * dt;
        var distanceToTarget = this.positionProperty.value.distance( this.destinationProperty.value );

        var farDistanceMultiple = 10; // if we are this many times away, we speed up

        // if we are far from the target, let's speed up the velocity
        if ( distanceToTarget > distanceToTravel * farDistanceMultiple ) {
          var extraDistance = distanceToTarget - distanceToTravel * farDistanceMultiple;
          distanceToTravel *= 1 + extraDistance / 300;
        }

        if ( distanceToTravel >= distanceToTarget ) {
          // Closer than one step, so just go there.
          this.positionProperty.value = this.destinationProperty.value;
        }
        else {
          // Move towards the destination.
          var angle = Math.atan2( this.destinationProperty.value.y - this.positionProperty.value.y,
            this.destinationProperty.value.x - this.positionProperty.value.x );
          this.translate( distanceToTravel * Math.cos( angle ), distanceToTravel * Math.sin( angle ) );
        }
      }
    },

    setPosition: function( x, y ) { this.positionProperty.value = new Vector2( x, y ); },

    translatePositionAndDestination: function( delta ) {
      this.positionProperty.value = this.positionProperty.value.plus( delta );
      this.destinationProperty.value = this.destinationProperty.value.plus( delta );
    },

    setPositionAndDestination: function( point ) {
      this.positionProperty.value = this.destinationProperty.value = point;
    },

    translate: function( x, y ) {
      this.positionProperty.value = new Vector2( this.positionProperty.value.x + x, this.positionProperty.value.y + y );
    },

    reset: function() {
      this.positionProperty.reset();
      this.destinationProperty.reset();
      this.userControlledProperty.reset();
      this.visibleProperty.reset();
      this.addedToModelProperty.reset();

      this.destinationProperty.value = this.positionProperty.value;
    }
  } ) );

  return Atom2;
} );
