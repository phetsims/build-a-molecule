// Copyright 2002-2013, University of Colorado

/**
 * Allows slicing of bonds by swiping touches / mouse across the surface. Displays streak in high-performance way,
 * and has node.sliceInputListener which should be added to a node to initiate the slice.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Vector2 = require( 'DOT/Vector2' );
  var Transform3 = require( 'DOT/Transform3' );
  var inherit = require( 'PHET_CORE/inherit' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener

  var SliceNode = namespace.SliceNode = function SliceNode( viewSwipeBounds, view ) {
    var sliceNode = this;
    
    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( '2d' );
    DOM.call( this, canvas );
    
    var globalBounds;
    var toModelTransform;
    var lastPoint = null;
    var lastModelPoint = new Vector2();
    var oldModelPoint = new Vector2();
    var bondsCut = [];
    
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
        context.lineStyle = 'blue';
        toModelTransform = new Transform3( Constants.modelViewTransform.getInverse().timesMatrix( view.getUniqueTrail().getMatrix().inverted() ) );
      },
      drag: function( event, trail ) {
        context.beginPath();
        var isStep = !!lastPoint;
        if ( lastPoint ) {
          context.moveTo( lastPoint.x, lastPoint.y );
        } else {
          lastPoint = new Vector2();
        }
        
        // compute offset and draw the latest segment on the canvas
        lastPoint.set( event.pointer.point.x - globalBounds.x,
                       event.pointer.point.y - globalBounds.y );
        context.lineTo( lastPoint.x, lastPoint.y );
        context.stroke();
        
        // transform to model coordinates, and get a model delta
        oldModelPoint.set( lastModelPoint.x, lastModelPoint.y );
        lastModelPoint.set( lastPoint.x, lastPoint.y );
        toModelTransform.getMatrix().multiplyVector2( lastModelPoint );
        
        if ( isStep ) {
          // handle the point and delta here
          sliceNode.cut( oldModelPoint, lastModelPoint );
        }
      },
      end: function( event, trail ) {
        lastPoint = null;
        bondsCut = [];
        context.clearRect( 0, 0, globalBounds.width, globalBounds.height );
      }
    } );
  };

  return inherit( DOM, SliceNode, {
    cut: function( oldModelPoint, newModelPoint ) {
      
    },
    
    updateCSSTransform: function( transform, element ) {
      // prevent CSS transforms, we work in the global space
    }
  } );
} );
