// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main screenview for Build a Molecule. It features kits shown at the bottom and a centeralized play area for
 * building molecules.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { DragListener } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import AtomNode from './AtomNode.js';
import KitCollectionNode from './KitCollectionNode.js';
import KitPlayAreaNode from './KitPlayAreaNode.js';
import MoleculeControlsHBox from './MoleculeControlsHBox.js';
import RefillButton from './RefillButton.js';
import Molecule3DDialog from './view3d/Molecule3DDialog.js';
import WarningDialog from './WarningDialog.js';

class BAMScreenView extends ScreenView {
  /**
   * @param {BAMModel} bamModel
   */
  constructor( bamModel ) {
    super();
    // @public {Object.<atomId:number, AtomNode>}
    this.atomNodeMap = {}; // maps Atom2 ID => AtomNode

    // @public {Object.<kitCollectionId:number, KitCollectionNode}
    this.kitCollectionMap = {};

    // @private {Object.<kitID:number,function>}
    this.addedEmitterListeners = {};

    // @private {Object.<kitID:number,function>}
    this.removedEmitterListeners = {};

    // @public {BAMModel} Initialize and add the kit collection
    this.bamModel = bamModel;
    this.addCollection( bamModel.currentCollectionProperty.value, false );

    // @public {Bounds2} Bounds used to limit where molecules can reside in the play area.
    this.atomDragBounds = new Bounds2( -1575, -850, 1575, 950 );
    this.mappedKitCollectionBounds = this.kitCollectionMap[ this.bamModel.currentCollectionProperty.value.id ].bounds.dilatedX( 60 );

    // @public {Molecule3DDialog| WarningDialog } Used for representing 3D molecules.
    // Only create a dialog if webgl is enabled. See https://github.com/phetsims/build-a-molecule/issues/105
    this.dialog = ThreeUtils.isWebGLEnabled() ? new Molecule3DDialog( bamModel.dialogMolecule ) : new WarningDialog();

    // @public {function} Reference to callback that displays dialog for 3d node representation
    this.showDialogCallback = this.showDialog.bind( this );

    // KitPlayAreaNode for the main BAMScreenView listens to the kitPlayArea of each kit in the model to fill or remove
    // its content.
    const kits = [];

    // @public {KitPlayAreaNode} Create a play area to house the molecules.
    this.kitPlayAreaNode = new KitPlayAreaNode( kits );
    bamModel.currentCollectionProperty.link( ( newCollection, oldCollection ) => {
      if ( oldCollection ) {

        // Check if a KitCollectionNode exists and remove it.
        this.children.forEach( child => {
          if ( child instanceof KitCollectionNode ) {
            this.removeChild( child );
          }
        } );
      }

      // Add a new collection
      if ( newCollection ) {
        this.addChild( this.kitCollectionMap[ newCollection.id ] );
      }

      // Set the current kit of the KitPlayAreaNode
      this.kitPlayAreaNode.currentKit = newCollection.currentKitProperty.value;
    } );
    bamModel.addedCollectionEmitter.addListener( this.addCollection.bind( this ) );

    this.addChild( this.kitPlayAreaNode );

    // Create a button to refill the kit
    const refillListener = () => {
      this.interruptSubtreeInput();
      this.kitPlayAreaNode.resetPlayAreaKit();
      this.kitPlayAreaNode.currentKit.buckets.forEach( bucket => {
        bucket.setToFullState();
      } );
      bamModel.currentCollectionProperty.value.collectionBoxes.forEach( box => {
        box.cueVisibilityProperty.value = false;
      } );
      this.updateRefillButton();
    };

    // Create a kit panel to house the kit carousel
    const kitPanel = this.kitCollectionMap[ bamModel.currentCollectionProperty.value.id ].kitPanel;

    // @private {RefillButton} Create a button to refill the kit buckets with atoms
    this.refillButton = new RefillButton(
      refillListener, {
        left: kitPanel.left,
        bottom: kitPanel.top - 7,
        scale: 0.85
      } );
    this.refillButton.touchArea = this.refillButton.selfBounds.union( this.refillButton.childBounds ).dilated( 10 );

    // @public {function} Refill button is enabled if atoms exists outside of the bucket
    this.updateRefillButton = () => {
      this.refillButton.enabled = !this.bamModel.currentCollectionProperty.value.currentKitProperty.value.allBucketsFilled();
    };

    // @public {ResetAllButton} Create a reset all button. Position of button is adjusted on "Larger" Screen.
    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();

        // When clicked, empty collection boxes
        bamModel.currentCollectionProperty.value.collectionBoxes.forEach( box => {
          box.reset();
        } );
        bamModel.currentCollectionProperty.value.kits.forEach( kit => {
          kit.reset();
        } );
        bamModel.reset();
        kitPanel.reset();
        if ( this.dialog instanceof Molecule3DDialog ) {
          this.dialog.isPlayingProperty.reset();
          this.dialog.viewStyleProperty.reset();
        }
        this.updateRefillButton();

        // If the nextCollectionButton is present on screen hide it.
        if ( _.includes( this.children, this.nextCollectionButton ) ) {
          this.nextCollectionButton.visible = false;
        }
      },
      right: this.layoutBounds.right - BAMConstants.VIEW_PADDING / 2,
      bottom: kitPanel.bottom + BAMConstants.VIEW_PADDING / 4
    } );

    this.resetAllButton.touchArea = this.resetAllButton.bounds.dilated( 7 );
    this.addChild( this.resetAllButton );
    this.resetAllButton.moveToBack();
    this.addChild( this.refillButton );

    /**
     * Handles adding molecules and molecule metadata to kit play area.
     * @param {Molecule} molecule
     * @param {Kit} kit
     */
    const addedMoleculeListener = ( molecule, kit ) => {
      if ( molecule.atoms.length > 1 ) {

        // Only create this if there are multiple atoms
        const moleculeControlsHBox = new MoleculeControlsHBox( kit, molecule, this.showDialogCallback );
        this.kitPlayAreaNode.metadataLayer.addChild( moleculeControlsHBox );
        this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ] = moleculeControlsHBox;
        this.kitPlayAreaNode.addMoleculeBondNodes( molecule );
      }
    };

    /**
     * Handles removing molecules and molecule metadata to kit play area.
     * @param {Molecule} molecule
     */
    const removedMoleculeListener = molecule => {
      const moleculeControlsHBox = this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ];
      if ( moleculeControlsHBox ) {
        this.kitPlayAreaNode.metadataLayer.removeChild( moleculeControlsHBox );
        moleculeControlsHBox.dispose();
        delete this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ];
        this.kitPlayAreaNode.removeMoleculeBondNodes( molecule );
      }
    };

    /**
     * Handles adding atoms to play area and updates the refill button accordingly
     * @param {Atom2} atom
     */
    const addAtomNodeToPlayArea = atom => {
      this.addAtomNodeToPlayArea( atom );
      this.updateRefillButton();
    };

    /**
     * Handles adding atoms to play area and updates the refill button accordingly
     * @param {Atom2} atom
     */
    const removeAtomNodeFromPlayArea = atom => {
      this.onAtomRemovedFromPlayArea( atom );
      this.updateRefillButton();
    };

    // When a collection is changed, update the listeners for the kits and KitPlayAreaNode.
    bamModel.currentCollectionProperty.link( ( collection, previousCollection ) => {
      this.kitPlayAreaNode.atomLayer.children.forEach( otherAtomNode => {
        if ( otherAtomNode ) {
          otherAtomNode.interruptSubtreeInput();
          otherAtomNode.atom.userControlledProperty.value = false;
        }
      } );
      if ( previousCollection ) {
        previousCollection.kits.forEach( kit => {

          // Reset the kit before managing its listeners
          kit.reset();

          // Removed previous listeners related to metadataLayer creation and deletion.
          kit.addedMoleculeEmitter.removeListener( this.addedEmitterListeners[ kit.id ] );
          kit.removedMoleculeEmitter.removeListener( this.removedEmitterListeners[ kit.id ] );
          delete this.addedEmitterListeners[ kit.id ];
          delete this.removedEmitterListeners[ kit.id ];

          // Remove listeners for adding/removing atoms to play area
          kit.atomsInPlayArea.removeItemAddedListener( addAtomNodeToPlayArea );
          kit.atomsInPlayArea.removeItemRemovedListener( removeAtomNodeFromPlayArea );
        } );
      }

      // KitPlayAreaNode kits should be updated to the kits in the new collection.
      this.kitPlayAreaNode.kitsProperty.value = collection.kits;
      collection.kits.forEach( kit => {

        // Handle metadataLayer creation and destruction.
        const addedEmitterListener = molecule => {
          addedMoleculeListener( molecule, kit );
        };
        kit.addedMoleculeEmitter.addListener( addedEmitterListener );
        this.addedEmitterListeners[ kit.id ] = addedEmitterListener;

        // Handle deleting metadataLayer
        const removedEmitterListener = molecule => {
          removedMoleculeListener( molecule, kit );
        };
        kit.removedMoleculeEmitter.addListener( removedEmitterListener );
        this.removedEmitterListeners[ kit.id ] = removedEmitterListener;

        // Reset our kitPlayAreaNode for the new collection
        this.kitPlayAreaNode.resetPlayAreaKit();
        this.kitPlayAreaNode.currentKit = collection.currentKitProperty.value;
        this.kitPlayAreaNode.moveToFront();

        // Used for tracking kits in KitPlayAreaNode
        kits.push( kit );

        // Each kit gets listeners for managing its play area.
        kit.atomsInPlayArea.addItemAddedListener( addAtomNodeToPlayArea );
        kit.atomsInPlayArea.addItemRemovedListener( removeAtomNodeFromPlayArea );

        // KitPlayAreaNode should update their kits
        collection.currentKitProperty.link( kit => {
          this.kitPlayAreaNode.currentKit = kit;
          this.updateRefillButton();
        } );
        this.updateRefillButton();
      } );
    } );

    // @private {function} listener for 'click outside to dismiss'
    this.clickToDismissListener = {
      down: () => {
        bamModel.currentCollectionProperty.value.currentKitProperty.value.selectedAtomProperty.value = null;
      }
    };
    phet.joist.display.addInputListener( this.clickToDismissListener );

    kitPanel.kitCarousel.pageNumberProperty.link( () => {
      this.interruptSubtreeInput();
    } );
  }

  /**
   * @param {number} dt
   *
   * @public
   */
  step( dt ) {
    if ( this.dialog && ThreeUtils.isWebGLEnabled() ) {
      this.dialog.step( dt );
    }

    // Update the visibility of the cues in each collection box
    let hasTargetMolecule = false;
    this.bamModel.currentCollectionProperty.value.collectionBoxes.forEach( box => {
      this.kitPlayAreaNode.currentKit.molecules.forEach( molecule => {
        hasTargetMolecule = molecule ? box.willAllowMoleculeDrop( molecule ) : hasTargetMolecule || false;
      } );
    } );
  }

  /**
   * Responsible for showing 3d representation of molecule.
   * @param {CompleteMolecule} completeMolecule
   *
   * @private
   */
  showDialog( completeMolecule ) {

    // Bail if we don't have a dialog, due to a lack of webgl support. See https://github.com/phetsims/build-a-molecule/issues/105
    if ( this.dialog ) {
      if ( ThreeUtils.isWebGLEnabled() ) {
        this.dialog.completeMoleculeProperty.value = completeMolecule;
      }
      this.dialog.show();
    }
  }

  /**
   * Add a collection to the kitCollectionNode
   * @param {KitCollection} collection
   * @param {boolean} isCollectingView
   *
   * @private
   * @returns {KitCollectionNode}
   */
  addCollection( collection, isCollectingView ) {
    const kitCollectionNode = new KitCollectionNode( collection, this, isCollectingView );
    this.kitCollectionMap[ collection.id ] = kitCollectionNode;

    // supposedly: return this so we can manipulate it in an override....?
    return kitCollectionNode;
  }

  /**
   * Fill the play area with an atom and map the atom to an atomNode
   * @param {Atom2} atom
   *
   * @private
   * @returns {AtomNode}
   */
  addAtomNodeToPlayAreaNode( atom ) {
    const atomNode = new AtomNode( atom );
    this.kitPlayAreaNode.atomLayer.addChild( atomNode );
    this.kitPlayAreaNode.atomNodeMap[ atom.id ] = atomNode;
    return atomNode;
  }

  /**
   * Add an atom to the play area in the model. Handled via a drag listener.
   * @param {Atom2} atom
   *
   * @private
   * @returns {AtomNode}
   */
  addAtomNodeToPlayArea( atom ) {
    const currentKit = this.bamModel.currentCollectionProperty.value.currentKitProperty.value;
    const atomNode = this.addAtomNodeToPlayAreaNode( atom );
    let lastPosition;

    // Track the length of a drag in model units
    let dragLength = 0;
    const atomListener = new DragListener( {
      transform: BAMConstants.MODEL_VIEW_TRANSFORM,
      targetNode: atomNode,
      allowTouchSnag: false,
      dragBoundsProperty: new Property( this.atomDragBounds ),
      positionProperty: atom.positionProperty,
      start: () => {

        // Interrupt drag events on other atom nodes
        this.kitPlayAreaNode.atomLayer.children.forEach( otherAtomNode => {
          if ( otherAtomNode && atomNode !== otherAtomNode ) {
            otherAtomNode.interruptSubtreeInput();
            otherAtomNode.atom.userControlledProperty.value = false;
          }
        } );
        dragLength = 0;
        atom.destinationProperty.value = atom.positionProperty.value;

        // Get atom position before drag
        lastPosition = atom.positionProperty.value;

        // If a molecule is animating interrupt the animation process.
        atom.userControlledProperty.value = true;
        const molecule = currentKit.getMolecule( atom );
        if ( molecule ) {
          molecule.atoms.forEach( moleculeAtom => {
            if ( moleculeAtom ) {
              this.kitPlayAreaNode.atomNodeMap[ moleculeAtom.id ].moveToFront();
              moleculeAtom.destinationProperty.value = moleculeAtom.positionProperty.value;
            }
          } );
        }

        // Update the current kit in the play area node.
        this.kitPlayAreaNode.currentKit = currentKit;
      },
      drag: ( event, listener ) => {
        dragLength += listener.modelDelta.getMagnitude();

        // Get delta from start of drag
        const delta = atom.positionProperty.value.minus( lastPosition );
        atom.destinationProperty.value = atom.positionProperty.value;

        // Set the last position to the newly dragged position.
        lastPosition = atom.positionProperty.value;

        // Handles molecules with multiple atoms
        const molecule = currentKit.getMolecule( atom );
        if ( molecule ) {
          molecule.atoms.forEach( moleculeAtom => {
            if ( moleculeAtom !== atom ) {
              moleculeAtom.translatePositionAndDestination( delta );
            }
          } );
          atomNode.moveToFront();
        }
        else {
          atomNode.moveToFront();
        }
      },
      end: () => {

        // Threshold for how much we can drag before considering an atom selected
        if ( dragLength < BAMConstants.DRAG_LENGTH_THRESHOLD && ( currentKit.getMolecule( atom ).bonds.length !== 0 ) ) {
          currentKit.selectedAtomProperty.value = atom;
        }

        // Consider an atom released and mark its position
        atom.userControlledProperty.value = false;

        // Keep track of view elements used later in the callback
        const mappedAtomNode = this.kitPlayAreaNode.atomNodeMap[ atom.id ];

        // Responsible for dropping molecules in play area or kit area
        const droppedInKitArea = mappedAtomNode && mappedAtomNode.bounds.intersectsBounds( this.mappedKitCollectionBounds );

        // Responsible for bonding molecules in play area or breaking molecule bonds and returning to kit.
        // We don't want to do this while the molecule is animating.
        currentKit.atomDropped( atom, droppedInKitArea );


        // Make sure to update the update button after moving atoms
        this.updateRefillButton();
      }
    } );
    atomNode.dragListener = atomListener;
    atomNode.addInputListener( atomListener );
  }

  /**
   * Removes atom elements from view.
   *
   * @param {Atom2} atom
   * @private
   */
  onAtomRemovedFromPlayArea( atom ) {
    // Remove mapped atom node from the view and dispose it.
    const atomNode = this.kitPlayAreaNode.atomNodeMap[ atom.id ];
    atomNode.dragListener.dispose();
    atomNode.dispose();
    delete this.kitPlayAreaNode.atomNodeMap[ atom.id ];
  }
}

buildAMolecule.register( 'BAMScreenView', BAMScreenView );
export default BAMScreenView;