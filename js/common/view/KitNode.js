// Copyright 2020, University of Colorado Boulder

/**
 * Shows a kit (series of buckets full of different types of atoms)
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Shape from '../../../../kite/js/Shape.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import AtomNode from './AtomNode.js';

class KitNode extends Node {
  /**
   * @param {Kit} kit
   * @param {MoleculeCollectingScreenView} moleculeCollectingScreenView
   */
  constructor( kit, moleculeCollectingScreenView ) {
    super();

    // @public {Kit}
    this.kit = kit;

    // Maps for KitNode elements.
    const atomNodeMap = {}; // atom.id => AtomNode

    // Layers used for buckets
    const topLayer = new Node();
    const bottomLayer = new Node();

    // @private {Node}
    this.bottomLayer = bottomLayer;

    // @private {Node} Contains all the atoms within the buckets
    this.atomLayer = new Node();

    // Add our layers
    this.addChild( bottomLayer );
    this.addChild( this.atomLayer );
    this.addChild( topLayer );

    // Create a bucket based on a the kit's model bucket. This includes a front and back for the bucket contained in
    // different layout.
    kit.buckets.forEach( bucket => {
      const bucketFront = new BucketFront( bucket, BAMConstants.MODEL_VIEW_TRANSFORM, {
        labelFont: new PhetFont( {
          weight: 'bold',
          size: 18
        } )
      } );
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
      const bucketHoleCursorUpdate = () => {
        bucketHole.cursor = bucket.getParticleList().length ? 'pointer' : 'default';
      };

      kit.addedMoleculeEmitter.addListener( bucketHoleCursorUpdate );
      kit.removedMoleculeEmitter.addListener( bucketHoleCursorUpdate );
      bucketHoleCursorUpdate();

      // but don't pick the elliptical paths in the hole (that would be expensive to compute so often)
      bucketHole.children.forEach( child => { child.pickable = false; } );
      topLayer.addChild( bucketFront );
      bottomLayer.addChild( bucketHole );

      // Listener for removing a particle from the bucket's observable array.
      const particleRemovedListener = atom => {

        // Remove atom view elements from bucket node and delete the reference from atom node map
        if ( atomNodeMap[ atom.id ] ) {
          this.atomLayer.removeChild( atomNodeMap[ atom.id ] );
          atomNodeMap[ atom.id ].dispose();
          delete atomNodeMap[ atom.id ];
        }

        // Remove the atom from the bucket particles
        if ( bucket.containsParticle( atom ) ) {
          bucket.removeParticle( atom, false );
        }

        // Remove atom from bucket particle observable array.
        bucket.particleList.remove( atom );
      };

      // Listener for adding a particle from the bucket's observable array.
      const particleAddedListener = atom => {

        // AtomNode created based on atoms in bucket
        const atomNode = new AtomNode( atom );

        // Keep track of the atomNode by mapping to its atom's ID then add to atom layer
        atomNodeMap[ atom.id ] = atomNode;

        // Add the particle to the bucket atom layer and the bucket's particles.
        this.atomLayer.addChild( atomNode );
        bucket.placeAtom( atom, false );

        // Add a drag listener that will move the model element when the user
        // drags this atom.
        atomNode.addInputListener( DragListener.createForwardingListener( event => {

          // Adjust position of atom
          const viewPoint = moleculeCollectingScreenView.globalToLocalPoint( event.pointer.point );
          atom.positionProperty.value = BAMConstants.MODEL_VIEW_TRANSFORM.viewToModelPosition( viewPoint );

          // Add new atom to the play area.
          const currentKit = moleculeCollectingScreenView.bamModel.currentCollectionProperty.value.currentKitProperty.value;
          currentKit.atomsInPlayArea.push( atom );

          // Handle removing particles from bucket
          if ( bucket.containsParticle( atom ) ) {

            // Remove the atom from the bucket's model and trigger its removal from the atomLayer in the view.
            particleRemovedListener( atom );

            // Get reference to atomNode and call the dragListener
            const atomNode = moleculeCollectingScreenView.kitPlayAreaNode.atomNodeMap[ atom.id ];

            if ( atomNode ) {
              atomNode.dragListener.press( event, atomNode );
            }
          }
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
    assert && assert( kit.molecules.length === 0 );
  }

  /**
   * Distance needs to be within threshold, and if an element is provided, the element must match
   * @param {Vector2} modelPoint
   * @param {number} threshold
   * @param {Element} element
   *
   * @private
   * @returns {Atom2|*}
   */
  closestAtom( modelPoint, threshold, element ) {
    assert && assert( threshold );

    const thresholdSquared = threshold * threshold;

    const atoms = this.kit.atoms;
    const numAtoms = atoms.length;

    let best = null;
    let bestDistanceSquared = thresholdSquared; // limit ourselves at the threshold, and add this to the best distance so we only need one check in the loop

    const x = modelPoint.x;
    const y = modelPoint.y;

    // ignore stacking order for this operation
    for ( let i = 0; i < numAtoms; i++ ) {
      const atom = atoms[ i ];
      const position = atom.positionProperty.get(); // no ES5 setters so we have the fastest possible code in this inner loop (called during hit testing)

      const dx = x - position.x;
      const dy = y - position.y;

      // not really distance, persay, since it can go negative
      const distanceSquared = dx * dx + dy * dy - atom.covalentRadius * atom.covalentRadius;

      if ( distanceSquared > bestDistanceSquared || ( element && atom.element !== element ) ) {
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