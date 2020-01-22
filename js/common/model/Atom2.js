// Copyright 2020, University of Colorado Boulder

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  //modules
  const Atom = require( 'NITROGLYCERIN/Atom' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Emitter = require( 'AXON/Emitter' );
  const Rectangle = require( 'DOT/Rectangle' );
  const Strings = require( 'BUILD_A_MOLECULE/Strings' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  // constants
  const MOTION_VELOCITY = 800; // In picometers per second of sim time.

  class Atom2 extends Atom {

    /**
     * @param {Element} element
     * @param {Emitter} stepEmitter
     */
    constructor( element, stepEmitter ) {
      super( element );

      // @public {Vector2Property}
      this.positionProperty = new Vector2Property( Vector2.ZERO );
      this.destinationProperty = new Vector2Property( Vector2.ZERO );

      // @public {BooleanProperty} All atoms start off in the bucket and a link is used to trigger removal.
      this.inBucketProperty = new BooleanProperty( true );
      this.userControlledProperty = new BooleanProperty( false );
      this.visibleProperty = new BooleanProperty( true );
      this.addedToModelProperty = new BooleanProperty( true );
      this.isAnimatingProperty = new BooleanProperty( false );
      this.isSeparatingProperty = new BooleanProperty( false );

      // @public {Emitter}
      this.grabbedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );
      this.droppedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );
      this.separateMoleculeEmitter = new Emitter();

      // @public {Emitter}
      this.stepEmitter = stepEmitter;

      // @public {string}
      this.name = Strings.getAtomName( element );

      // @private {Function} Passed into step function.
      this.clockListener = this.step.bind( this );

      this.addedToModelProperty.link( isAddedToModel => {
        if ( isAddedToModel ) {
          // added to the model
          stepEmitter.addListener( this.clockListener );
        }
        else {
          // removed from the model
          stepEmitter.removeListener( this.clockListener );
        }
      } );

      this.userControlledProperty.lazyLink( controlled => {
        if ( controlled ) {
          this.grabbedByUserEmitter.emit( this );
        }
        else {
          this.droppedByUserEmitter.emit( this );
        }
      } );
    }

    get positionBounds() {
      return new Rectangle( this.positionProperty.value.x - this.covalentRadius, this.positionProperty.value.y - this.covalentRadius, this.covalentDiameter, this.covalentDiameter );
    }

    get destinationBounds() {
      return new Rectangle( this.destinationProperty.value.x - this.covalentRadius, this.destinationProperty.value.y - this.covalentRadius, this.covalentDiameter, this.covalentDiameter );
    }

    /**
     * @param dt {number} time elapsed in seconds
     *
     * @public
     */
    step( dt ) {
      if ( this.isSeparatingProperty.value ) {
        this.stepAtomTowardsDestination( dt );
      }
    }

    /**
     * Responsible stepping an atom towards its destination. Velocity of step is modified based on distance to destination.
     *
     * @param dt
     * @private
     */
    stepAtomTowardsDestination( dt ) {
      if ( !this.userControlledProperty.value && this.positionProperty.value.distance( this.destinationProperty.value ) !== 0 ) {

        // Move towards the current destination
        let distanceToTravel = MOTION_VELOCITY * dt;
        const distanceToTarget = this.positionProperty.value.distance( this.destinationProperty.value );

        const farDistanceMultiple = 10; // if we are this many times away, we speed up

        // if we are far from the target, let's speed up the velocity
        if ( distanceToTarget > distanceToTravel * farDistanceMultiple ) {
          const extraDistance = distanceToTarget - distanceToTravel * farDistanceMultiple;
          distanceToTravel *= 1 + extraDistance / 300;
        }
        if ( distanceToTravel >= distanceToTarget ) {

          // Closer than one step, so just go there.
          this.positionProperty.value = this.destinationProperty.value;
        }
        else {

          // Move towards the destination.
          const angle = Math.atan2( this.destinationProperty.value.y - this.positionProperty.value.y,
            this.destinationProperty.value.x - this.positionProperty.value.x );
          this.translate( distanceToTravel * Math.cos( angle ), distanceToTravel * Math.sin( angle ) );
        }
      }
    }

    setPosition( x, y ) {
      this.positionProperty.value = new Vector2( x, y );
    }

    translatePositionAndDestination( delta ) {
      this.positionProperty.value = this.positionProperty.value.plus( delta );
      this.destinationProperty.value = this.destinationProperty.value.plus( delta );
    }

    setPositionAndDestination( point ) {
      this.positionProperty.value = point;
      this.destinationProperty.value = point;
    }

    translate( x, y ) {
      this.positionProperty.value = new Vector2( this.positionProperty.value.x + x, this.positionProperty.value.y + y );
    }

    reset() {
      this.positionProperty.reset();
      this.destinationProperty.reset();
      this.userControlledProperty.reset();
      this.visibleProperty.reset();
      this.addedToModelProperty.reset();
      this.destinationProperty.value = this.positionProperty.value;
    }
  }

  return buildAMolecule.register( 'Atom2', Atom2 );
} );