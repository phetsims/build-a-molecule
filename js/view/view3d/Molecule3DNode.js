// Copyright 2002-2013, University of Colorado

/**
 * 3D Molecule display that takes up the entire screen
 *
 * TODO: custom rotation, ball and stick view, perspective, optimization
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';

  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector3 = require( 'DOT/Vector3' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Bounds3 = require( 'DOT/Bounds3' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Quaternion = require( 'DOT/Quaternion' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );
  var Arc = require( 'KITE/segments/Arc' );
  var EllipticalArc = require( 'KITE/segments/EllipticalArc' );
  var DotUtil = require( 'DOT/Util' );
  var Ray3 = require( 'DOT/Ray3' );
  var Element = require( 'NITROGLYCERIN/Element' );
  
  var grabInitialTransforms = false; // debug flag, specifies whether master transforms are tracked and printed to determine "pretty" setup transformations
  
  function to3d( atom ) {
    var v = new Vector3( atom.x3d(), atom.y3d(), atom.z3d() ).times( 75 ); // similar to picometers from angstroms? hopefully?
    v.element = atom.element;
    v.radius = atom.element.radius;
    v.color = atom.element.color;
    return v;
  }
  
  function ellipticalArcCut( ra, rb, d, theta ) {
    if ( theta > Math.PI / 2 ) {
      // other one is in front, bail!
    }
    
    // 2d circle-circle intersection point
    var ix = ( d * d + ra * ra - rb * rb ) / ( 2 * d );
    var iy = ra * Math.sqrt( 1 - ix * ix / ( ra * ra ) );
    
    // elliptical arc center
    var cx = ix * Math.sin( theta );
    var cy = 0;
    
    // elliptical semi-minor/major axes
    var rx = iy * Math.cos( theta );
    var ry = iy;
    
    var cutoffTheta = Math.atan2( ix, iy ); // yes, tan( ix/iy ) converts to this, don't let your instincts tell you otherwise
    
    if ( theta < cutoffTheta - 1e-7 ) {
      // no arc needed
      return null;
    }
    
    var nx = ix / ( ra * Math.sin( theta ) );
    
    // start angle for our elliptical arc (from our ra circle's parametric frame)
    var psi = Math.acos( nx );
    
    // start angle for our elliptical arc (from the elliptical arc's parametric frame)
    var alpha = Math.atan2( ra * Math.sqrt( 1 - nx * nx ) / ry, ( ra * nx - cx ) / rx );
    
    return {
      ix: ix,
      iy: iy,
      cx: cx,
      cy: cy,
      rx: rx,
      ry: ry,
      nx: nx,
      psi: psi,
      alpha: alpha
    };
  }
  
  var Molecule3DNode = namespace.Molecule3DNode = function Molecule3DNode( completeMolecule, initialBounds, useHighRes ) {
    var moleculeNode = this;
    
    // prepare the canvas
    this.canvas = document.createElement( 'canvas' );
    this.context = this.canvas.getContext( '2d' );
    this.backingScale = useHighRes ? Util.backingScale( this.context ) : 1;
    this.canvas.className = 'canvas-3d';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.setMoleculeCanvasBounds( initialBounds );
    
    // construct ourself with the canvas (now properly initially sized)
    DOM.call( this, this.canvas );
    
    // map the atoms into our enhanced format
    this.currentAtoms = completeMolecule.atoms.map( to3d );
    
    // center the bounds of the atoms
    var bounds3 = Bounds3.NOTHING.copy();
    _.each( this.currentAtoms, function( atom ) {
      bounds3.includeBounds( new Bounds3( atom.x - atom.radius, atom.y - atom.radius, atom.z - atom.radius,
                                          atom.x + atom.radius, atom.y + atom.radius, atom.z + atom.radius ) );
    } );
    var center3 = bounds3.center;
    if ( center3.magnitude() ) {
      _.each( this.currentAtoms, function( atom ) {
        atom.subtract( center3 );
      } );
    }
    
    // compute our outer bounds so we can properly scale our transform to fit
    var maxTotalRadius = 0;
    _.each( this.currentAtoms, function( atom ) {
      maxTotalRadius = Math.max( maxTotalRadius, atom.magnitude() + atom.radius );
    } );
    this.maxTotalRadius = maxTotalRadius;
    
    var gradientMap = {}; // element symbol => gradient
    _.each( this.currentAtoms, function( atom ) {
      if ( !gradientMap[atom.element.symbol] ) {
        gradientMap[atom.element.symbol] = moleculeNode.createGradient( atom.element );
      }
    } );
    this.gradientMap = gradientMap;
    
    this.upCursor();
    
    this.dragging = false;
    
    this.lastPosition = Vector2.ZERO;
    this.currentPosition = Vector2.ZERO;
    var dragListener = {
      up: function( event ) {
        moleculeNode.dragging = false;
        event.pointer.removeInputListener( dragListener );
        event.handle();
        moleculeNode.upCursor();
        if ( grabInitialTransforms ) {
          console.log( moleculeNode.masterMatrix.toString() );
        }
      },
      
      cancel: function( event ) {
        moleculeNode.dragging = false;
        event.pointer.removeInputListener( dragListener );
        moleculeNode.upCursor();
      },
      
      move: function( event ) {
        moleculeNode.currentPosition = event.pointer.point.copy();
      }
    };
    this.addInputListener( {
      up: function( event ) {
        event.handle();
      },
      
      down: function( event ) {
        if ( !moleculeNode.dragging ) {
          moleculeNode.dragging = true;
          moleculeNode.lastPosition = moleculeNode.currentPosition = event.pointer.point.copy();
          event.pointer.addInputListener( dragListener );
          moleculeNode.downCursor();
        }
      }
    } );
    
    if ( grabInitialTransforms ) {
      this.masterMatrix = new Matrix3();
    }
  };
  
  Molecule3DNode.initialTransforms = {
    'H2O':
      new Matrix3( 0.181499678570479,  -0.7277838769374022, -0.6613535326501101,
                   0.7878142178395282,  0.5101170681131106, -0.34515117700738,
                   0.58856318679366,   -0.45837888835509194, 0.6659445696615028 ),
    'NH3':
      new Matrix3( 0.7256419599759283,   0.18308950432030757, -0.6632661451710371,
                   0.6790637847806467,  -0.03508484396138366,  0.7332403629940194,
                   0.11097802540002322, -0.9824699929931513,  -0.14978848669494887 )
  };

  return inherit( DOM, Molecule3DNode, {
    upCursor: function() {
      // fallbacks first, best way to ensure browsers keep the last one that works
      this.canvas.style.cursor = 'pointer';
      this.canvas.style.cursor = '-webkit-grab';
      this.canvas.style.cursor = '-moz-grab';
      this.canvas.style.cursor = 'grab';
    },
    
    downCursor: function() {
      // fallbacks first, best way to ensure browsers keep the last one that works
      this.canvas.style.cursor = 'move';
      this.canvas.style.cursor = '-webkit-grabbing';
      this.canvas.style.cursor = '-moz-grabbing';
      this.canvas.style.cursor = 'grabbing';
    },
    
    createGradient: function( element ) {
      var diameter = element.radius * 2;
      var gCenter = new Vector2( -element.radius / 5, -element.radius / 5 );
      var middleRadius = diameter / 3;
      var fullRadius = gCenter.minus( new Vector2( 1, 1 ).normalized().times( element.radius ) ).magnitude();
      var gradientFill = this.context.createRadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );
      
      var baseColor = new Color( element.color );
      gradientFill.addColorStop( 0, baseColor.colorUtilsBrighter( 0.5 ).toCSS() );
      gradientFill.addColorStop( 0.08, baseColor.colorUtilsBrighter( 0.2 ).toCSS() );
      gradientFill.addColorStop( 0.4, baseColor.colorUtilsDarker( 0.1 ).toCSS() );
      gradientFill.addColorStop( 0.8, baseColor.colorUtilsDarker( 0.4 ).toCSS() );
      gradientFill.addColorStop( 0.95, baseColor.colorUtilsDarker( 0.6 ).toCSS() );
      gradientFill.addColorStop( 1, baseColor.colorUtilsDarker( 0.4 ).toCSS() );
      return gradientFill;
    },
    
    draw: function() {
      var canvas = this.canvas;
      var context = this.context;
      
      var width = canvas.width;
      var height = canvas.height;
      var midX = width / 2;
      var midY = height / 2;
      context.setTransform( 1, 0, 0, 1, 0, 0 );
      context.clearRect( 0, 0, width, height );
      var bigScale = width / this.maxTotalRadius / 2.5;
      context.setTransform( bigScale, 0, 0, bigScale, midX - bigScale * midX, midY - bigScale * midY );
      
      var atoms = _.sortBy( this.currentAtoms, function( v ) { return v.z; } );
      
      for ( var i = 0; i < atoms.length; i++ ) {
        var atom = atoms[i];
        var element = atom.element;
        
        var arcs = [];
        
        // check each atom behind this one for occlusion
        for ( var k = 0; k < i; k++ ) {
          var otherAtom = atoms[k];
          
          var delta = otherAtom.minus( atom );
          var d = delta.magnitude();
          if ( d < atom.radius + otherAtom.radius - 1e-7 ) {
            var theta = delta.angleBetween( new Vector3( 0, 0, -1 ) );
            var arcData = ellipticalArcCut( atom.radius, otherAtom.radius, d, theta );
            if ( arcData ) {
              // angle to center of ellipse
              var phi = Math.atan2( delta.y, delta.x );
              var center = new Vector2( arcData.cx, arcData.cy ).rotated( phi );
              arcs.push( {
                center: center,
                rx: arcData.rx,
                ry: arcData.ry,
                rotation: phi,
                circleStart: phi - arcData.psi,
                circleEnd: phi + arcData.psi,
                ellipseStart: -arcData.alpha,
                ellipseEnd: arcData.alpha
              } );
            }
          }
        }
        
        arcs = _.sortBy( arcs, function( arc ) { return arc.circleStart; } );
        
        context.save();
        context.translate( midX + atom.x, midY + atom.y );
        context.beginPath();
        var arc, ellipticalArc;
        if ( arcs.length ) {
          for ( var j = 0; j < arcs.length; j++ ) {
            ellipticalArc = new EllipticalArc( arcs[j].center,
                                               arcs[j].rx, arcs[j].ry,
                                               arcs[j].rotation,
                                               arcs[j].ellipseStart, arcs[j].ellipseEnd, false );
            var atEnd = j + 1 === arcs.length;
            arc = new Arc( Vector2.ZERO, atom.radius, arcs[j].circleEnd, atEnd ? ( arcs[0].circleStart + Math.PI * 2 ) : arcs[j+1].circleStart, false );
            ellipticalArc.writeToContext( context );
            arc.writeToContext( context );
          }
        } else {
          arc = new Arc( Vector2.ZERO, atom.radius, 0, Math.PI * 2, false );
          arc.writeToContext( context );
        }
        
        context.fillStyle = this.gradientMap[atom.element.symbol];
            
        context.fill();
        context.restore();
      }
    },
    
    tick: function( timeElapsed ) {
      var matrix;
      if ( !this.dragging && this.currentPosition.equals( this.lastPosition ) ) {
        matrix = Matrix3.rotationY( timeElapsed );
      } else {
        // TODO: WARNING: test high-res on iPad, this may be a bug here (includes scaled-up version!)
        var correctScale = 4 / this.canvas.width;
        var delta = this.currentPosition.minus( this.lastPosition );
        var quat = Quaternion.fromEulerAngles(
          -delta.y * correctScale, // yaw
          delta.x * correctScale,  // roll
          0                        // pitch
        );
        matrix = quat.toRotationMatrix();
        this.lastPosition = this.currentPosition;
      }
      this.transformMolecule( matrix );
      this.draw();
    },
    
    transformMolecule: function( matrix ) {
      _.each( this.currentAtoms, function( atom ) {
        matrix.multiplyVector3( atom );
      } );
      if ( grabInitialTransforms ) {
        this.masterMatrix = matrix.timesMatrix( this.masterMatrix );
      }
    },
    
    setMoleculeCanvasBounds: function( globalBounds ) {
      this.canvas.width = globalBounds.width * this.backingScale;
      this.canvas.height = globalBounds.height * this.backingScale;
      this.canvas.style.width = globalBounds.width + 'px';
      this.canvas.style.height = globalBounds.height + 'px';
      this.canvas.style.left = globalBounds.x + 'px';
      this.canvas.style.top = globalBounds.y + 'px';
      this.canvas.style.backgroundColor = '#000';
      this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
      this.context.fillStyle = 'rgba(0,255,0,0.5)';
      this.context.fillRect( 0, 0, this.canvas.width, this.canvas.height );
    },
    
    setMoleculeBounds: function( globalBounds ) {
      this.setMoleculeCanvasBounds( globalBounds );
      this.invalidateSelf( globalBounds );
    }
  } );
} );
