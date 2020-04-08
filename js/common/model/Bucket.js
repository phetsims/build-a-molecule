// Copyright 2020, University of Colorado Boulder

/**
 * A bucket for Atom2s
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import Color from '../../../../scenery/js/util/Color.js';
import buildAMolecule from '../../buildAMolecule.js';
import Strings from '../../Strings.js';
import AtomNode from '../view/AtomNode.js';
import Atom2 from './Atom2.js';

class Bucket extends SphereBucket {
  /**
   * The dimensions used are just numbers, i.e. they are not
   * meant to be any specific size (such as meters).  This enabled
   * reusability in any 2D model.
   * @param {Dimension2} size - Physical size of the bucket (model space)
   * @param {Emitter} stepEmitter
   * @param {Element} element - The element of the atoms in the bucket
   * @param {number} quantity - The number of atoms starting in the bucket
   */
  constructor( size, stepEmitter, element, quantity ) {
    super( {
      position: Vector2.ZERO,
      size: size,
      sphereRadius: element.covalentRadius,
      baseColor: element.color,
      captionText: Strings.getAtomName( element ),
      captionColor: AtomNode.getTextColor( new Color( element.color ) ),
      verticalParticleOffset: -30 + element.covalentRadius / 2
    } );

    // @private {Property.<Vector2>}
    this.positionProperty = new Vector2Property( this.position );

    // @public {ObservableArray}
    this.particleList = new ObservableArray();

    // @public {Array.<Atoms2>} Contains atoms for a bucket that is full.
    // Set after buckets are initially filled at sim start up.
    this.fullState = [];

    // @public
    this.element = element;
    this.width = this.containerShape.bounds.width * 0.95;

    // Create the atoms for each element and add them to the bucket.
    for ( let i = 0; i < quantity; i++ ) {
      this.addParticleNearestOpen( new Atom2( element, stepEmitter ), false );
    }
  }

  // Instantly place the atom in the correct position, whether or not it is in the bucket
  placeAtom( atom, addFirstOpen ) {
    if ( this.containsParticle( atom ) ) {
      this.removeParticle( atom, true );
    }
    if ( addFirstOpen ) {
      this.addParticleFirstOpen( atom, false );
    }
    else {
      this.addParticleNearestOpen( atom, false );
    }
  }

  /**
   * Used to assign atoms to bucket's initial state.
   *
   * @public
   */
  setToFullState() {
    this.fullState.forEach( atom => {
      if ( !this.particleList.contains( atom ) ) {
        this.particleList.push( atom );
        this.placeAtom( atom, true );
      }
    } );
  }

  /**
   * Checks if the bucket is filled.
   *
   * @returns {boolean}
   */
  isFull() {
    return this.fullState.length === this.particleList.getArray().length;
  }

  /**
   * Make sure we can fit all of our atoms in just two rows
   *
   * @param radius   Atomic radius (picometers)
   * @param quantity Quantity of atoms in bucket
   * @returns {number} Width of bucket
   */
  static calculateIdealBucketWidth( radius, quantity ) {
    // calculate atoms to go on the bottom row
    const numOnBottomRow = Math.floor( ( quantity <= 2 ) ? quantity : ( quantity / 2 + 1 ) );

    // figure out our width, accounting for radius-padding on each side
    const width = 2 * radius * ( numOnBottomRow + 1 );

    // add a bit, and make sure we don't go under 350
    return Math.floor( Math.max( 350, width + 1 ) );
  }

  static createAutoSized( stepEmitter, element, quantity ) {
    return new Bucket( new Dimension2( Bucket.calculateIdealBucketWidth( element.covalentRadius, quantity ), 200 ), stepEmitter, element, quantity );
  }
}

buildAMolecule.register( 'Bucket', Bucket );
export default Bucket;