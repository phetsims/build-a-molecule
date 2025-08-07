// Copyright 2020-2025, University of Colorado Boulder

/**
 * An atom, extended with position/destination information that is animated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Atom from '../../../../nitroglycerin/js/Atom.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import { ParticleContainer } from '../../../../phetcommon/js/model/ParticleContainer.js';
import buildAMolecule from '../../buildAMolecule.js';

// constants
const MOTION_VELOCITY = 800; // In picometers per second of sim time.

class Atom2 extends Atom {

  // Position of atom
  public readonly positionProperty: Vector2Property;

  // Destination of atom
  public readonly destinationProperty: Vector2Property;

  public readonly isDraggingProperty: BooleanProperty;
  public readonly visibleProperty: BooleanProperty;

  // The container that this atom is in, if any.
  public readonly containerProperty: Property<ParticleContainer<Atom2> | null>;

  // Responsible for grabbing and dropping an atom
  public readonly grabbedByUserEmitter: Emitter<[ Atom2 ]>;
  public readonly droppedByUserEmitter: Emitter<[ Atom2 ]>;

  public constructor( element: Element, stepEmitter: Emitter<[ number ]> ) {
    super( element );

    this.positionProperty = new Vector2Property( Vector2.ZERO );
    this.destinationProperty = new Vector2Property( Vector2.ZERO );
    this.isDraggingProperty = new BooleanProperty( false );
    this.visibleProperty = new BooleanProperty( true );
    this.containerProperty = new Property<ParticleContainer<Atom2> | null>( null );
    this.grabbedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );
    this.droppedByUserEmitter = new Emitter( { parameters: [ { valueType: Atom2 } ] } );

    // Atom exists for entire sim lifetime. No need to dispose.
    stepEmitter.addListener( this.step.bind( this ) );

    // Atom exists for entire sim life cycle. No need to dispose.
    this.isDraggingProperty.lazyLink( controlled => {
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
   */
  public get positionBounds(): Bounds2 {
    return Bounds2.point( this.positionProperty.value.x, this.positionProperty.value.y ).dilated( this.covalentRadius );
  }

  /**
   * Returns bounds of atom's destination considering its covalent radius
   */
  public get destinationBounds(): Bounds2 {
    return Bounds2.point( this.destinationProperty.value.x, this.destinationProperty.value.y ).dilated( this.covalentRadius );
  }

  /**
   * @param dt - time elapsed in seconds
   */
  public step( dt: number ): void {
    this.stepAtomTowardsDestination( dt );
  }

  /**
   * Responsible stepping an atom towards its destination. Velocity of step is modified based on distance to destination.
   */
  private stepAtomTowardsDestination( dt: number ): void {
    const distance = this.positionProperty.value.distance( this.destinationProperty.value );
    if ( !this.isDraggingProperty.value && distance !== 0 ) {

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
   */
  public translatePositionAndDestination( delta: Vector2 ): void {
    this.positionProperty.value = this.positionProperty.value.plus( delta );
    this.destinationProperty.value = this.destinationProperty.value.plus( delta );
  }

  /**
   * Update the position and destination to a specific point
   */
  public setPositionAndDestination( point: Vector2 ): void {
    this.positionProperty.value = point;
    this.destinationProperty.value = point;
  }

  /**
   * Update the position property to a new point
   */
  public translate( x: number, y: number ): void {
    this.positionProperty.value = new Vector2( this.positionProperty.value.x + x, this.positionProperty.value.y + y );
  }

  /**
   * Reset the atom
   */
  public reset(): void {
    this.positionProperty.reset();
    this.destinationProperty.reset();
    this.isDraggingProperty.reset();
    this.visibleProperty.reset();
  }
}

buildAMolecule.register( 'Atom2', Atom2 );
export default Atom2;