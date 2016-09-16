// Copyright 2013-2015, University of Colorado Boulder

/**
 * Allows slicing of bonds by swiping touches / mouse across the surface. Displays streak in high-performance way,
 * and has node.sliceInputListener which should be added to a node to initiate the slice.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var Constants = require( 'BUILD_A_MOLECULE/Constants' );
  var Vector2 = require( 'DOT/Vector2' );
  var Transform3 = require( 'DOT/Transform3' );
  var inherit = require( 'PHET_CORE/inherit' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener

  var sliceDistanceLimit = 1000;

  function SliceNode( kit, viewSwipeBounds, view ) {
    var self = this;

    this.kit = kit;
    this.bondData = [];
    this.traveledDistance = 0;

    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( '2d' );
    DOM.call( this, canvas, {
      preventTransform: true
    } );

    var globalBounds;
    var toModelTransform;
    var lastPoint = null;
    var lastModelPoint = new Vector2();
    var oldModelPoint = new Vector2();

    this.sliceInputListener = new SimpleDragHandler( {
      dragCursor: 'none',
      start: function( event, trail ) {
        globalBounds = view.localToGlobalBounds( viewSwipeBounds ).roundedOut();
        canvas.width = globalBounds.width;
        canvas.height = globalBounds.height;
        canvas.style.width = globalBounds.width + 'px';
        canvas.style.height = globalBounds.height + 'px';
        canvas.style.position = 'absolute';
        canvas.style.left = globalBounds.x + 'px';
        canvas.style.top = globalBounds.y + 'px';
        toModelTransform = new Transform3( Constants.modelViewTransform.getInverse().timesMatrix( view.getUniqueTrail().getMatrix().inverted() ) );

        _.each( kit.molecules, function( molecule ) {
          _.each( molecule.bonds, function( bond ) {
            self.bondData.push( {
              bond: bond,
              cut: false,
              // TODO: also try out destination?
              aPos: bond.a.position,
              bPos: bond.b.position,
              doubleMaxRadius: Math.max( bond.a.covalentRadius, bond.b.covalentRadius ) * Math.max( bond.a.covalentRadius, bond.b.covalentRadius ),
              center: bond.a.position.blend( bond.b.position, 0.5 ),
              delta: bond.b.position.minus( bond.a.position ) // don't reverse this
            } );
          } );
        } );
      },
      drag: function( event, trail ) {
        context.beginPath();
        var isStep = !!lastPoint;
        if ( lastPoint ) {
          context.moveTo( lastPoint.x, lastPoint.y );
        }
        else {
          lastPoint = new Vector2();
        }

        // compute offset and draw the latest segment on the canvas
        lastPoint.setXY(
          event.pointer.point.x - globalBounds.x,
          event.pointer.point.y - globalBounds.y );
        context.lineTo( lastPoint.x, lastPoint.y );
        context.stroke();

        // transform to model coordinates, and get a model delta
        oldModelPoint.setXY( lastModelPoint.x, lastModelPoint.y );
        lastModelPoint.setXY( event.pointer.point.x, event.pointer.point.y );
        toModelTransform.getMatrix().multiplyVector2( lastModelPoint );

        if ( isStep ) {
          // handle the point and delta here
          self.cut( oldModelPoint, lastModelPoint, event );
        }
      },
      end: function( event, trail ) {
        lastPoint = null;
        var cutCount = 0;
        _.each( self.bondData, function( dat ) {
          if ( dat.cut ) {
            cutCount++;
            kit.breakBond( dat.bond.a, dat.bond.b, true ); // skip the destination separation
          }
        } );
        if ( cutCount ) {
          kit.separateMoleculeDestinations();
        }
        self.traveledDistance = 0;
        self.bondData = [];
        context.clearRect( 0, 0, globalBounds.width, globalBounds.height );
      }
    } );
  }
  buildAMolecule.register( 'SliceNode', SliceNode );

  return inherit( DOM, SliceNode, {
    cut: function( oldModelPoint, newModelPoint, event ) {
      var dragDeltaX = newModelPoint.x - oldModelPoint.x;
      var dragDeltaY = newModelPoint.y - oldModelPoint.y;

      _.each( this.bondData, function( dat ) {
        // skip already-cut bonds
        if ( dat.cut ) {
          return;
        }

        // skip farther away bonds (possible that we could have cases not cut on slow computers?)
        // TODO: improve this!
        if ( dat.center.distanceSquared( newModelPoint ) > 16 * dat.doubleMaxRadius ) {
          return;
        }

        var denom = -dragDeltaX * dat.delta.y + dat.delta.x * dragDeltaY;

        // too close to parallel
        if ( Math.abs( denom ) < 1e-5 ) {
          return;
        }

        var dx = dat.aPos.x - oldModelPoint.x;
        var dy = dat.aPos.y - oldModelPoint.y;

        var s = ( -dat.delta.y * dx + dat.delta.x * dy ) / denom;
        var t = ( dragDeltaX * dy - dragDeltaY * dx ) / denom;

        // TODO: weight it so that we can exclude cuts that aren't close enough to the bond
        if ( s >= 0 && s <= 1 && t >= 0 && t <= 1 ) {
          dat.cut = true; // collision detected
          // var ix = dat.aPos.x + t * dat.delta.x;
          // var iy = dat.aPos.y + t * dat.delta.y;
        }
      } );

      this.traveledDistance += Math.sqrt( dragDeltaX * dragDeltaX + dragDeltaY * dragDeltaY );
      if ( this.traveledDistance > sliceDistanceLimit && this.sliceInputListener.dragging ) {
        this.sliceInputListener.endDrag( event );
      }
    },

    updateCSSTransform: function( transform, element ) {
      // prevent CSS transforms, we work in the global space
    }
  } );
} );
