// Copyright 2020, University of Colorado Boulder

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Atom from '../../../../nitroglycerin/js/Atom.js';
import buildAMolecule from '../../buildAMolecule.js';
import Strings from '../../Strings.js';

// constants
const MOTION_VELOCITY = 800; // In picometers per second of sim time.

class Atom2 extends Atom {

  /**
   * @param {Element} element
   * @param {Emitter} stepEmitter
   */
  constructor( element, stepEmitter ) {
    super( element );

    // @public {Vector2Property} Position of atom
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public {Vector2Property} Destination of atom
    this.destinationProperty = new Vector2Property( Vector2.ZERO );

    // @public {BooleanProperty}
    this.userControlledProperty = new BooleanProperty( false );
    this.visibleProperty = new BooleanProperty( true );

    // @public {BooleanProperty} Regulates step function for this atom
    //REVIEW: This is always true, I don't see why it's here? Let's remove it
    this.addedToModelProperty = new BooleanProperty( true );

    // @public {Emitter} Responsible for grabbing and dropping an atom
    //REVIEW: I don't see any usages of grabbedByUserEmitter, let's remove it?
    this.grabbedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );
    this.droppedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );

    // @public {Emitter} Responsible for separating this atom from other atoms
    //REVIEW: This is never emitted, AND I don't understand the naming... is it WHEN something happens, or TRIGGERING it?
    //REVIEW: Can we just remove this?
    this.separateMoleculeEmitter = new Emitter();

    // @public {Emitter}
    //REVIEW: I don't see any usage of an atom.stepEmitter, can we remove this?
    this.stepEmitter = stepEmitter;

    // @public {string} Name of this atom
    //REVIEW: I can't find a usage of this, can we just remove it?
    this.name = Strings.getAtomName( element );

    //REVIEW: Lower-casing of {function}
    // @private {Function} Passed into step function.
    //REVIEW: We don't seem to use this outside of the constructor, just have a local variable. ALSO below it seems
    //REVIEW: that we don't need to ever remove it, so just inline it
    this.clockListener = this.step.bind( this );

    // Atom exists for entire sim lifetime. No need to dispose.
    //REVIEW: This Property is always true, let's remove the conditional here?
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

    // Atom exists for entire sim life cycle. No need to dispose.
    this.userControlledProperty.lazyLink( controlled => {
      if ( controlled ) {
        this.grabbedByUserEmitter.emit( this );
      }
      else {
        this.droppedByUserEmitter.emit( this );
      }
    } );
  }

  // Returns bounds of atom's position considering its covalent radius
  //REVIEW: JSDoc return type?
  get positionBounds() {
    //REVIEW: Don't use Rectangle if possible here, just Bounds2.point( x, y ).dilated( this.covalentRadius / 2 )
    return new Rectangle( this.positionProperty.value.x - this.covalentRadius, this.positionProperty.value.y - this.covalentRadius, this.covalentDiameter, this.covalentDiameter );
  }

  // Returns bounds of atom's destination considering its covalent radius
  //REVIEW: JSDoc return type?
  get destinationBounds() {
    //REVIEW: Don't use Rectangle if possible here, just Bounds2.point( x, y ).dilated( this.covalentRadius / 2 )
    return new Rectangle( this.destinationProperty.value.x - this.covalentRadius, this.destinationProperty.value.y - this.covalentRadius, this.covalentDiameter, this.covalentDiameter );
  }

  /**
   * @param dt {number} time elapsed in seconds REVIEW: jsdoc ordering
   *
   * @public
   */
  step( dt ) {
    this.stepAtomTowardsDestination( dt );
  }

  /**
   * Responsible stepping an atom towards its destination. Velocity of step is modified based on distance to destination.
   *
   * @param dt REVIEW: type docs
   * @private
   */
  stepAtomTowardsDestination( dt ) {
    if ( !this.userControlledProperty.value && this.positionProperty.value.distance( this.destinationProperty.value ) !== 0 ) {

      // Move towards the current destination
      let distanceToTravel = MOTION_VELOCITY * dt;
      //REVIEW: We used this above, can we factor this out above the if statement, and use it in the conditional?
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

  /**
   * Add a vector to the current position and destination of the atom
   * @param delta {Vector2} REVIEW: JSDoc ordering
   *
   * @public
   */
  translatePositionAndDestination( delta ) {
    this.positionProperty.value = this.positionProperty.value.plus( delta );
    this.destinationProperty.value = this.destinationProperty.value.plus( delta );
  }

  /**
   * Update the position and destination to a specific point
   * @param {Vector2} point
   *
   * @public
   */
  setPositionAndDestination( point ) {
    this.positionProperty.value = point;
    this.destinationProperty.value = point;
  }

  /**
   * Update the position property to a new point
   * @param {number} x
   * @param {number} y
   *
   * @public
   */
  translate( x, y ) {
    this.positionProperty.value = new Vector2( this.positionProperty.value.x + x, this.positionProperty.value.y + y );
  }

  /**
   * Reset the atom
   *
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.destinationProperty.reset();
    this.userControlledProperty.reset();
    this.visibleProperty.reset();
    this.addedToModelProperty.reset();
    //REVIEW: I don't yet see a case where this would do anything. We reset things above, why would we want to change
    //REVIEW: something here? Can we remove this line?
    this.destinationProperty.value = this.positionProperty.value;
  }
}

buildAMolecule.register( 'Atom2', Atom2 );
export default Atom2;