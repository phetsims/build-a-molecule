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

    // @public {Emitter} Responsible for grabbing and dropping an atom
    this.droppedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );

    // Atom exists for entire sim lifetime. No need to dispose.
    stepEmitter.addListener( this.step.bind( this ) );

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
    //REVIEW: I don't yet see a case where this would do anything. We reset things above, why would we want to change
    //REVIEW: something here? Can we remove this line?
    this.destinationProperty.value = this.positionProperty.value;
  }
}

buildAMolecule.register( 'Atom2', Atom2 );
export default Atom2;