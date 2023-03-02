// Copyright 2020-2023, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import Bounds3 from '../../../../../dot/js/Bounds3.js';
import Matrix3, { m3 } from '../../../../../dot/js/Matrix3.js';
import Quaternion from '../../../../../dot/js/Quaternion.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import { Arc, EllipticalArc } from '../../../../../kite/js/imports.js';
import { Color, DOM, Utils } from '../../../../../scenery/js/imports.js';
import buildAMolecule from '../../../buildAMolecule.js';

// constants
// debug flag, specifies whether master transforms are tracked and printed to determine "pretty" setup transformations
const GRAB_INITIAL_TRANSFORMS = false;

class Molecule3DNode extends DOM {
  /**
   * @param {CompleteMolecule} completeMolecule
   * @param {Bounds2} initialBounds
   * @param {boolean} useHighRes
   */
  constructor( completeMolecule, initialBounds, useHighRes ) {
    // construct with the canvas (now properly initially sized)
    const canvas = document.createElement( 'canvas' );
    super( canvas, {
      preventTransform: true
    } );

    // @private {BooleanProperty}
    this.draggingProperty = new BooleanProperty( false );

    // @public {HTMLCanvasElement}
    this.canvas = canvas;

    // @private {number}
    this.backingScale = useHighRes ? Utils.backingScale( this.context ) : 1;

    // @private {CanvasRenderingContext2D}
    this.context = this.canvas.getContext( '2d' );
    this.canvas.className = 'canvas-3d';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.setMoleculeCanvasBounds( initialBounds );

    // @private {Array.<Vector3>} map the atoms into our enhanced format
    this.currentAtoms = completeMolecule.atoms.map( atom => {

      // similar to picometers from angstroms? hopefully?
      const v = new Vector3( atom.x3d, atom.y3d, atom.z3d ).times( 75 );
      v.element = atom.element;
      v.covalentRadius = atom.element.covalentRadius;
      v.color = atom.element.color;
      return v;
    } );

    const gradientMap = {}; // element symbol => gradient
    this.currentAtoms.forEach( atom => {
      if ( !gradientMap[ atom.element.symbol ] ) {
        gradientMap[ atom.element.symbol ] = this.createGradient( atom.element );
      }
    } );

    // @private {Object.<string,CanvasGradient>}
    this.gradientMap = gradientMap;

    // @private {boolean}
    this.dragging = false;

    // @private {Vector2}
    this.lastPosition = Vector2.ZERO;

    // @private {Vector2}
    this.currentPosition = Vector2.ZERO;

    if ( GRAB_INITIAL_TRANSFORMS ) {

      // @private {Matrix3}
      this.masterMatrix = Matrix3.identity();
    }

    // center the bounds of the atoms
    const bounds3 = Bounds3.NOTHING.copy();
    this.currentAtoms.forEach( atom => {
      bounds3.includeBounds( new Bounds3( atom.x - atom.covalentRadius, atom.y - atom.covalentRadius,
        atom.z - atom.covalentRadius, atom.x + atom.covalentRadius, atom.y + atom.covalentRadius,
        atom.z + atom.covalentRadius ) );
    } );
    const center3 = bounds3.center;
    if ( center3.magnitude ) {
      this.currentAtoms.forEach( atom => {
        atom.subtract( center3 );
      } );
    }

    // compute our outer bounds so we can properly scale our transform to fit
    let maxTotalRadius = 0;
    this.currentAtoms.forEach( atom => {
      maxTotalRadius = Math.max( maxTotalRadius, atom.magnitude + atom.covalentRadius );
    } );

    // @private {number}
    this.maxTotalRadius = maxTotalRadius;
  }

  /**
   * @param {Element} element
   * @private
   *
   * @returns {*}
   */
  createGradient( element ) {
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
  }

  /**
   * @param {number} ra
   * @param {number} rb
   * @param {number} d
   * @param {number} theta
   *
   * @private
   * @returns {Object.<number,number>}
   */
  ellipticalArcCut( ra, rb, d, theta ) {
    if ( theta > Math.PI / 2 ) {
      // other one is in front, bail!
    }

    // 2d circle-circle intersection point (interSectionPointX,interSectionPointY)
    const interSectionPointX = ( d * d + ra * ra - rb * rb ) / ( 2 * d );
    const ixnorm = interSectionPointX * interSectionPointX / ( ra * ra );
    if ( ixnorm > 1 ) {
      // one contains the other
      return null;
    }
    const interSectionPointY = ra * Math.sqrt( 1 - ixnorm );
    const interSectionPoint = new Vector2( interSectionPointX, interSectionPointY );

    // elliptical arc center
    const arcCenterX = interSectionPoint.x * Math.sin( theta );
    const arcCenterY = 0;
    const arcCenter = new Vector2( arcCenterX, arcCenterY );

    // elliptical semi-minor/major axes
    const ellipticalSemiMinor = interSectionPoint.y * Math.cos( theta );
    const ellipticalSemiMajor = interSectionPoint.y;

    // yes, tan( interSectionPointX/interSectionPointY ) converts to this, don't let your instincts tell you otherwise
    const cutoffTheta = Math.atan2( interSectionPoint.x, interSectionPoint.y );

    if ( theta < cutoffTheta - 1e-7 ) {
      // no arc needed
      return null;
    }

    const nx = interSectionPoint.x / ( ra * Math.sin( theta ) );

    // start angle for our elliptical arc (from our ra circle's parametric frame)
    const startAngle = Math.acos( nx );

    // start angle for our elliptical arc (from the elliptical arc's parametric frame)
    const alpha = Math.atan2( ra * Math.sqrt( 1 - nx * nx ) / ellipticalSemiMajor, ( ra * nx - arcCenter.x ) / ellipticalSemiMinor );

    assert && assert( isFinite( ellipticalSemiMinor ) );
    return {
      interSectionPointX: interSectionPoint.x,
      arcCenterX: arcCenter.x,
      arcCenterY: arcCenter.y,
      ellipticalSemiMinor: ellipticalSemiMinor,
      ellipticalSemiMajor: ellipticalSemiMajor,
      startAngle: startAngle,
      alpha: alpha
    };
  }

  /**
   * Visually create the molecule 3D Node
   * @public
   *
   * @return
   */
  draw() {
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

    const atoms = _.sortBy( this.currentAtoms, v => {
      return v.z;
    } );

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
          const arcData = this.ellipticalArcCut( atom.covalentRadius, otherAtom.covalentRadius, d, theta );
          if ( arcData ) {

            // angle to center of ellipse
            const phi = Math.atan2( delta.y, delta.x );
            const center = new Vector2( arcData.arcCenterX, arcData.arcCenterY ).rotated( phi );
            arcs.push( {
              center: center,
              rx: arcData.ellipticalSemiMinor,
              ry: arcData.ellipticalSemiMajor,
              rotation: phi,
              circleStart: phi - arcData.startAngle,
              circleEnd: phi + arcData.startAngle,
              ellipseStart: -arcData.alpha,
              ellipseEnd: arcData.alpha
            } );
          }
        }
      }
      arcs = _.sortBy( arcs, arc => {
        return arc.circleStart;
      } );

      context.save();
      context.translate( midX + atom.x, midY + atom.y );
      context.beginPath();
      let arc;
      let ellipticalArc;
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
  }

  /**
   * @param {number} timeElapsed
   *
   * @public
   */
  tick( timeElapsed ) {
    let matrix;
    if ( !this.dragging && this.currentPosition.equals( this.lastPosition ) ) {
      matrix = Matrix3.rotationY( timeElapsed );
    }
    else {
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
  }

  /**
   * Transform matrix of molecule
   * @param {Matrix3} matrix
   *
   * @public
   */
  transformMolecule( matrix ) {
    this.currentAtoms.forEach( atom => {
      matrix.multiplyVector3( atom );
    } );
    if ( GRAB_INITIAL_TRANSFORMS ) {
      this.masterMatrix = matrix.timesMatrix( this.masterMatrix );
    }
  }

  /**
   * Set the bounds of the canvas
   * @param {Bounds2} globalBounds
   *
   * @private
   */
  setMoleculeCanvasBounds( globalBounds ) {
    this.canvas.width = globalBounds.width * this.backingScale;
    this.canvas.height = globalBounds.height * this.backingScale;
    this.canvas.style.width = `${globalBounds.width}px`;
    this.canvas.style.height = `${globalBounds.height}px`;
    this.canvas.style.left = `${globalBounds.x}px`;
    this.canvas.style.top = `${globalBounds.y}px`;
  }
}

// @public {Matrix3} Custom transforms for specific molecules to correct the molecule orientation for viewing purposes
Molecule3DNode.initialTransforms = {
  H2O: m3( 0.181499678570479, -0.7277838769374022, -0.6613535326501101,
    0.7878142178395282, 0.5101170681131106, -0.34515117700738,
    0.58856318679366, -0.45837888835509194, 0.6659445696615028 ),
  NH3: m3( 0.7256419599759283, 0.18308950432030757, -0.6632661451710371,
    0.6790637847806467, -0.03508484396138366, 0.7332403629940194,
    0.11097802540002322, -0.9824699929931513, -0.14978848669494887 ),
  H2S: m3( -0.18901936694052257, 0.7352299497445054, 0.6509290283280481,
    0.6994305856321851, 0.5660811210546954, -0.43629006436965734,
    -0.689252156183515, 0.37281239971888375, -0.6212426094628606 ),
  CH3Cl: m3( 0.8825247704702878, 0.05173884188266961, 0.46741108432194184,
    0.015533653906035873, 0.9901797180758173, -0.13893463033968592,
    -0.47000929257058355, 0.1298738547666077, 0.8730544351558881 ),
  CH3F: m3( 0.8515386742425068, -0.44125646463954543, 0.28315122935126347,
    0.055477678905364106, 0.6128668569406603, 0.7882362861521655,
    -0.5213483608995008, -0.655505109116242, 0.5463597153066077 ),
  CH2O: m3( 0.9997368891917565, -0.012558335901566027, -0.0191948062917274,
    -0.015732100867540004, 0.23358296278915427, -0.9722095969989872,
    0.016692914409624237, 0.9722557727748514, 0.2333239355798916 ),
  H2O2: m3( 0.9883033386786668, -0.039050026510889416, -0.14741643797796108,
    0.1506915835923199, 0.10160579587128599, 0.9833454677171222,
    -0.023421302078455858, -0.9940580253058, 0.10630185762294211 ),
  CH4: m3( 0.04028853904441277, -0.7991322177464342, 0.599803744721005,
    0.9515438854789072, -0.1524692943075213, -0.26705308142966117,
    0.30486237489952345, 0.5814987642747301, 0.7542666103690375 ),
  SiH4: m3( 0.7844433940344874, -0.04637688489644025, 0.618464021672209,
    -0.3857973635912633, 0.7442945323255373, 0.5451477262140444,
    -0.48560164312087234, -0.6662393216387146, 0.5659648491741326 ),
  PH3: m3( -0.37692852482667016, -0.8939295609213261, 0.2425176844747532,
    0.6824536128696786, -0.09100534451766336, 0.7252414036376821,
    -0.6262443240885491, 0.43887124237095504, 0.6443679687621515 ),
  C2H4O2: m3( 0.9805217599814635, -0.1819063689114493, -0.0740753073048013,
    -0.18587417218418828, -0.7375332180401017, -0.6492268820696543,
    0.06346550494317185, 0.6503497714587849, -0.7569790647339203 )
};

buildAMolecule.register( 'Molecule3DNode', Molecule3DNode );
export default Molecule3DNode;