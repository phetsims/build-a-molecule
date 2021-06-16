// Copyright 2020-2021, University of Colorado Boulder

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
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
    this.grabbedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );
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

  /**
   * Returns bounds of atom's position considering its covalent radius
   *
   * @public
   * @returns {Bounds2}
   */
  get positionBounds() {
    return Bounds2.point( this.positionProperty.value.x, this.positionProperty.value.y ).dilated( this.covalentRadius );
  }

  /**
   * Returns bounds of atom's destination considering its covalent radius
   *
   * @public
   * @returns {Bounds2}
   */
  get destinationBounds() {
    return Bounds2.point( this.destinationProperty.value.x, this.destinationProperty.value.y ).dilated( this.covalentRadius );
  }

  /**
   * @param {number} dt - time elapsed in seconds
   *
   * @public
   */
  step( dt ) {
    this.stepAtomTowardsDestination( dt );
  }

  /**
   * Responsible stepping an atom towards its destination. Velocity of step is modified based on distance to destination.
   *
   * @param {number} dt
   * @private
   */
  stepAtomTowardsDestination( dt ) {
    const distance = this.positionProperty.value.distance( this.destinationProperty.value );
    if ( !this.userControlledProperty.value && distance !== 0 ) {

      // Move towards the current destination
      let distanceToTravel = MOTION_VELOCITY * dt;
      const distanceToTarget = distance;

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
   * @param {Vector2} delta
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
  }
}

buildAMolecule.register( 'Atom2', Atom2 );
export default Atom2;