// Copyright 2013-2019, University of Colorado Boulder

/**
 * Shows a kit (series of buckets full of different types of atoms)
 *
 * TODO: consider 'KitNode' as a name?
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var DragListener = require( 'SCENERY/listeners/DragListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeBondContainerNode = require( 'BUILD_A_MOLECULE/view/MoleculeBondContainerNode' );
  // var MoleculeControlsHBox = require( 'BUILD_A_MOLECULE/view/MoleculeControlsHBox' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  // var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  // var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  // var SliceNode = require( 'BUILD_A_MOLECULE/view/SliceNode' );
  // var Trail = require( 'SCENERY/util/Trail' );

  /**
   * @param {Kit} kit
   * @param {MoleculeCollectingView} moleculeCollectingView
   * @constructor
   */
  function KitView( kit, moleculeCollectingView ) {
    Node.call( this );
    var self = this;

    this.kit = kit;

    this.metadataMap = {}; // moleculeId => MoleculeControlsHBox
    this.bondMap = {}; // moleculeId => MoleculeBondContainerNode
    this.atomNodeMap = {}; // atom.id => AtomNode

    var topLayer = this.topLayer = new Node();
    // var metadataLayer = this.metadataLayer = new Node();
    var atomLayer = new Node();
    this.atomLayer = atomLayer;
    var bottomLayer = this.bottomLayer = new Node();

    // var viewSwipeBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds( kit.collectionLayout.availablePlayAreaBounds );
    // var sliceNode = this.sliceNode = new SliceNode( kit, viewSwipeBounds, moleculeCollectingView );

    // swipeCatch.addInputListener( sliceNode.sliceInputListener );

    // this.addChild( swipeCatch );
    this.addChild( bottomLayer );
    this.addChild( atomLayer );
    // this.addChild( metadataLayer );
    this.addChild( topLayer );
    // this.addChild( sliceNode );

    // override its hit testing
    // // TODO: REALLY don't do this. Super easy to break
    // // REVIEW: Definitely replace with a better way
    // atomLayer.hitTest = function( point, isMouse, isTouch ) {
    //   // return accurate hits for the mouse
    //   if ( isMouse ) {
    //     return Node.prototype.hitTest.call( atomLayer, point, isMouse, isTouch );
    //   }
    //
    //   // probably a touch or something we will target
    //   var modelPoint = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelPosition( point );
    //   var atom = self.closestAtom( modelPoint, 100 );
    //   if ( atom ) {
    //     // TODO: this is somewhat hackish. better way of doing this?
    //     return new Trail( [ atomLayer, self.atomNodeMap[ atom.id ] ] );
    //   }
    //   else {
    //     return null;
    //   }
    // };
    // ensure that touches don't get pruned before this point
    // atomLayer.touchArea = Shape.bounds( BAMConstants.STAGE_SIZE );

    kit.buckets.forEach( function( bucket ) {
      var bucketFront = new BucketFront( bucket, BAMConstants.MODEL_VIEW_TRANSFORM, {
        labelFont: new PhetFont( {
          weight: 'bold',
          size: 18
        } )
      } );
      var bucketHole = new BucketHole( bucket, BAMConstants.MODEL_VIEW_TRANSFORM );
      // NOTE: we will use the Bucket's hole with an expanded touch area to trigger the "grab by touching the bucket" behavior
      bucketHole.touchArea = bucketHole.mouseArea = new Shape()
        .moveTo( bucketHole.left - bucketHole.x, bucketHole.centerY - bucketHole.y )
        .lineTo( bucketHole.left - bucketHole.x + 17, bucketHole.centerY + 60 - bucketHole.y )
        .lineTo( bucketHole.right - bucketHole.x - 17, bucketHole.centerY + 60 - bucketHole.y )
        .lineTo( bucketHole.right - bucketHole.x, bucketHole.centerY - bucketHole.y )
        .lineTo( bucketHole.right - bucketHole.x - 35, bucketHole.centerY - 10 - bucketHole.y )
        .lineTo( bucketHole.left - bucketHole.x + 35, bucketHole.centerY - 10 - bucketHole.y )
        .close();

      // we will be updating the bucket's cursor depending on whether it has atoms
      function bucketHoleCursorUpdate() {
        bucketHole.cursor = bucket.getParticleList().length ? 'pointer' : 'default';
      }

      kit.addedMoleculeEmitter.addListener( bucketHoleCursorUpdate );
      kit.removedMoleculeEmitter.addListener( bucketHoleCursorUpdate );
      bucketHoleCursorUpdate();

      // but don't pick the elliptical paths in the hole (that would be expensive to compute so often)
      bucketHole.children.forEach( function( child ) { child.pickable = false; } );

      // our hook to start dragging an atom (if available in the bucket)
      // bucketHole.addInputListener( {
      //   down: function( event ) {
      //     // coordinate transforms to get our atom
      //     var viewPoint = moleculeCollectingView.globalToLocalPoint( event.pointer.point );
      //     var modelPoint = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelPosition( viewPoint );
      //     var atom = self.closestAtom( modelPoint, Number.POSITIVE_INFINITY, bucket.element ); // filter by the element
      //
      //     // if it's not in our bucket, ignore it (could skip weird cases where an atom outside of the bucket is technically closer)
      //     if ( !_.includes( bucket.getParticleList(), atom ) ) {
      //       return;
      //     }
      //
      //     // move the atom to right under the pointer for this assisted drag - otherwise the offset would be too noticeable
      //     atom.positionProperty.value = atom.destinationProperty.value = modelPoint;
      //
      //     var atomNode = self.atomNodeMap[ atom.id ];
      //     // TODO: use a new DragListener
      //     event.target = event.currentTarget = atomNode; // for now, modify the event directly so we can "point" it towards the atom node instead
      //
      //     // trigger the drag start
      //   }
      // } );

      topLayer.addChild( bucketFront );
      bottomLayer.addChild( bucketHole );

      // Listeners for bucket particle observable array.
      const particleRemovedListener = function( atom ) {

        // Remove atom view elements from bucket node and delete the reference from atom node map
        if ( self.atomNodeMap[ atom.id ] ) {
          atomLayer.removeChild( self.atomNodeMap[ atom.id ] );
          delete self.atomNodeMap[ atom.id ];
        }

        // Remove the atom from the bucket particles
        if ( bucket.containsParticle( atom ) ) {
          bucket.removeParticle( atom, true );
        }

        // Remove atom from bucket particle observable array.
        bucket.particleList.remove( atom );
      };
      const particleAddedListener = function( atom ) {

        // AtomNode created based on atoms in bucket
        var atomNode = new AtomNode( atom, {} );

        // Keep track of the atomNode by mapping to its atom's ID then add to atom layer
        self.atomNodeMap[ atom.id ] = atomNode;

        // Add the particle to the bucket atom layer and the bucket's particles.
        atomLayer.addChild( atomNode );
        bucket.placeAtom( atom );

        // Add a drag listener that will move the model element when the user
        // drags this atom.
        atomNode.addInputListener( DragListener.createForwardingListener( event => {

          // Adjust position of atom
          const viewPoint = moleculeCollectingView.globalToLocalPoint( event.pointer.point );
          atom.positionProperty.value = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelPosition( viewPoint );

          // Add new atom to the play area.
          const currentKit = moleculeCollectingView.kitCollectionList.currentCollectionProperty.value.currentKitProperty.value;
          currentKit.atomsInPlayArea.push( atom );

          // Handle removing particles from bucket
          if ( bucket.containsParticle( atom ) ) {

            // Remove the atom from the bucket's model and trigger its removal from the atomLayer in the view.
            particleRemovedListener( atom );
            atom.inBucketProperty.value = false;

            // Get reference to atomNode and call the dragListener
            const atomNode = moleculeCollectingView.kitPlayAreaNode.atomNodeMap[ atom.id ];
            atomNode.dragListener.press( event, atomNode );
          }
        } ) );
      };

      // Initial filling of the buckets
      bucket.getParticleList().forEach( particleAddedListener );

      // Add listeners to bucket particles observable array
      bucket.particleList.addItemAddedListener( particleAddedListener );
      bucket.particleList.addItemRemovedListener( particleRemovedListener );
    } );

    // handle molecule creation and destruction
    kit.addedMoleculeEmitter.addListener( function( molecule ) {
      // var moleculeControlsHBox = new MoleculeControlsHBox( kit, molecule );
      // metadataLayer.addChild( moleculeControlsHBox );
      // self.metadataMap[ molecule.moleculeId ] = moleculeControlsHBox;

      if ( BAMConstants.ALLOW_BOND_BREAKING ) {
        self.addMoleculeBondNodes( molecule );
      }
    } );
    kit.removedMoleculeEmitter.addListener( function( molecule ) {
      // var moleculeControlsHBox = self.metadataMap[ molecule.moleculeId ];
      // moleculeControlsHBox.dispose();
      delete self.metadataMap[ molecule.moleculeId ];

      if ( BAMConstants.ALLOW_BOND_BREAKING ) {
        self.removeMoleculeBondNodes( molecule );
      }
    } );

    assert && assert( kit.molecules.length === 0 );
  }

  buildAMolecule.register( 'KitView', KitView );

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
        var atom = atoms[ i ];
        var position = atom.positionProperty.get(); // no ES5 setters so we have the fastest possible code in this inner loop (called during hit testing)

        var dx = x - position.x;
        var dy = y - position.y;

        // not really distance, persay, since it can go negative
        var distanceSquared = dx * dx + dy * dy - atom.covalentRadius * atom.covalentRadius;

        if ( distanceSquared > bestDistanceSquared || ( element && atom.element !== element ) ) {
          continue;
        }

        bestDistanceSquared = distanceSquared;
        best = atom;
      }

      return best;
    },

    addMoleculeBondNodes: function( molecule ) {
      var moleculeBondContainerNode = new MoleculeBondContainerNode( this.kit, molecule );
      // this.metadataLayer.addChild( moleculeBondContainerNode );
      this.bondMap[ molecule.moleculeId ] = moleculeBondContainerNode;
    },

    removeMoleculeBondNodes: function( molecule ) {
      var moleculeBondContainerNode = this.bondMap[ molecule.moleculeId ];
      moleculeBondContainerNode.dispose();
      delete this.bondMap[ molecule.moleculeId ];
    }
  } );

  return KitView;
} );

