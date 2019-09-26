// Copyright 2013-2019, University of Colorado Boulder

/**
 * A bucket for Atom2s
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const Atom2 = require( 'BUILD_A_MOLECULE/model/Atom2' );
  const AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Vector2Property = require( 'DOT/Vector2Property' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  const Strings = require( 'BUILD_A_MOLECULE/Strings' );
  const Vector2 = require( 'DOT/Vector2' );

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

      // REVIEW: Used for debugging.
      this.particleList.addItemAddedListener( () => {
        console.log( 'particleList.added = ', this.particleList._array );
      } );
      this.particleList.addItemRemovedListener( () => {
        console.log( 'particleList.removed = ', this.particleList._array );
      } );

      // @public
      this.element = element;
      this.width = this.containerShape.bounds.width;

      // Create the atoms for each element and add them to the bucket.
      for ( let i = 0; i < quantity; i++ ) {
        this.addParticleFirstOpen( new Atom2( element, stepEmitter ), false );
      }
    }

    // Instantly place the atom in the correct position, whether or not it is in the bucket
    placeAtom( atom ) {
      if ( this.containsParticle( atom ) ) {
        this.removeParticle( atom, true );
      }
      this.addParticleFirstOpen( atom, false );
    }

    /**
     * Fill the bucket with its initial set of atoms.
     *
     * @public
     */
    setToFullState() {
      this.fullState.forEach( atom => {
        if ( !this.particleList.contains( atom ) ) {
          this.placeAtom( atom );
          this.particleList.push( atom );
        }
      } );
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

  return buildAMolecule.register( 'Bucket', Bucket );
} );
