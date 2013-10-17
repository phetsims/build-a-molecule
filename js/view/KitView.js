// Copyright 2002-2013, University of Colorado

/**
 * Shows a kit (series of buckets full of different types of atoms)
 *
 * TODO: consider 'KitNode' as a name?
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var inherit = require( 'PHET_CORE/inherit' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Transform3 = require( 'DOT/Transform3' );
  var Shape = require( 'KITE/Shape' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Trail = require( 'SCENERY/util/Trail' );
  var AtomNode = require( 'BAM/view/AtomNode' );
  var MoleculeBondContainerNode = require( 'BAM/view/MoleculeBondContainerNode' );
  var MoleculeMetadataNode = require( 'BAM/view/MoleculeMetadataNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  
  var KitView = namespace.KitView = function KitView( kit, view ) {
    Node.call( this, { layerSplit: true } );
    var kitView = this;
    
    this.kit = kit;
    this.view = view;
    
    this.metadataMap = {}; // moleculeId => MoleculeMetadataNode
    this.bondMap = {}; // moleculeId => MoleculeBondContainerNode
    this.atomNodeMap = {}; // atom.id => AtomNode
    
    var topLayer = this.topLayer = new Node();
    var metadataLayer = this.metadataLayer = new Node();
    var atomLayer = this.atomLayer = new Node();
    var bottomLayer = this.bottomLayer = new Node();
    
    var viewSwipeBounds = Constants.modelViewTransform.modelToViewBounds( kit.layoutBounds.availablePlayAreaBounds );
    var swipeCatch = this.swipeCatch = Rectangle.bounds( viewSwipeBounds.eroded( Constants.viewPadding ), { layerSplit: true } );
    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( '2d' );
    var dom = new DOM( canvas );
    topLayer.addChild( dom );
    dom.updateCSSTransform = function( transform, element ) {}; // don't CSS transform it
    var globalBounds;
    var toModelTransform;
    var lastPoint = null;
    var lastModelPoint = new Vector2();
    var oldModelPoint = new Vector2();
    var bondsCut = [];
    function cut( oldPoint, newPoint ) {
      
    }
    swipeCatch.addInputListener( new SimpleDragHandler( {
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
          cut( oldModelPoint, lastModelPoint );
        }
      },
      end: function( event, trail ) {
        lastPoint = null;
        bondsCut = [];
        context.clearRect( 0, 0, globalBounds.width, globalBounds.height );
      }
    } ) );
    
    this.addChild( swipeCatch );
    this.addChild( bottomLayer );
    this.addChild( atomLayer );
    this.addChild( metadataLayer );
    this.addChild( topLayer );
    
    // override its hit testing
    atomLayer.trailUnderPoint = function( point, options, recursive, hasListener ) {
      // return accurate hits for the mouse
      if ( options && options.isMouse ) {
        return Node.prototype.trailUnderPoint.call( atomLayer, point, options, recursive, hasListener );
      }
      
      // probably a touch or something we will target
      var modelPoint = Constants.modelViewTransform.viewToModelPosition( point );
      var atom = kitView.closestAtom( modelPoint, 100 );
      if ( atom ) {
        // TODO: this is somewhat hackish. better way of doing this?
        return new Trail( [atomLayer, kitView.atomNodeMap[atom.id]] );
      } else {
        return null;
      }
    };
    // ensure that touches don't get pruned before this point
    atomLayer.touchArea = Shape.bounds( Constants.stageSize.toBounds() );
    
    _.each( kit.buckets, function( bucket ) {
      var bucketFront = new BucketFront( bucket, Constants.modelViewTransform, {
        labelFont: new PhetFont( {
          weight: 'bold',
          size: 18,
          family: 'Arial, sans-serif'
        } ) // matching the old look for now
      } );
      var bucketHole = new BucketHole( bucket, Constants.modelViewTransform );
      // NOTE: we will use the Bucket's hole with an expanded touch area to trigger the "grab by touching the bucket" behavior
      bucketHole.touchArea = bucketHole.mouseArea = new Shape().moveTo( bucketHole.left - bucketHole.x, bucketHole.centerY - bucketHole.y )
                                                               .lineTo( bucketHole.left - bucketHole.x + 17, bucketHole.centerY + 60 - bucketHole.y )
                                                               .lineTo( bucketHole.right - bucketHole.x - 17, bucketHole.centerY + 60 - bucketHole.y )
                                                               .lineTo( bucketHole.right - bucketHole.x, bucketHole.centerY - bucketHole.y )
                                                               .lineTo( bucketHole.right - bucketHole.x - 35, bucketHole.centerY - 10 - bucketHole.y )
                                                               .lineTo( bucketHole.left - bucketHole.x + 35, bucketHole.centerY - 10 - bucketHole.y )
                                                               .close();
      // we will be updating the bucket's cursor depending on whether it has atoms
      function bucketHoleCursorUpdate() {
        bucketHole.cursor = bucket.atoms.length ? 'pointer' : 'default';
      }
      kit.on( 'addedMolecule', bucketHoleCursorUpdate );
      kit.on( 'removedMolecule', bucketHoleCursorUpdate );
      bucketHoleCursorUpdate();
      
      // but don't pick the elliptical paths in the hole (that would be expensive to compute so often)
      _.each( bucketHole.children, function( child ) { child.pickable = false; } );
      
      // our hook to start dragging an atom (if available in the bucket)
      bucketHole.addInputListener( {
        down: function( event ) {
          // coordinate transforms to get our atom
          var viewPoint = view.globalToLocalPoint( event.pointer.point );
          var modelPoint = Constants.modelViewTransform.viewToModelPosition( viewPoint );
          var atom = kitView.closestAtom( modelPoint, Number.POSITIVE_INFINITY, bucket.element ); // filter by the element
          
          // if it's not in our bucket, ignore it (could skip weird cases where an atom outside of the bucket is technically closer)
          if ( !_.contains( bucket.atoms, atom ) ) {
            return;
          }
          
          // move the atom to right under the pointer for this assisted drag - otherwise the offset would be too noticeable
          atom.position = atom.destination = modelPoint;
          
          var atomNode = kitView.atomNodeMap[atom.id];
          // TODO: use a new DragListener
          event.target = event.currentTarget = atomNode; // for now, modify the event directly so we can "point" it towards the atom node instead
          
          // trigger the drag start
          atomNode.atomDragListener.startDrag( event );
        }
      } );

      topLayer.addChild( bucketFront );
      bottomLayer.addChild( bucketHole );
      
      _.each( bucket.atoms, function( atom ) {
        var atomNode = new AtomNode( atom, {
          // renderer: 'svg',
          // rendererOptions: { cssTransform: true }
        } );
        kitView.atomNodeMap[atom.id] = atomNode;
        atomLayer.addChild( atomNode );
        
        // Add a drag listener that will move the model element when the user
        // drags this atom.
        var atomListener = new SimpleDragHandler( {
          start: function( evt, trail ) {
            atom.userControlled = true;
            
            var molecule = kit.getMolecule( atom );
            if ( molecule ) {
              _.each( molecule.atoms, function( moleculeAtom ) {
                kitView.atomNodeMap[moleculeAtom.id].moveToFront();
              } );
            } else {
              atomNode.moveToFront();
            }
          },
          
          end: function( evt, trail ) {
            atom.userControlled = false;
          },
          
          translate: function( data ) {
            var modelDelta = Constants.modelViewTransform.viewToModelDelta( data.delta );
            kit.atomDragged( atom, modelDelta );
          }
        } );
        atomNode.addInputListener( atomListener );
        atomNode.atomDragListener = atomListener;
      } );
    } );
    
    // handle molecule creation and destruction
    kit.on( 'addedMolecule', function( molecule ) {
      var moleculeMetadataNode = new MoleculeMetadataNode( kit, molecule );
      metadataLayer.addChild( moleculeMetadataNode );
      kitView.metadataMap[molecule.moleculeId] = moleculeMetadataNode;

      if ( Constants.allowBondBreaking ) {
        kitView.addMoleculeBondNodes( molecule );
      }
    } );
    kit.on( 'removedMolecule', function( molecule ) {
      var moleculeMetadataNode = kitView.metadataMap[molecule.moleculeId];
      moleculeMetadataNode.destruct();
      metadataLayer.removeChild( moleculeMetadataNode );
      delete kitView.metadataMap[molecule.moleculeId];

      if ( Constants.allowBondBreaking ) {
        kitView.removeMoleculeBondNodes( molecule );
      }
    } );
    
    assert && assert( kit.molecules.length === 0 );
  };
  
  inherit( Node, KitView, {
    // distance needs to be within threshold, and if an element is provided, the element must match
    closestAtom: function( modelPoint, threshold, element ) {
      assert && assert( threshold );
      
      var thresholdSquared = threshold * threshold;
      
      var atoms = this.kit.atoms;
      var numAtoms = atoms.length;
      
      var best = null;
      var bestDistanceSquared = thresholdSquared; // limit ourselves at the threshold, and add this to the best distance so we only need one check in the loop
      
      var x = modelPoint.x;
      var y = modelPoint.y;
      
      // ignore stacking order for this operation
      for ( var i = 0; i < numAtoms; i++ ) {
        var atom = atoms[i];
        var position = atom.positionProperty.get(); // no ES5 setters so we have the fastest possible code in this inner loop (called during hit testing)
        
        var dx = x - position.x;
        var dy = y - position.y;
        
        // not really distance, persay, since it can go negative
        var distanceSquared = dx * dx + dy * dy - atom.radius * atom.radius;
        
        if ( distanceSquared > bestDistanceSquared || ( element && atom.element !== element ) ) {
          continue;
        }
        
        bestDistanceSquared = distanceSquared;
        best = atom;
      }
      
      return best;
    },
    
    addMoleculeBondNodes: function( molecule ) {
      var moleculeBondContainerNode = new MoleculeBondContainerNode( this.kit, molecule, this.view );
      this.metadataLayer.addChild( moleculeBondContainerNode );
      this.bondMap[molecule.moleculeId] = moleculeBondContainerNode;
    },

    removeMoleculeBondNodes: function( molecule ) {
      var moleculeBondContainerNode = this.bondMap[molecule.moleculeId];
      moleculeBondContainerNode.destruct();
      this.metadataLayer.removeChild( moleculeBondContainerNode );
      delete this.bondMap[molecule.moleculeId];
    }
  } );
  
  return KitView;
} );
