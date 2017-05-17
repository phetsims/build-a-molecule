// Copyright 2013-2015, University of Colorado Boulder

/**
 * A bucket for Atom2s
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Atom2 = require( 'BUILD_A_MOLECULE/model/Atom2' );
  var AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Strings = require( 'BUILD_A_MOLECULE/Strings' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   * Constructor.  The dimensions used are just numbers, i.e. they are not
   * meant to be any specific size (such as meters).  This enabled
   * reusability in any 2D model.
   *
   * @param size     Physical size of the bucket (model space)
   * @param element  The element of the atoms in the bucket
   * @param quantity The number of atoms starting in the bucket
   */
  function Bucket( size, clock, element, quantity ) {
    this._position = null;

    SphereBucket.call( this, {
      position: Vector2.ZERO,
      size: size,
      sphereRadius: element.covalentRadius,
      baseColor: element.color,
      captionText: Strings.getAtomName( element ),
      captionColor: AtomNode.needsWhiteColor( new Color( element.color ) ) ? 'white' : 'black',
      verticalParticleOffset: -30 + element.covalentRadius / 2
    } );

    this.element = element;
    this.width = this.containerShape.bounds.width;

    for ( var i = 0; i < quantity; i++ ) {
      this.addParticleFirstOpen( new Atom2( element, clock ), false );
    }
  }
  buildAMolecule.register( 'Bucket', Bucket );

  inherit( SphereBucket, Bucket, {
    get atoms() {
      return this.getParticleList();
    },

    set position( point ) {
      this._position = point;

      // when we move the bucket, we must also move our contained atoms
      var delta = point.minus( this.position );

      _.each( this.atoms, function( atom ) {
        atom.setPositionAndDestination( atom.position.plus( delta ) );
      } );
    },

    get position() {
      return this._position;
    },

    // Instantly place the atom in the correct position, whether or not it is in the bucket
    placeAtom: function( atom ) {
      if ( this.containsParticle( atom ) ) {
        this.removeParticle( atom, true );
      }
      this.addParticleFirstOpen( atom, false );
    }
  } );

  /**
   * Make sure we can fit all of our atoms in just two rows
   *
   * @param radius   Atomic radius (picometers)
   * @param quantity Quantity of atoms in bucket
   * @return Width of bucket
   */
  Bucket.calculateIdealBucketWidth = function( radius, quantity ) {
    // calculate atoms to go on the bottom row
    var numOnBottomRow = Math.floor( ( quantity <= 2 ) ? quantity : ( quantity / 2 + 1 ) );

    // figure out our width, accounting for radius-padding on each side
    var width = 2 * radius * ( numOnBottomRow + 1 );

    // add a bit, and make sure we don't go under 350
    return Math.floor( Math.max( 350, width + 1 ) );
  };

  Bucket.createAutoSized = function( clock, element, quantity ) {
    return new Bucket( new Dimension2( Bucket.calculateIdealBucketWidth( element.covalentRadius, quantity ), 200 ), clock, element, quantity );
  };

  return Bucket;
} );
