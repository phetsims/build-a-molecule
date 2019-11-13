// Copyright 2013-2019, University of Colorado Boulder

/**
 * Node canvas for Build a Molecule. It features kits shown at the bottom. Can be extended to add other parts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const AtomNode = require( 'BUILD_A_MOLECULE/view/AtomNode' );
  const BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const Color = require( 'SCENERY/util/Color' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const KitCollectionNode = require( 'BUILD_A_MOLECULE/view/KitCollectionNode' );
  const KitPlayAreaNode = require( 'BUILD_A_MOLECULE/view/KitPlayAreaNode' );
  const MoleculeControlsHBox = require( 'BUILD_A_MOLECULE/view/MoleculeControlsHBox' );
  const Molecule3DDialog = require( 'BUILD_A_MOLECULE/view/view3d/Molecule3DDialog' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Shape = require( 'KITE/Shape' );
  const SliceNode = require( 'BUILD_A_MOLECULE/view/SliceNode' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );

  class BAMView extends ScreenView {
    /**
     * @param {KitCollectionList} kitCollectionList
     * @constructor
     */
    constructor( kitCollectionList ) {
      super();
      this.atomNodeMap = {};
      this.kitCollectionMap = {}; // maps KitCollection ID => KitCollectionNode
      this.metadataMap = {}; // moleculeId => MoleculeControlsHBox
      this.bondMap = {}; // moleculeId => MoleculeBondContainerNode

      // @public {Bounds2} Bounds used to limit where molecules can reside in the play area.
      this.playAreaDragBounds = new Bounds2( -1500, -250, 1450, 800 );

      // @public {KitCollectionList}
      this.kitCollectionList = kitCollectionList;
      this.addCollection( kitCollectionList.currentCollectionProperty.value, false );

      // @public {fucntion} Reference to callback that displays dialog for 3d node representation
      this.showDialogCallback = this.showDialog.bind( this );

      // Components relevant to swipe node used to manually break bonded molecules.
      const viewSwipeBounds = BAMConstants.MODEL_VIEW_TRANSFORM.modelToViewBounds(
        kitCollectionList.currentCollectionProperty.value.currentKitProperty.value.collectionLayout.availablePlayAreaBounds
      );
      const sliceNode = new SliceNode(
        kitCollectionList.currentCollectionProperty.value.currentKitProperty.value,
        viewSwipeBounds,
        this
      );
      const swipeCatch = Rectangle.bounds( viewSwipeBounds.eroded( BAMConstants.VIEW_PADDING ) );
      swipeCatch.addInputListener( sliceNode.sliceInputListener );

      // KitPlayAreaNode for the main BAMView listens to the kitPlayArea of each kit in the model to fill or remove
      // its content.
      const kits = [];

      // Create a play area to house the molecules.
      this.kitPlayAreaNode = new KitPlayAreaNode( kits );

      kitCollectionList.currentCollectionProperty.link( ( newCollection, oldCollection ) => {
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
      kitCollectionList.addedCollectionEmitter.addListener( this.addCollection.bind( this ) );

      this.addChild( swipeCatch );
      this.addChild( this.kitPlayAreaNode );
      this.addChild( sliceNode );

      // Create a button to refill the kit
      const kitPanel = this.kitCollectionMap[ 0 ].kitPanel;
      const refillButton = new TextPushButton( 'Refill', {
        listener: () => {
          this.kitPlayAreaNode.resetPlayAreaKit();
          this.kitPlayAreaNode.currentKit.buckets.forEach( bucket => {
            bucket.setToFullState();
          } );
          this.updateRefillButton();
        },
        baseColor: Color.ORANGE,
        font: new PhetFont( { size: 12, weight: 'bold' } ),
        left: kitPanel.left,
        bottom: kitPanel.top - 7
      } );
      refillButton.touchArea = Shape.bounds( refillButton.selfBounds.union( refillButton.childBounds ).dilated( 10 ) );

      // @private {function} Refill button is enabled if atoms exists outside of the bucket.
      this.updateRefillButton = () => {
        refillButton.enabled = !kitCollectionList.currentCollectionProperty.value.currentKitProperty.value.allBucketsFilled();
      };

      // Create a reset all button. Position altered on "Larger" Screen.
      this.resetAllButton = new ResetAllButton( {
        listener: () => {

          // When clicked, empty collection boxes
          kitCollectionList.currentCollectionProperty.value.collectionBoxes.forEach( box => {
            box.reset();
          } );
          kitCollectionList.currentCollectionProperty.value.kits.forEach( kit => {
            kit.reset();
          } );
          kitCollectionList.reset();
          kitPanel.reset();
          this.updateRefillButton();
        },
        radius: BAMConstants.RESET_BUTTON_RADIUS,
        right: kitPanel.right,
        bottom: refillButton.bottom
      } );
      this.resetAllButton.touchArea = Shape.bounds( this.resetAllButton.bounds.dilated( 7 ) );
      this.addChild( this.resetAllButton );
      this.resetAllButton.moveToBack();

      // Update the refill button when the kit is switched. Also update the kit of the sliceNode
      // kitCollectionList.currentCollectionProperty.value.currentKitProperty.link( kit => {
      //   this.kitPlayAreaNode.currentKit = kit;
      //   sliceNode.swapKit( kit );
      //   this.updateRefillButton();
      // } );
      this.addChild( refillButton );

      // Kit listeners added to manage molecule metadata.
      this.kitCollectionList.currentCollectionProperty.link( collection => {
        collection.kits.forEach( kit => {

          // handle molecule creation and destruction
          kit.addedMoleculeEmitter.addListener( molecule => {
            var moleculeControlsHBox = new MoleculeControlsHBox( kit, molecule, this.showDialogCallback );
            this.kitPlayAreaNode.metadataLayer.addChild( moleculeControlsHBox );
            this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ] = moleculeControlsHBox;

            if ( BAMConstants.ALLOW_BOND_BREAKING ) {
              this.kitPlayAreaNode.addMoleculeBondNodes( molecule );
            }
          } );
          kit.removedMoleculeEmitter.addListener( molecule => {
            var moleculeControlsHBox = this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ];
            if ( moleculeControlsHBox ) {
              this.kitPlayAreaNode.metadataLayer.removeChild( moleculeControlsHBox );
              moleculeControlsHBox.dispose();
              delete this.kitPlayAreaNode.metadataMap[ molecule.moleculeId ];

              if ( BAMConstants.ALLOW_BOND_BREAKING ) {
                this.kitPlayAreaNode.removeMoleculeBondNodes( molecule );
              }
            }
          } );
        } );
      } );

      // When a collection is changed, update the listeners to the kits, KitPlayAreaNode and sliceNode.
      kitCollectionList.currentCollectionProperty.link( collection => {

        // KitPlayAreaNode kits should be updated to the kits in the new collection.
        this.kitPlayAreaNode.kitsProperty.value = collection.kits;
        collection.kits.forEach( kit => {

          // Reset our kitPlayAreaNode for the new collection
          this.kitPlayAreaNode.resetPlayAreaKit();
          this.kitPlayAreaNode.currentKit = collection.currentKitProperty.value;
          this.kitPlayAreaNode.moveToFront();

          // Used for tracking kits in KitPlayAreaNode
          kits.push( kit );

          // Each kit gets listeners for managing its play area.
          kit.atomsInPlayArea.addItemAddedListener( atom => {
            this.addAtomNodeToPlayArea( atom, collection );
            this.updateRefillButton();
          } );
          kit.atomsInPlayArea.addItemRemovedListener( atom => {
            this.onAtomRemovedFromPlayArea( atom );
            this.updateRefillButton();
          } );

          // KitPlayAreaNode and sliceNode should update their kits
          collection.currentKitProperty.link( kit => {
            this.kitPlayAreaNode.currentKit = kit;
            sliceNode.swapKit( kit );
            this.updateRefillButton();
          } );
          this.updateRefillButton();
        } );
      } );
    }

    /**
     * @private
     */
    step() {
      if ( this.dialog ) {
        this.dialog.render( undefined );
      }
    }

    /**
     * Responsible for showing 3d representation of molecule.
     *
     * @param completeMolecule
     * @private
     */
    showDialog( completeMolecule ) {
      this.dialog = new Molecule3DDialog( completeMolecule );
      this.dialog.show();

    }

    /**
     *
     * @param {KitCollection} collection
     * @param {boolean} isCollectingView
     * @returns {*}
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

    addAtomNodeToPlayArea( atom, kitCollection ) {
      const atomNode = this.addAtomNodeToPlayAreaNode( atom );
      let lastPosition;
      const atomListener = new DragListener( {
        transform: BAMConstants.MODEL_VIEW_TRANSFORM,
        targetNode: atomNode,
        locationProperty: atom.positionProperty,
        start: () => {
          // Get atom position before drag
          lastPosition = atom.positionProperty.value;

          // If a molecule is animating interrupt the animation process.
          atom.userControlledProperty.value = true;
          const molecule = kitCollection.currentKitProperty.value.getMolecule( atom );
          if ( molecule ) {
            molecule.atoms.forEach( moleculeAtom => {
              if ( moleculeAtom ) {
                moleculeAtom.interruptAnimation( atom.userControlledProperty.value );
              }
            } );
          }

          // Update the current kit in the play area node.
          this.kitPlayAreaNode.currentKit = this.kitCollectionList.currentCollectionProperty.value.currentKitProperty.value;
        },
        drag: () => {

          // Get delta from start of drag
          const delta = atom.positionProperty.value.minus( lastPosition );

          // Set the last position to the newly dragged position.
          lastPosition = atom.positionProperty.value;

          // Handles atoms with multiple molecules
          const molecule = kitCollection.currentKitProperty.value.getMolecule( atom );
          if ( molecule ) {
            molecule.atoms.forEach( moleculeAtom => {
              if ( moleculeAtom !== atom ) {
                moleculeAtom.positionProperty.value = moleculeAtom.positionProperty.value.plus( delta );
              }
            } );
          }
          else {
            atomNode.moveToFront();
          }
        },
        end: () => {
          // Consider an atom released and mark its position
          atom.userControlledProperty.value = false;

          // Keep track of view elements used later in the callback
          const mappedAtomNode = this.kitPlayAreaNode.atomNodeMap[ atom.id ];
          const mappedKitCollectionBounds = this.kitCollectionMap[ this.kitCollectionList.currentCollectionProperty.value.id ].bounds;
          const currentKit = kitCollection.currentKitProperty.value;
          const molecule = kitCollection.currentKitProperty.value.getMolecule( atom );

          // Responsible for dropping molecules in play area or kit area
          const droppedInKitArea = mappedAtomNode && mappedAtomNode.bounds.intersectsBounds( mappedKitCollectionBounds );

          // Set the atom position to the closest position within the play area bounds, unless it's dropped in kit area.
          if ( !this.playAreaDragBounds.containsPoint( atom.positionProperty.value ) && !droppedInKitArea ) {
            this.setAnimationParameters( atom, this.playAreaDragBounds.closestPointTo( atom.positionProperty.value ) );

            // Track changed position of atom after returning to constrained bounds.
            // All atoms bonded to the dragged atom need to be offset by this delta.
            const delta = atom.animationEndPosition.minus( atom.animationStartPosition );

            // Every other atom in the molecule should update its position with the same delta.
            if ( molecule ) {
              molecule.atoms.forEach( moleculeAtom => {
                if ( moleculeAtom !== atom ) {
                  this.setAnimationParameters( moleculeAtom, moleculeAtom.positionProperty.value.plus( delta ) );
                }
              } );
            }
          }

          // Responsible bonding molecules in play area or breaking molecule bonds and returned to kit.
          // We don't want to do this while the molecule is animating.
          if ( !atom.isAnimatingProperty.value ) {
            currentKit.atomDropped( atom, droppedInKitArea );
          }

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
     * @param atom {Atom2}
     * @param animationEndPosition {Vector2}
     * @private
     */
    setAnimationParameters( atom, animationEndPosition ) {
      atom.animationStartPosition = atom.positionProperty.value;
      atom.animationEndPosition = animationEndPosition;
      atom.isAnimatingProperty.set( true );
    }

    /**
     * Removes atom elements from view.
     *
     * @param atom {Atom2}
     * @private
     */
    onAtomRemovedFromPlayArea( atom ) {

      // Remove mapped atom node from the view and dispose it.
      this.kitPlayAreaNode.atomLayer.removeChild( this.kitPlayAreaNode.atomNodeMap[ atom.id ] );
      delete this.kitPlayAreaNode.atomNodeMap[ atom.id ];
    }
  }

  return buildAMolecule.register( 'BAMView', BAMView );
} );