// Copyright 2013-2019, University of Colorado Boulder

/**
 * Allows slicing of bonds by swiping touches / mouse across the surface. Displays streak in high-performance way,
 * and has node.sliceInputListener which should be added to a node to initiate the slice.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const DOM = require( 'SCENERY/nodes/DOM' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  const timer = require( 'AXON/timer' );
  const Transform3 = require( 'DOT/Transform3' );
  const Vector2 = require( 'DOT/Vector2' );

  const sliceDistanceLimit = 1000;

  class SliceNode extends DOM {

  /**
   * @param {Kit} kit
   * @param {Bounds2} viewSwipeBounds
   * @param {MoleculeCollectingView} view
   * @constructor
   */
  constructor( kit, viewSwipeBounds, view ) {
    super();
    this.kit = kit;
    this.bondData = [];
    this.traveledDistance = 0;

    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' );
    DOM.call( this, canvas, {
      preventTransform: true
    } );

    let globalBounds;
    let toModelTransform;
    let lastPoint = null;
    const lastModelPoint = new Vector2( 0, 0 );
    const oldModelPoint = new Vector2( 0, 0 );

    this.sliceInputListener = new SimpleDragHandler( {
      dragCursor: 'none',
      start: ( event, trail ) => {
        globalBounds = view.localToGlobalBounds( viewSwipeBounds ).roundedOut();
        canvas.width = globalBounds.width;
        canvas.height = globalBounds.height;
        canvas.style.width = globalBounds.width + 'px';
        canvas.style.height = globalBounds.height + 'px';
        canvas.style.position = 'absolute';
        canvas.style.left = globalBounds.x + 'px';
        canvas.style.top = globalBounds.y + 'px';
        toModelTransform = new Transform3( BAMConstants.MODEL_VIEW_TRANSFORM.getInverse().timesMatrix( view.getUniqueTrail().getMatrix().inverted() ) );

        kit.molecules.forEach( molecule => {
          molecule.bonds.forEach( bond => {
            this.bondData.push( {
              bond: bond,
              cut: false,
              // TODO: also try out destination?
              aPos: bond.a.positionProperty.value,
              bPos: bond.b.positionProperty.value,
              doubleMaxRadius: Math.max( bond.a.covalentRadius, bond.b.covalentRadius ) * Math.max( bond.a.covalentRadius, bond.b.covalentRadius ),
              center: bond.a.positionProperty.value.blend( bond.b.positionProperty.value, 0.5 ),
              delta: bond.b.positionProperty.value.minus( bond.a.positionProperty.value ) // don't reverse this
            } );
          } );
        } );
      },
      drag: ( event, trail ) => {
        context.beginPath();
        const isStep = !!lastPoint;
        if ( lastPoint ) {
          context.moveTo( lastPoint.x, lastPoint.y );
        }
        else {
          lastPoint = new Vector2( 0, 0 );
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
          this.cut( oldModelPoint, lastModelPoint, event );
        }
      },
      end: ( event, trail ) => {
        lastPoint = null;
        let cutCount = 0;
        this.bondData.forEach( dat => {
          if ( dat.cut ) {
            cutCount++;
            kit.breakBond( dat.bond.a, dat.bond.b, true ); // skip the destination separation
          }
        } );
        if ( cutCount ) {
          kit.separateMoleculeDestinations();
        }
        this.traveledDistance = 0;
        this.bondData = [];
        context.clearRect( 0, 0, globalBounds.width, globalBounds.height );
      }
    } );
  }

    cut( oldModelPoint, newModelPoint, event ) {
      const dragDeltaX = newModelPoint.x - oldModelPoint.x;
      const dragDeltaY = newModelPoint.y - oldModelPoint.y;

      this.bondData.forEach( dat => {
        // skip already-cut bonds
        if ( dat.cut ) {
          return;
        }

        // skip farther away bonds (possible that we could have cases not cut on slow computers?)
        // TODO: improve this!
        if ( dat.center.distanceSquared( newModelPoint ) > 16 * dat.doubleMaxRadius ) {
          return;
        }

        const denom = -dragDeltaX * dat.delta.y + dat.delta.x * dragDeltaY;

        // too close to parallel
        if ( Math.abs( denom ) < 1e-5 ) {
          return;
        }

        const dx = dat.aPos.x - oldModelPoint.x;
        const dy = dat.aPos.y - oldModelPoint.y;

        const s = ( -dat.delta.y * dx + dat.delta.x * dy ) / denom;
        const t = ( dragDeltaX * dy - dragDeltaY * dx ) / denom;

        // TODO: weight it so that we can exclude cuts that aren't close enough to the bond
        if ( s >= 0 && s <= 1 && t >= 0 && t <= 1 ) {
          dat.cut = true; // collision detected
          // const ix = dat.aPos.x + t * dat.delta.x;
          // const iy = dat.aPos.y + t * dat.delta.y;
        }
      } );

      this.traveledDistance += Math.sqrt( dragDeltaX * dragDeltaX + dragDeltaY * dragDeltaY );
      if ( this.traveledDistance > sliceDistanceLimit && this.sliceInputListener.dragging ) {
        timer.setTimeout( () => {
          this.sliceInputListener.endDrag( event );
        }, 0 );
      }
    }

    updateCSSTransform( transform, element ) {
      // prevent CSS transforms, we work in the global space
    }
  }

  return buildAMolecule.register( 'SliceNode', SliceNode );

} );
