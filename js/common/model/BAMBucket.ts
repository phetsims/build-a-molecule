// Copyright 2020-2025, University of Colorado Boulder

/**
 * A bucket for Atom2
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import createObservableArray, { type ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import Color from '../../../../scenery/js/util/Color.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMStrings from '../BAMStrings.js';
import AtomNode from '../view/AtomNode.js';
import Atom2 from './Atom2.js';

class BAMBucket extends SphereBucket<Atom2> {

  private readonly positionProperty: Vector2Property;

  // Tracks all of the particles in this bucket
  public readonly particleList: ObservableArray<Atom2>;

  // Contains atoms for a bucket when the bucket is full.
  public readonly fullState: Atom2[];

  public readonly element: Element;
  public readonly width: number;

  /**
   * The dimensions used are unit less, i.e. they are not meant to be any specific size (such as meters).  This enabled
   * reusability in any 2D model.
   * @param size - Physical size of the bucket (model space)
   * @param stepEmitter
   * @param element - The element of the atoms in the bucket
   * @param quantity - The number of atoms starting in the bucket
   */
  public constructor( size: Dimension2, stepEmitter: Emitter<[ number ]>, element: Element, quantity: number ) {
    super( {
      position: Vector2.ZERO,
      size: size,
      sphereRadius: element.covalentRadius,
      baseColor: element.color,
      captionText: BAMStrings[ element.symbol as keyof typeof BAMStrings ],
      captionColor: AtomNode.getTextColor( new Color( element.color as string ) ),
      verticalParticleOffset: -30 + element.covalentRadius / 2
    } );

    this.positionProperty = new Vector2Property( this.position );
    this.particleList = createObservableArray();
    this.fullState = [];
    this.element = element;
    this.width = this.containerShape.bounds.width * 0.95;

    // Update the atoms when bucket's position is changed
    this.positionProperty.link( position => {
      this.getParticleList().forEach( atom => {
        atom.translatePositionAndDestination( position );
      } );
    } );

    // Create the atoms for each element and add them to the bucket. These exists for the sims lifetime.
    for ( let i = 0; i < quantity; i++ ) {
      this.addParticleNearestOpen( new Atom2( element, stepEmitter ), false );
    }
  }

  /**
   * Instantly place the atom in the correct position, whether or not it is in the bucket
   */
  public placeAtom( atom: Atom2, addFirstOpen: boolean ): void {
    if ( this.includes( atom ) ) {
      this.removeParticle( atom, true );
    }
    addFirstOpen ? this.addParticleFirstOpen( atom, false ) : this.addParticleNearestOpen( atom, false );
  }

  /**
   * Used to assign atoms to bucket's initial state.
   */
  public setToFullState(): void {
    this.fullState.forEach( atom => {
      if ( !this.particleList.includes( atom ) ) {
        this.particleList.push( atom );
        this.placeAtom( atom, true );
      }
    } );
  }

  /**
   * Checks if the bucket is full.
   */
  public isFull(): boolean {
    return this.fullState.length === this.particleList.length;
  }

  /**
   * Make sure we can fit all of our atoms in just two rows
   * @param radius - Atomic radius (picometers)
   * @param quantity - quantity of atoms in bucket
   * @returns Width of bucket
   */
  public static calculateIdealBucketWidth( radius: number, quantity: number ): number {
    // calculate atoms to go on the bottom row
    const numOnBottomRow = Math.floor( ( quantity <= 2 ) ? quantity : ( quantity / 2 + 1 ) );

    // figure out our width, accounting for radius-padding on each side
    const width = 2 * radius * ( numOnBottomRow + 1 );

    // add a bit, and make sure we don't go under 350
    return Math.floor( Math.max( 350, width + 1 ) );
  }


  /**
   * Return bucket with an ideal width to fit all its atoms.
   */
  public static createAutoSized( stepEmitter: Emitter<[ number ]>, element: Element, quantity: number ): BAMBucket {
    return new BAMBucket( new Dimension2( BAMBucket.calculateIdealBucketWidth( element.covalentRadius, quantity ), 200 ), stepEmitter, element, quantity );
  }
}

buildAMolecule.register( 'BAMBucket', BAMBucket );
export default BAMBucket;