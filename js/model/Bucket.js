// Copyright 2013-2019, University of Colorado Boulder

/**
 * A bucket for Atom2s
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Atom2 = require( 'BUILD_A_MOLECULE/model/Atom2' );
  var AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2Property = require( 'DOT/Vector2Property' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Strings = require( 'BUILD_A_MOLECULE/Strings' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * Constructor.  The dimensions used are just numbers, i.e. they are not
   * meant to be any specific size (such as meters).  This enabled
   * reusability in any 2D model.
   *
   * REVIEW: type docs
   * @param size     Physical size of the bucket (model space)
   * @param element  The element of the atoms in the bucket
   * @param quantity The number of atoms starting in the bucket
   */
  function Bucket( size, stepEmitter, element, quantity ) {
    SphereBucket.call( this, {
      position: Vector2.ZERO,
      size: size,
      sphereRadius: element.covalentRadius,
      baseColor: element.color,
      captionText: Strings.getAtomName( element ),
      captionColor: AtomNode.needsWhiteColor( new Color( element.color ) ) ? 'white' : 'black',
      verticalParticleOffset: -30 + element.covalentRadius / 2
    } );
    var self = this;

    // @private {Property.<Vector2>}
    this.positionProperty = new Vector2Property( this.position );

    //REVIEW: docs
    this.element = element;
    this.width = this.containerShape.bounds.width;

    for ( var i = 0; i < quantity; i++ ) {
      this.addParticleFirstOpen( new Atom2( element, stepEmitter ), false );
    }

    this.positionProperty.link( function( point ) {

      // when we move the bucket, we must also move our contained atoms
      var delta = point.minus( self.position );

      if ( self.atoms ) {
        self.atoms.forEach( function( atom ) {
          atom.setPositionAndDestination( atom.positionProperty.value.plus( delta ) );
        } );
      }
    } );
  }

  buildAMolecule.register( 'Bucket', Bucket );

  inherit( SphereBucket, Bucket, {
    get atoms() {
      return this.getParticleList();
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
   * @returns {number} Width of bucket
   */
  Bucket.calculateIdealBucketWidth = function( radius, quantity ) {
    // calculate atoms to go on the bottom row
    var numOnBottomRow = Math.floor( ( quantity <= 2 ) ? quantity : ( quantity / 2 + 1 ) );

    // figure out our width, accounting for radius-padding on each side
    var width = 2 * radius * ( numOnBottomRow + 1 );

    // add a bit, and make sure we don't go under 350
    return Math.floor( Math.max( 350, width + 1 ) );
  };

  Bucket.createAutoSized = function( stepEmitter, element, quantity ) {
    return new Bucket( new Dimension2( Bucket.calculateIdealBucketWidth( element.covalentRadius, quantity ), 200 ), stepEmitter, element, quantity );
  };

  return Bucket;
} );
