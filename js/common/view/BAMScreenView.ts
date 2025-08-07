// Copyright 2020-2025, University of Colorado Boulder

/**
 * Main screenview for Build a Molecule. It features kits shown at the bottom and a centeralized play area for
 * building molecules.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import Atom2 from '../model/Atom2.js';
import BAMModel from '../model/BAMModel.js';
import CompleteMolecule from '../model/CompleteMolecule.js';
import Kit from '../model/Kit.js';
import KitCollection from '../model/KitCollection.js';
import Molecule from '../model/Molecule.js';
import AtomNode from './AtomNode.js';
import KitCollectionNode from './KitCollectionNode.js';
import KitPlayAreaNode from './KitPlayAreaNode.js';
import MoleculeControlsHBox from './MoleculeControlsHBox.js';
import RefillButton from './RefillButton.js';
import Molecule3DDialog from './view3d/Molecule3DDialog.js';
import WarningDialog from './WarningDialog.js';

export default class BAMScreenView extends ScreenView {

  // Public properties
  public readonly atomNodeMap: Record<number, AtomNode> = {}; // maps Atom2 ID => AtomNode
  public readonly kitCollectionMap: Record<number, KitCollectionNode> = {};
  public readonly bamModel: BAMModel;
  public readonly atomDragBounds: Bounds2;
  public mappedKitCollectionBounds: Bounds2;
  public readonly dialog: Molecule3DDialog | WarningDialog;
  public readonly showDialogCallback: ( completeMolecule: CompleteMolecule ) => void;
  public readonly kitPlayAreaNode: KitPlayAreaNode;
  public readonly updateRefillButton: () => void;
  public readonly resetAllButton: ResetAllButton;
  public nextCollectionButton!: Node; // Assigned by subclasses

  // Private properties
  private readonly addedEmitterListeners: Record<number, ( molecule: Molecule ) => void> = {};
  private readonly removedEmitterListeners: Record<number, ( molecule: Molecule ) => void> = {};
  private readonly refillButton: RefillButton;
  private readonly clickToDismissListener: { down: () => void };

  /**
   * @param bamModel - The model for this screen view
   */
  public constructor( bamModel: BAMModel ) {
    super();

    // Initialize and add the kit collection
    this.bamModel = bamModel;
    this.addCollection( bamModel.currentCollectionProperty.value, false );

    // Bounds used to limit where molecules can reside in the play area.
    this.atomDragBounds = new Bounds2( -1575, -850, 1575, 950 );
    this.mappedKitCollectionBounds = this.kitCollectionMap[ this.bamModel.currentCollectionProperty.value.id ].bounds.dilatedX( 60 );

    // Used for representing 3D molecules.
    // Only create a dialog if webgl is enabled. See https://github.com/phetsims/build-a-molecule/issues/105
    this.dialog = ThreeUtils.isWebGLEnabled() ? new Molecule3DDialog( bamModel.dialogMolecule ) : new WarningDialog();

    // Reference to callback that displays dialog for 3d node representation
    this.showDialogCallback = this.showDialog.bind( this );

    // KitPlayAreaNode for the main BAMScreenView listens to the kitPlayArea of each kit in the model to fill or remove
    // its content.
    const kits: Kit[] = [];

    // Create a play area to house the molecules.
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
    bamModel.addedCollectionEmitter.addListener( ( collection: KitCollection ) => this.addCollection( collection, false ) );

    this.addChild( this.kitPlayAreaNode );

    // Create a button to refill the kit
    const refillListener = () => {
      this.interruptSubtreeInput();
      this.kitPlayAreaNode.resetPlayAreaKit();
      this.kitPlayAreaNode.currentKit!.buckets.forEach( bucket => {
        bucket.setToFullState();
      } );
      bamModel.currentCollectionProperty.value.collectionBoxes.forEach( box => {
        box.cueVisibilityProperty.value = false;
      } );
      this.updateRefillButton();
    };

    // Create a kit panel to house the kit carousel
    const kitPanel = this.kitCollectionMap[ bamModel.currentCollectionProperty.value.id ].kitPanel;

    // Create a button to refill the kit buckets with atoms
    this.refillButton = new RefillButton(
      refillListener, {
        left: kitPanel.left,
        bottom: kitPanel.top - 7,
        scale: 0.85
      } );
    this.refillButton.touchArea = this.refillButton.selfBounds.union( this.refillButton.childBounds ).dilated( 10 );

    // Refill button is enabled if atoms exists outside of the bucket
    this.updateRefillButton = () => {
      this.refillButton.enabled = !this.bamModel.currentCollectionProperty.value.currentKitProperty.value!.allBucketsFilled();
    };

    // Create a reset all button. Position of button is adjusted on "Larger" Screen.
    this.resetAllButton = new ResetAllButton( {
      listener: () => {

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
        if ( this.children.includes( this.nextCollectionButton ) ) {
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
     */
    const addedMoleculeListener = ( molecule: Molecule, kit: Kit ) => {
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
     */
    const removedMoleculeListener = ( molecule: Molecule ) => {
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
     */
    const addAtomNodeToPlayArea = ( atom: Atom2 ) => {
      this.addAtomNodeToPlayArea( atom );
      this.updateRefillButton();
    };

    /**
     * Handles removing atoms from play area and updates the refill button accordingly
     */
    const removeAtomNodeFromPlayArea = ( atom: Atom2 ) => {
      this.onAtomRemovedFromPlayArea( atom );
      this.updateRefillButton();
    };

    // When a collection is changed, update the listeners for the kits and KitPlayAreaNode.
    bamModel.currentCollectionProperty.link( ( collection, previousCollection ) => {
      this.kitPlayAreaNode.atomLayer.children.forEach( otherAtomNode => {
        if ( otherAtomNode ) {
          otherAtomNode.interruptSubtreeInput();
          ( otherAtomNode as any ).atom.isDraggingProperty.value = false; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when AtomNode typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
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
        const addedEmitterListener = ( molecule: Molecule ) => {
          addedMoleculeListener( molecule, kit );
        };
        kit.addedMoleculeEmitter.addListener( addedEmitterListener );
        this.addedEmitterListeners[ kit.id ] = addedEmitterListener;

        // Handle deleting metadataLayer
        const removedEmitterListener = ( molecule: Molecule ) => {
          removedMoleculeListener( molecule );
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
        collection.currentKitProperty.link( ( kit: Kit | null ) => {
          if ( !kit ) {
            return;
          }
          this.kitPlayAreaNode.currentKit = kit;
          this.updateRefillButton();
        } );
        this.updateRefillButton();
      } );
    } );

    // listener for 'click outside to dismiss'
    this.clickToDismissListener = {
      down: () => {
        bamModel.currentCollectionProperty.value.currentKitProperty.value!.selectedAtomProperty.value = null;
      }
    };
    ( phet as any ).joist.display.addInputListener( this.clickToDismissListener ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when phet global types are available, see https://github.com/phetsims/build-a-molecule/issues/245

    kitPanel.kitCarousel.pageNumberProperty.link( () => {
      this.interruptSubtreeInput();
    } );
  }

  /**
   * Steps the view forward in time
   * @param dt - The time step
   */
  public override step( dt: number ): void {
    if ( this.dialog && ThreeUtils.isWebGLEnabled() ) {
      ( this.dialog as any ).step( dt ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Molecule3DDialog typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
    }

    // Update the visibility of the cues in each collection box
    let hasTargetMolecule = false;
    this.bamModel.currentCollectionProperty.value.collectionBoxes.forEach( box => {
      this.kitPlayAreaNode.currentKit!.molecules.forEach( molecule => {
        hasTargetMolecule = molecule ? box.willAllowMoleculeDrop( molecule ) : hasTargetMolecule || false;
      } );
    } );
  }

  /**
   * Responsible for showing 3d representation of molecule.
   * @param completeMolecule - The molecule to show in 3D
   */
  public showDialog( completeMolecule: CompleteMolecule ): void {

    // Bail if we don't have a dialog, due to a lack of webgl support. See https://github.com/phetsims/build-a-molecule/issues/105
    if ( this.dialog ) {
      if ( ThreeUtils.isWebGLEnabled() ) {
        ( this.dialog as any ).completeMoleculeProperty.value = completeMolecule; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Molecule3DDialog typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
      }
      this.dialog.show();
    }
  }

  /**
   * Add a collection to the kitCollectionNode
   * @param collection - The collection to add
   * @param isCollectingView - Whether this is a collecting view
   * @returns The created KitCollectionNode
   */
  protected addCollection( collection: KitCollection, isCollectingView: boolean ): KitCollectionNode {
    const kitCollectionNode = new KitCollectionNode( collection, this as any, isCollectingView ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when KitCollectionNode typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
    this.kitCollectionMap[ collection.id ] = kitCollectionNode;

    // supposedly: return this so we can manipulate it in an override....?
    return kitCollectionNode;
  }

  /**
   * Fill the play area with an atom and map the atom to an atomNode
   * @param atom - The atom to add
   * @returns The created AtomNode
   */
  private addAtomNodeToPlayAreaNode( atom: Atom2 ): AtomNode {
    const atomNode = new AtomNode( atom );
    this.kitPlayAreaNode.atomLayer.addChild( atomNode );
    ( this.kitPlayAreaNode.atomNodeMap as any )[ atom.id ] = atomNode; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when atomNodeMap typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
    return atomNode;
  }

  /**
   * Add an atom to the play area in the model. Handled via a drag listener.
   * @param atom - The atom to add
   * @returns The created AtomNode
   */
  private addAtomNodeToPlayArea( atom: Atom2 ): AtomNode {
    const originKit = this.bamModel.currentCollectionProperty.value.currentKitProperty.value!;
    const atomNode = this.addAtomNodeToPlayAreaNode( atom );
    let lastPosition: Vector2 | undefined;

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
            ( otherAtomNode as any ).atom.isDraggingProperty.value = false; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when AtomNode typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
          }
        } );
        dragLength = 0;
        atom.destinationProperty.value = atom.positionProperty.value;

        // Get atom position before drag
        lastPosition = atom.positionProperty.value;

        // If a molecule is animating interrupt the animation process.
        atom.isDraggingProperty.value = true;
        const molecule = originKit.getMolecule( atom );
        if ( molecule ) {
          molecule.atoms.forEach( moleculeAtom => {
            if ( moleculeAtom ) {
              ( this.kitPlayAreaNode.atomNodeMap as any )[ moleculeAtom.id ].moveToFront(); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when atomNodeMap typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
              ( moleculeAtom as any ).destinationProperty.value = ( moleculeAtom as any ).positionProperty.value; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Atom typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
            }
          } );
        }

        // Update the current kit in the play area node.
        this.kitPlayAreaNode.currentKit = originKit;
      },
      drag: ( event: any, listener: any ) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when DragListener types are available, see https://github.com/phetsims/build-a-molecule/issues/245
        dragLength += listener.modelDelta.getMagnitude();

        // Get delta from start of drag
        const delta = atom.positionProperty.value.minus( lastPosition! );
        atom.destinationProperty.value = atom.positionProperty.value;

        // Set the last position to the newly dragged position.
        lastPosition = atom.positionProperty.value;

        // Handles molecules with multiple atoms
        const molecule = originKit.getMolecule( atom );
        if ( molecule ) {
          molecule.atoms.forEach( moleculeAtom => {
            if ( moleculeAtom !== atom ) {
              ( moleculeAtom as any ).translatePositionAndDestination( delta ); // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when Atom typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
            }
          } );
          atomNode.moveToFront();
        }
        else {
          atomNode.moveToFront();
        }
      },
      end: () => {

        // Test whether the drag was long enough for this to become the selected atom.
        if ( dragLength < BAMConstants.DRAG_LENGTH_THRESHOLD && ( originKit.getMolecule( atom )!.bonds.length !== 0 ) ) {
          originKit.selectedAtomProperty.value = atom;
        }

        // Consider the atom released (which does not prevent it from being selected).
        atom.isDraggingProperty.value = false;

        // Keep track of view elements used later in the callback.
        const mappedAtomNode = ( this.kitPlayAreaNode.atomNodeMap as any )[ atom.id ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when atomNodeMap typing is available, see https://github.com/phetsims/build-a-molecule/issues/245

        // Was the atom dropped back into the kit area?
        const droppedInKitArea = mappedAtomNode &&
                                 mappedAtomNode.bounds.intersectsBounds( this.mappedKitCollectionBounds );

        // Did the kit change while the atom was being dragged? This is possible in multitouch scenarios.
        const kitChangedWhileDragging = originKit !==
                                        this.bamModel.currentCollectionProperty.value.currentKitProperty.value;

        // Tell the kit from which this atom originated that the atom was dropped.  This is responsible for bonding
        // molecules in the play area or breaking molecule bonds and returning the atom to the kit.
        originKit.atomDropped( atom, droppedInKitArea || kitChangedWhileDragging );

        // Make sure to update the update button after moving atoms.
        this.updateRefillButton();
      }
    } );
    ( atomNode as any ).dragListener = atomListener; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when AtomNode typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
    atomNode.addInputListener( atomListener );
    return atomNode;
  }

  /**
   * Removes atom elements from view.
   *
   * @param atom - The atom to remove
   */
  private onAtomRemovedFromPlayArea( atom: Atom2 ): void {
    // Remove mapped atom node from the view and dispose it.
    const atomNode = ( this.kitPlayAreaNode.atomNodeMap as any )[ atom.id ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when atomNodeMap typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
    atomNode.dragListener.dispose();
    atomNode.dispose();
    delete ( this.kitPlayAreaNode.atomNodeMap as any )[ atom.id ]; // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when atomNodeMap typing is available, see https://github.com/phetsims/build-a-molecule/issues/245
  }
}

buildAMolecule.register( 'BAMScreenView', BAMScreenView );