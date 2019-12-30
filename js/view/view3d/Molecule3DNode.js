// Copyright 2013-2019, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * TODO: custom rotation, ball and stick view, perspective, optimization
 * REVIEW: Probably ignore perspective. Work with JO to use three.js for this, and potentially keeping in the
 * REVIEW: Canvas-only view (adding ball-and-stick mode to it)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const Arc = require( 'KITE/segments/Arc' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const DOM = require( 'SCENERY/nodes/DOM' );
  const EllipticalArc = require( 'KITE/segments/EllipticalArc' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Property = require( 'AXON/Property' );
  const Quaternion = require( 'DOT/Quaternion' );
  const Utils = require( 'SCENERY/util/Utils' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector3 = require( 'DOT/Vector3' );

  // constants
  const GRAB_INITIAL_TRANSFORMS = false; // debug flag, specifies whether master transforms are tracked and printed to determine "pretty" setup transformations

  function to3d( atom ) {
    const v = new Vector3( atom.x3d, atom.y3d, atom.z3d ).times( 75 ); // similar to picometers from angstroms? hopefully?
    v.element = atom.element;
    v.covalentRadius = atom.element.covalentRadius;
    v.color = atom.element.color;
    return v;
  }

  function ellipticalArcCut( ra, rb, d, theta ) {
    if ( theta > Math.PI / 2 ) {
      // other one is in front, bail!
    }

    // 2d circle-circle intersection point (ix,iy)
    const ix = ( d * d + ra * ra - rb * rb ) / ( 2 * d );
    const ixnorm = ix * ix / ( ra * ra );
    if ( ixnorm > 1 ) {
      // one contains the other
      return null;
    }
    const iy = ra * Math.sqrt( 1 - ixnorm );

    // elliptical arc center
    const cx = ix * Math.sin( theta );
    const cy = 0;

    // elliptical semi-minor/major axes
    const rx = iy * Math.cos( theta );
    const ry = iy;

    const cutoffTheta = Math.atan2( ix, iy ); // yes, tan( ix/iy ) converts to this, don't let your instincts tell you otherwise

    if ( theta < cutoffTheta - 1e-7 ) {
      // no arc needed
      return null;
    }

    const nx = ix / ( ra * Math.sin( theta ) );

    // start angle for our elliptical arc (from our ra circle's parametric frame)
    const psi = Math.acos( nx );

    // start angle for our elliptical arc (from the elliptical arc's parametric frame)
    const alpha = Math.atan2( ra * Math.sqrt( 1 - nx * nx ) / ry, ( ra * nx - cx ) / rx );

    assert && assert( isFinite( rx ) );

    //REVIEW: Maybe work this out with JO (Not the best example of documentation)
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

  //REVIEW: Note that this may change significantly if we go with a three.js/webgl solution
  function Molecule3DNode( completeMolecule, initialBounds, useHighRes ) {
    const self = this;

    this.draggingProperty = new Property( false );

    // prepare the canvas
    this.canvas = document.createElement( 'canvas' );
    this.context = this.canvas.getContext( '2d' );
    this.backingScale = useHighRes ? Utils.backingScale( this.context ) : 1;
    this.canvas.className = 'canvas-3d';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.setMoleculeCanvasBounds( initialBounds );

    // construct ourself with the canvas (now properly initially sized)
    DOM.call( this, this.canvas, {
      preventTransform: true
    } );

    // map the atoms into our enhanced format
    this.currentAtoms = completeMolecule.atoms.map( to3d );

    // center the bounds of the atoms
    const bounds3 = Bounds3.NOTHING.copy();
    this.currentAtoms.forEach( function( atom ) {
      bounds3.includeBounds( new Bounds3( atom.x - atom.covalentRadius, atom.y - atom.covalentRadius,
        atom.z - atom.covalentRadius, atom.x + atom.covalentRadius, atom.y + atom.covalentRadius,
        atom.z + atom.covalentRadius ) );
    } );
    const center3 = bounds3.center;
    if ( center3.magnitude ) {
      this.currentAtoms.forEach( function( atom ) {
        atom.subtract( center3 );
      } );
    }

    // compute our outer bounds so we can properly scale our transform to fit
    let maxTotalRadius = 0;
    this.currentAtoms.forEach( function( atom ) {
      maxTotalRadius = Math.max( maxTotalRadius, atom.magnitude + atom.covalentRadius );
    } );
    this.maxTotalRadius = maxTotalRadius;

    const gradientMap = {}; // element symbol => gradient
    this.currentAtoms.forEach( function( atom ) {
      if ( !gradientMap[ atom.element.symbol ] ) {
        gradientMap[ atom.element.symbol ] = self.createGradient( atom.element );
      }
    } );
    this.gradientMap = gradientMap;

    this.dragging = false;

    this.lastPosition = Vector2.ZERO;
    this.currentPosition = Vector2.ZERO;

    if ( GRAB_INITIAL_TRANSFORMS ) {
      this.masterMatrix = Matrix3.identity();
    }
  }
  buildAMolecule.register( 'Molecule3DNode', Molecule3DNode );

  // TODO: CH3Cl, CH3F, CH2O, H2O2, CH4, SiH4?, PH3?, BH3!!!
  Molecule3DNode.initialTransforms = {
    'H2O': Matrix3.createFromPool( 0.181499678570479, -0.7277838769374022, -0.6613535326501101,
      0.7878142178395282, 0.5101170681131106, -0.34515117700738,
      0.58856318679366, -0.45837888835509194, 0.6659445696615028 ),
    'NH3': Matrix3.createFromPool( 0.7256419599759283, 0.18308950432030757, -0.6632661451710371,
      0.6790637847806467, -0.03508484396138366, 0.7332403629940194,
      0.11097802540002322, -0.9824699929931513, -0.14978848669494887 ),
    'H2S': Matrix3.createFromPool( -0.18901936694052257, 0.7352299497445054, 0.6509290283280481,
      0.6994305856321851, 0.5660811210546954, -0.43629006436965734,
      -0.689252156183515, 0.37281239971888375, -0.6212426094628606 ),
    'CH3Cl': Matrix3.createFromPool( 0.8825247704702878, 0.05173884188266961, 0.46741108432194184,
      0.015533653906035873, 0.9901797180758173, -0.13893463033968592,
      -0.47000929257058355, 0.1298738547666077, 0.8730544351558881 ),
    'CH3F': Matrix3.createFromPool( 0.8515386742425068, -0.44125646463954543, 0.28315122935126347,
      0.055477678905364106, 0.6128668569406603, 0.7882362861521655,
      -0.5213483608995008, -0.655505109116242, 0.5463597153066077 ),
    'CH2O': Matrix3.createFromPool( 0.9997368891917565, -0.012558335901566027, -0.0191948062917274,
      -0.015732100867540004, 0.23358296278915427, -0.9722095969989872,
      0.016692914409624237, 0.9722557727748514, 0.2333239355798916 ),
    'H2O2': Matrix3.createFromPool( 0.9883033386786668, -0.039050026510889416, -0.14741643797796108,
      0.1506915835923199, 0.10160579587128599, 0.9833454677171222,
      -0.023421302078455858, -0.9940580253058, 0.10630185762294211 ),
    'CH4': Matrix3.createFromPool( 0.04028853904441277, -0.7991322177464342, 0.599803744721005,
      0.9515438854789072, -0.1524692943075213, -0.26705308142966117,
      0.30486237489952345, 0.5814987642747301, 0.7542666103690375 ),
    'SiH4': Matrix3.createFromPool( 0.7844433940344874, -0.04637688489644025, 0.618464021672209,
      -0.3857973635912633, 0.7442945323255373, 0.5451477262140444,
      -0.48560164312087234, -0.6662393216387146, 0.5659648491741326 ),
    'PH3': Matrix3.createFromPool( -0.37692852482667016, -0.8939295609213261, 0.2425176844747532,
      0.6824536128696786, -0.09100534451766336, 0.7252414036376821,
      -0.6262443240885491, 0.43887124237095504, 0.6443679687621515 )
  };

  return inherit( DOM, Molecule3DNode, {
    initializeDrag: function( target ) {
      const self = this;

      var dragListener = {
        up: function( event ) {
          self.dragging = false;
          event.pointer.removeInputListener( dragListener );
          event.handle();
          self.draggingProperty.set( false );
          if ( GRAB_INITIAL_TRANSFORMS ) {
            console.log( self.masterMatrix.toString() );
          }
        },

        cancel: function( event ) {
          self.dragging = false;
          event.pointer.removeInputListener( dragListener );
          self.draggingProperty.set( false );
        },

        move: function( event ) {
          self.currentPosition = event.pointer.point.copy();
        }
      };
      target.addInputListener( {
        up: function( event ) {
          event.handle();
        },

        down: function( event ) {
          if ( !self.dragging ) {
            self.dragging = true;
            self.lastPosition = self.currentPosition = event.pointer.point.copy();
            event.pointer.addInputListener( dragListener );
            self.draggingProperty.set( true );
          }
        }
      } );
    },

    createGradient: function( element ) {
      // var covalentDiameter = element.covalentRadius * 2;
      const gCenter = new Vector2( -element.covalentRadius / 5, -element.covalentRadius / 5 );
      const fullRadius = gCenter.minus( new Vector2( 1, 1 ).normalized().times( element.covalentRadius ) ).magnitude;
      const gradientFill = this.context.createRadialGradient( gCenter.x, gCenter.y, 0, gCenter.x, gCenter.y, fullRadius );

      const baseColor = new Color( element.color );
      gradientFill.addColorStop( 0, baseColor.colorUtilsBrighter( 0.5 ).toCSS() );
      gradientFill.addColorStop( 0.08, baseColor.colorUtilsBrighter( 0.2 ).toCSS() );
      gradientFill.addColorStop( 0.4, baseColor.colorUtilsDarker( 0.1 ).toCSS() );
      gradientFill.addColorStop( 0.8, baseColor.colorUtilsDarker( 0.4 ).toCSS() );
      gradientFill.addColorStop( 0.95, baseColor.colorUtilsDarker( 0.6 ).toCSS() );
      gradientFill.addColorStop( 1, baseColor.colorUtilsDarker( 0.4 ).toCSS() );
      return gradientFill;
    },

    draw: function() {
      const canvas = this.canvas;
      const context = this.context;

      const width = canvas.width;
      const height = canvas.height;
      const midX = width / 2;
      const midY = height / 2;
      context.setTransform( 1, 0, 0, 1, 0, 0 );
      context.clearRect( 0, 0, width, height );
      const bigScale = width / this.maxTotalRadius / 2.5;
      context.setTransform( bigScale, 0, 0, bigScale, midX - bigScale * midX, midY - bigScale * midY );

      const atoms = _.sortBy( this.currentAtoms, function( v ) { return v.z; } );

      for ( let i = 0; i < atoms.length; i++ ) {
        const atom = atoms[ i ];

        let arcs = [];

        // check each atom behind this one for occlusion
        for ( let k = 0; k < i; k++ ) {
          const otherAtom = atoms[ k ];

          const delta = otherAtom.minus( atom );
          const d = delta.magnitude;
          if ( d < atom.covalentRadius + otherAtom.covalentRadius - 1e-7 ) {
            const theta = delta.angleBetween( new Vector3( 0, 0, -1 ) );
            const arcData = ellipticalArcCut( atom.covalentRadius, otherAtom.covalentRadius, d, theta );
            if ( arcData ) {
              // angle to center of ellipse
              const phi = Math.atan2( delta.y, delta.x );
              const center = new Vector2( arcData.cx, arcData.cy ).rotated( phi );
              arcs.push( {
                center: center,
                rx: arcData.rx,
                ry: arcData.ry,
                rotation: phi,
                circleStart: phi - arcData.psi,
                circleEnd:   phi + arcData.psi,
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
        var arc;
        var ellipticalArc;
        if ( arcs.length ) {
          for ( let j = 0; j < arcs.length; j++ ) {
            ellipticalArc = new EllipticalArc( arcs[ j ].center,
              arcs[ j ].rx, arcs[ j ].ry,
              arcs[ j ].rotation,
              arcs[ j ].ellipseStart, arcs[ j ].ellipseEnd, false );
            const atEnd = j + 1 === arcs.length;
            arc = new Arc( Vector2.ZERO, atom.covalentRadius, arcs[ j ].circleEnd, atEnd ? ( arcs[ 0 ].circleStart + Math.PI * 2 ) : arcs[ j + 1 ].circleStart, false );
            ellipticalArc.writeToContext( context );
            arc.writeToContext( context );
          }
        }
        else {
          arc = new Arc( Vector2.ZERO, atom.covalentRadius, 0, Math.PI * 2, false );
          arc.writeToContext( context );
        }

        context.fillStyle = this.gradientMap[ atom.element.symbol ];

        context.fill();
        context.restore();
      }
    },

    tick: function( timeElapsed ) {
      let matrix;
      if ( !this.dragging && this.currentPosition.equals( this.lastPosition ) ) {
        matrix = Matrix3.rotationY( timeElapsed );
      }
      else {
        // TODO: WARNING: test high-res on iPad, this may be a bug here (includes scaled-up version!)
        const correctScale = 4 / this.canvas.width;
        const delta = this.currentPosition.minus( this.lastPosition );
        const quat = Quaternion.fromEulerAngles(
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
      this.currentAtoms.forEach( function( atom ) {
        matrix.multiplyVector3( atom );
      } );
      if ( GRAB_INITIAL_TRANSFORMS ) {
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
      // this.canvas.style.backgroundColor = '#000';
    },

    setMoleculeBounds: function( globalBounds ) {
      this.setMoleculeCanvasBounds( globalBounds );
      this.invalidateSelf( globalBounds );
    }
  } );
} );
