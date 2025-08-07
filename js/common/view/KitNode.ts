// Copyright 2020-2025, University of Colorado Boulder

/**
 * Shows a kit (series of buckets full of different types of atoms)
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import { PressListenerEvent } from '../../../../scenery/js/listeners/PressListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import Atom2 from '../model/Atom2.js';
import Kit from '../model/Kit.js';
import AtomNode from './AtomNode.js';
import BAMScreenView from './BAMScreenView.js';

class KitNode extends Node {

  // The kit model this node represents
  public readonly kit: Kit;

  // Bottom layer containing bucket holes
  private readonly bottomLayer: Node;

  // Layer containing atoms in buckets
  private readonly atomLayer: Node;

  /**
   * @param kit - The kit model to display
   * @param moleculeCollectingScreenView - The screen view this kit node belongs to
   */
  public constructor( kit: Kit, moleculeCollectingScreenView: BAMScreenView ) {
    super();

    this.kit = kit;

    // Maps for KitNode elements.
    const atomNodeMap: Record<string, AtomNode> = {}; // atom.id => AtomNode

    // Layers used for buckets
    const topLayer = new Node();
    const bottomLayer = new Node();

    this.bottomLayer = bottomLayer;
    this.atomLayer = new Node();

    // Add our layers
    this.addChild( bottomLayer );
    this.addChild( this.atomLayer );
    this.addChild( topLayer );

    // Create a bucket based on a kit's model bucket. This includes a front and back for the bucket contained in
    // different layout.
    kit.buckets.forEach( bucket => {
      const bucketFront = new BucketFront( bucket, BAMConstants.MODEL_VIEW_TRANSFORM );
      const bucketHole = new BucketHole( bucket, BAMConstants.MODEL_VIEW_TRANSFORM );
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
      const bucketHoleCursorUpdate = (): void => {
        bucketHole.cursor = bucket.getParticleList().length ? 'pointer' : 'default';
      };

      ( kit ).addedMoleculeEmitter.addListener( bucketHoleCursorUpdate );
      ( kit ).removedMoleculeEmitter.addListener( bucketHoleCursorUpdate );
      bucketHoleCursorUpdate();


      // Used for grabbing atoms in bucket. Will be triggered by grabbing the atoms themselves and the bucket the atoms
      // are contained in.
      const atomNodeDragCallback = ( event: PressListenerEvent, atom: Atom2 ): void => {

        // Adjust position of atom
        const viewPoint = moleculeCollectingScreenView.globalToLocalPoint( event.pointer.point );
        ( atom ).positionProperty.value = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelPosition( viewPoint );

        // Add new atom to the play area.
        const currentKit = ( moleculeCollectingScreenView.bamModel.currentCollectionProperty.value ).currentKitProperty.value!;
        currentKit.atomsInPlayArea.push( atom );

        // Handle removing particles from bucket
        if ( bucket.containsParticle( atom ) ) {

          // Remove the atom from the bucket's model and trigger its removal from the atomLayer in the view.
          bucket.particleList.remove( atom );

          // Get reference to atomNode and call the dragListener
          const atomNode = moleculeCollectingScreenView.kitPlayAreaNode.atomNodeMap[ ( atom ).id ];

          if ( atomNode ) {
            atomNode.dragListener!.press( event, atomNode );
          }
        }
      };

      // but don't pick the elliptical paths in the hole (that would be expensive to compute so often)
      bucketHole.children.forEach( () => {

        // our hook to start dragging an atom (if available in the bucket)
        bucketHole.addInputListener( {
          down: ( event: PressListenerEvent ): void => {
            this.interruptSubtreeInput();

            // coordinate transforms to get our atom
            const viewPoint = this.globalToLocalPoint( event.pointer.point );
            const modelPoint = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelPosition( viewPoint );
            let atom = this.closestAtom( modelPoint, Number.POSITIVE_INFINITY, bucket.element ); // filter by the element

            // if it's not in our bucket, ignore it (could skip weird cases where an atom outside of the bucket is
            // technically closer)
            if ( !atom || !bucket.particleList.includes( atom ) ) {
              if ( bucket.particleList.length ) {
                atom = bucket.particleList[ 0 ];
              }
              else {
                return;
              }
            }
            if ( atom ) {
              atomNodeDragCallback( event, atom );
            }
          }
        } );

      } );
      topLayer.addChild( bucketFront );
      bottomLayer.addChild( bucketHole );

      // Listener for removing a particle from the bucket's observable array.
      const particleRemovedListener = ( atom: Atom2 ): void => {

        // Remove atom view elements from bucket node and delete the reference from atom node map
        if ( atomNodeMap[ ( atom as IntentionalAny ).id ] ) {
          this.atomLayer.removeChild( atomNodeMap[ ( atom as IntentionalAny ).id ] );
          atomNodeMap[ ( atom as IntentionalAny ).id ].dispose();
          delete atomNodeMap[ ( atom as IntentionalAny ).id ];
        }

        // Remove the atom from the bucket particles
        if ( bucket.containsParticle( atom ) ) {
          bucket.removeParticle( atom, false );
        }
      };

      // Listener for adding a particle from the bucket's observable array.
      const particleAddedListener = ( atom: Atom2 ): void => {

        // AtomNode created based on atoms in bucket
        const atomNode = new AtomNode( atom );

        // Keep track of the atomNode by mapping to its atom's ID then add to atom layer
        atomNodeMap[ atom.id ] = atomNode;

        // Add the particle to the bucket atom layer and the bucket's particles.
        this.atomLayer.addChild( atomNode );
        bucket.placeAtom( atom, false );

        // Add a drag listener that will move the model element when the user
        // drags this atom.
        atomNode.addInputListener( DragListener.createForwardingListener( ( event: IntentionalAny ): void => {
          atomNodeDragCallback( event, atom );
        }, {
          allowTouchSnag: false
        } ) );
      };

      // Initial filling of the buckets and setting the bucket's filled state.
      bucket.getParticleList().forEach( particleAddedListener );
      bucket.fullState = bucket.getParticleList();
      bucket.setToFullState();

      // Add listeners to bucket particles observable array
      bucket.particleList.addItemAddedListener( particleAddedListener );
      bucket.particleList.addItemRemovedListener( particleRemovedListener );
    } );
    assert && assert( ( kit ).molecules.length === 0 );
  }

  /**
   * Distance needs to be within threshold, and if an element is provided, the element must match
   * @param modelPoint - Point in model coordinates
   * @param threshold - Maximum distance threshold
   * @param element - Element to filter by (if provided)
   * @returns The closest atom within threshold, or null if none found
   */
  private closestAtom( modelPoint: Vector2, threshold: number, element: IntentionalAny ): Atom2 | null {
    assert && assert( threshold );

    const thresholdSquared = threshold * threshold;

    const atoms = ( this.kit ).atoms;
    const numAtoms = atoms.length;

    let best: Atom2 | null = null;
    let bestDistanceSquared = thresholdSquared; // limit ourselves at the threshold, and add this to the best distance so we only need one check in the loop

    const x = modelPoint.x;
    const y = modelPoint.y;

    // ignore stacking order for this operation
    for ( let i = 0; i < numAtoms; i++ ) {
      const atom = atoms[ i ];
      const position = ( atom ).positionProperty.get();

      const dx = x - position.x;
      const dy = y - position.y;

      // not really distance, persay, since it can go negative
      const distanceSquared = dx * dx + dy * dy - ( atom ).covalentRadius * ( atom ).covalentRadius;

      if ( distanceSquared > bestDistanceSquared || ( element && ( atom ).element !== element ) ) {
        continue;
      }

      bestDistanceSquared = distanceSquared;
      best = atom;
    }

    return best;
  }
}

buildAMolecule.register( 'KitNode', KitNode );
export default KitNode;