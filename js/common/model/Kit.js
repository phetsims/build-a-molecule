// Copyright 2020-2023, University of Colorado Boulder

/**
 * Contains multiple buckets of different types of atoms and a kit play area for dropping the atoms. There is only one
 * "active" kit at a time, which is regulated by toggling the carousel pages. Active kits have their buckets and kit
 * play area's visible for interaction
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../../phet-core/js/cleanArray.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMQueryParameters from '../BAMQueryParameters.js';
import LewisDotModel from './LewisDotModel.js';
import Molecule from './Molecule.js';
import MoleculeList from './MoleculeList.js';
import MoleculeStructure from './MoleculeStructure.js';

let kitIdCounter = 0;

class Kit {
  /**
   * @param {CollectionLayout} collectionLayout
   * @param {Array.<Bucket>} buckets
   */
  constructor( collectionLayout, buckets ) {

    // @public {number}
    this.id = kitIdCounter++;

    // @public {ObservableArrayDef.<Atom2>}
    this.atomsInPlayArea = createObservableArray();

    // @public {Property.<Atom|null>} Atom that has been clicked by user. Used for triggering cut targets for breaking bonds
    this.selectedAtomProperty = new Property( null );

    // @public {BooleanProperty} Whether this kit is the present kit being displayed and interacted with
    this.activeProperty = new BooleanProperty( false );

    // @public {BooleanProperty} Whether this kit is visible
    this.visibleProperty = new BooleanProperty( false );

    // @public {Emitter} - Called with a single parameter molecule
    this.addedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
    this.removedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );

    // @public {Array.<Atom2>} Master list of atoms (in and out of buckets), but not ones in collection boxes
    this.atoms = [];

    // @public {Array.<Atom2>} atoms in the collection box
    this.atomsInCollectionBox = [];

    // @public {Array.<Molecule>} molecules in the play area
    this.molecules = [];

    // @public {LewisDotModel|null} Created later, lewis-dot connections between atoms on the play area
    this.lewisDotModel = null;

    // @public {Array.<Bucket>}
    this.buckets = buckets;

    // @public {CollectionLayout}
    this.collectionLayout = collectionLayout;

    // Rest the kit and adjust the bucket layout
    this.reset();
    this.layoutBuckets( buckets );

    // Add a molecule to the kit whenever we add an atom to the play area.
    this.atomsInPlayArea.addItemAddedListener( atom => {

      // Add a molecule to the kit with our newly added atom
      const molecule = new Molecule();
      molecule.addAtom( atom );
      this.addMolecule( molecule );
    } );
  }

  /**
   * @public
   */
  reset() {
    // not resetting visible, since that is not handled by us
    this.selectedAtomProperty.reset();

    // send out notifications for all removed molecules
    this.molecules.slice().forEach( this.removeMolecule.bind( this ) );

    // put everything back in buckets
    this.atoms.concat( this.atomsInCollectionBox ).forEach( atom => {
      // reset the actual atom
      atom.reset();

      // THEN place it so we overwrite its "bad" position and destination info
      this.getBucketForElement( atom.element ).placeAtom( atom, true );
    } );

    // if reset kit ignores collection boxes, add in other atoms that are equivalent to how the bucket started
    // NOTE: right now, the actual atom models move back to the buckets even though the virtual "molecule" says in the box. consider moving it!

    // wipe our internal state
    cleanArray( this.atoms );
    cleanArray( this.atomsInCollectionBox );
    this.atomsInPlayArea.reset();
    this.lewisDotModel = new LewisDotModel();
    cleanArray( this.molecules );

    // keep track of all atoms in our kit
    this.buckets.forEach( bucket => {
      this.atoms = this.atoms.concat( bucket.getParticleList() );

      bucket.getParticleList().forEach( atom => {
        this.lewisDotModel.addAtom( atom );
      } );

      // Set the bucket to its filled state.
      bucket.setToFullState();
    } );
  }

  /**
   * Adjust the layout of the buckets along with moving their atoms to the correct positions
   *
   * @param {Array.<Bucket>} buckets
   * @public
   */
  layoutBuckets( buckets ) {
    let usedWidth = 0;
    const bucketBounds = Bounds2.NOTHING.copy(); // considered mutable, used to calculate the center bounds of a bucket AND its atoms

    // lays out all of the buckets from the left to right
    for ( let i = 0; i < buckets.length; i++ ) {
      const bucket = buckets[ i ];
      if ( i !== 0 ) {
        usedWidth += Kit.bucketPadding;
      }

      // include both the bucket's shape and its atoms in our bounds, so we can properly center the group
      bucketBounds.includeBounds( bucket.containerShape.bounds );
      bucket.getParticleList().forEach( atom => {
        const atomPosition = atom.positionProperty.value;
        bucketBounds.includeBounds( new Bounds2( atomPosition.x - atom.covalentRadius, atomPosition.y - atom.covalentRadius,
          atomPosition.x + atom.covalentRadius, atomPosition.y + atom.covalentRadius ) );
      } );
      bucket.position = new Vector2( usedWidth, 0 );
      usedWidth += bucket.width;
    }

    // centers the buckets horizontally within the kit
    buckets.forEach( bucket => {

      // also note: this moves the atoms also!
      bucket.position = new Vector2( bucket.position.x - usedWidth / 2 + bucket.width / 2, bucketBounds.centerY );
    } );
  }

  /**
   * Returns the bucket for a given element
   * @param {Element} element
   *
   * @private
   * @returns {Bucket}
   */
  getBucketForElement( element ) {
    const elementBucket = _.find( this.buckets, bucket => {
      return bucket.element.isSameElement( element );
    } );
    assert && assert( elementBucket, 'Element does not have an associated bucket.' );
    return elementBucket;
  }

  /**
   * Returns kit bounds within the collection layout
   *
   * @public
   * @returns {Bounds2}
   */
  get availableKitBounds() {
    return this.collectionLayout.availableKitBounds;
  }

  /**
   * Returns play area bounds within the collection layout
   * @public
   *
   * @returns {Bounds2}
   */
  get availablePlayAreaBounds() {
    return this.collectionLayout.availablePlayAreaBounds;
  }

  /**
   * Called when an atom is dropped within either the play area OR the kit area. This will NOT be called for molecules
   * dropped into the collection area successfully
   *
   * @param {Atom2} atom - The dropped atom.
   * @param {boolean} droppedInKitArea - The dropped atom.
   * @public
   */
  atomDropped( atom, droppedInKitArea ) {
    const molecule = this.getMolecule( atom );

    // dropped on kit, put it in a bucket
    if ( droppedInKitArea ) {
      this.recycleMoleculeIntoBuckets( molecule );
    }
    else {

      // dropped in play area
      if ( molecule ) {
        this.attemptToBondMolecule( molecule );
        this.separateMoleculeDestinations();
      }
    }
  }

  /**
   * Called when a molecule is dragged (successfully) into a collection box
   *
   * @param {Molecule} molecule
   * @param {CollectionBox} box
   * @public
   */
  moleculePutInCollectionBox( molecule, box ) {
    if ( BAMQueryParameters.logData ) {
      console.log( `You have collected: ${box.moleculeType.commonName}` );
    }
    this.removeMolecule( molecule );
    molecule.atoms.forEach( atom => {
      this.atoms.splice( this.atoms.indexOf( atom ), 1 );
      this.atomsInCollectionBox.push( atom );
      atom.visibleProperty.value = false;

      // Atoms in the CollectionBox shouldn't be in the play area.
      this.atomsInPlayArea.remove( atom );
    } );
    box.addMolecule( molecule );
  }

  /**
   * Returns whether or not this atom registered in any of the molecule structures
   * @param {Atom2} atom
   * @public
   *
   * @returns {boolean}
   */
  isAtomInPlay( atom ) {
    return this.getMolecule( atom ) !== null;
  }

  /**
   * Return the molecule of a given atom. This can return a molecule with only one atom and zero bonds (single atom).
   * @param {Atom2} atom
   * @public
   *
   * @returns {Molecule|null}
   */
  getMolecule( atom ) {
    // Note: (performance) seems like this could be a bottleneck? faster ways?
    const numMolecules = this.molecules.length;
    for ( let i = 0; i < numMolecules; i++ ) {
      const molecule = this.molecules[ i ];

      const numAtoms = molecule.atoms.length;
      for ( let j = 0; j < numAtoms; j++ ) {
        const otherAtom = molecule.atoms[ j ];
        if ( otherAtom === atom ) {
          return molecule;
        }
      }
    }
    return null;
  }

  /**
   * Breaks apart a molecule into separate atoms that remain in the play area
   *
   * @param {Molecule} molecule - the molecule to break
   * @public
   */
  breakMolecule( molecule ) {
    const createdMolecules = [];
    this.removeMolecule( molecule );
    molecule.atoms.forEach( atom => {

      // Break the current molecule and create a new molecule for each atom
      this.lewisDotModel.breakBondsOfAtom( atom );
      const newMolecule = new Molecule();
      newMolecule.addAtom( atom );
      this.addMolecule( newMolecule );
      createdMolecules.push( molecule );
    } );

    // Separate all the molecules, including the newly created molecules.
    this.separateMoleculeDestinations();
  }

  /**
   * Breaks a bond between two atoms in a molecule.
   * @param {Atom2} a - Atom A
   * @param {Atom2} b - Atom B
   *
   * @public
   */
  breakBond( a, b ) {

    // get our old and new molecule structures
    const oldMolecule = this.getMolecule( a );
    const newMolecules = MoleculeStructure.getMoleculesFromBrokenBond( oldMolecule, oldMolecule.getBond( a, b ), new Molecule(), new Molecule() );

    // break the bond in our lewis dot model
    this.lewisDotModel.breakBond( a, b );

    // remove the old one, add the new ones (firing listeners)
    this.removeMolecule( oldMolecule );
    newMolecules.forEach( this.addMolecule.bind( this ) );

    // push the new separate molecules away
    this.separateMoleculeDestinations();
  }

  /**
   * Return the direction of the bond between two atoms
   * @param {Atom2} a - An atom A
   * @param {Atom2} b - An atom B
   *
   * @public
   * @returns {Direction}
   */
  getBondDirection( a, b ) {
    return this.lewisDotModel.getBondDirection( a, b );
  }

  /**
   * Checks if all of the buckets in the kit are filled.
   *
   * @public
   * @returns {boolean}
   */
  allBucketsFilled() {
    let allBucketsFilled = true;
    this.buckets.forEach( bucket => {
      if ( !bucket.isFull() ) {
        allBucketsFilled = false;
      }
    } );
    return allBucketsFilled;
  }

  /**
   * Add a molecule to this kit
   * @param {Molecule} molecule
   *
   * @public
   */
  addMolecule( molecule ) {
    this.molecules.push( molecule );
    this.addedMoleculeEmitter.emit( molecule );
  }

  /**
   * Remove a molecule from this kit
   * @param {Molecule} molecule
   *
   * @public
   */
  removeMolecule( molecule ) {
    arrayRemove( this.molecules, molecule );
    this.removedMoleculeEmitter.emit( molecule );
  }

  /**
   * Takes an atom that was in a bucket and hooks it up within our structural model. It allocates a molecule for the
   * atom, and then attempts to bond with it.
   * @param {Atom2} atom
   *
   * @public
   */
  addAtomToPlay( atom ) {

    // add the atoms to our models
    const molecule = new Molecule();
    molecule.addAtom( atom );

    this.addMolecule( molecule );

    // attempt to bond
    this.attemptToBondMolecule( molecule );
  }

  /**
   * Returns whether or not the atom is contained in any of this kit's buckets
   * @param {Atom2} atom
   * @private
   *
   * @returns {boolean}
   */
  isContainedInBucket( atom ) {
    return _.some( this.buckets, bucket => {
      return bucket.containsParticle( atom );
    } );
  }

  /**
   * Takes an atom, invalidates the structural bonds it may have, and puts it in the correct bucket
   * @param {Atom2} atom - the atom to recycle
   * @param {boolean} animate Whether we should display animation
   *
   * @private
   */
  recycleAtomIntoBuckets( atom, animate ) {
    this.lewisDotModel.breakBondsOfAtom( atom );
    this.atomsInPlayArea.remove( atom );
    const bucket = this.getBucketForElement( atom.element );
    bucket.addParticleNearestOpen( atom, animate );
    if ( !bucket.particleList.includes( atom ) ) {
      bucket.particleList.push( atom );
    }
  }

  /**
   * Recycles an entire molecule by invalidating its bonds and putting its atoms into their respective buckets
   * @param {Molecule} molecule
   *
   * @private
   */
  recycleMoleculeIntoBuckets( molecule ) {
    molecule.atoms.forEach( atom => {
      this.recycleAtomIntoBuckets( atom, true );
    } );
    this.removeMolecule( molecule );
  }

  /**
   * Add padding to the molecule bounds.
   * @param {Bounds2} bounds
   *
   * @private
   * @returns {Bounds2}
   */
  padMoleculeBounds( bounds ) {
    const halfPadding = Kit.interMoleculePadding / 2;
    return Bounds2.rect( bounds.x - halfPadding, bounds.y - halfPadding, bounds.width + Kit.interMoleculePadding, bounds.height + Kit.interMoleculePadding );
  }

  /**
   * Update atom destinations so that separate molecules will be separated visually
   *
   * @private
   */
  separateMoleculeDestinations() {
    let maxIterations = 200;
    const pushAmount = 10; // how much to push two molecules away
    const availablePlayAreaBounds = this.collectionLayout.availablePlayAreaBounds;
    const numMolecules = this.molecules.length;

    let foundOverlap = true;
    while ( foundOverlap && maxIterations-- >= 0 ) {
      foundOverlap = false;
      for ( let i = 0; i < numMolecules; i++ ) {
        const a = this.molecules[ i ];

        let aBounds = this.padMoleculeBounds( a.destinationBounds );

        // push it away from the outsides
        if ( aBounds.minX < availablePlayAreaBounds.minX ) {
          a.shiftDestination( new Vector2( availablePlayAreaBounds.minX - aBounds.minX, 0 ) );
          aBounds = this.padMoleculeBounds( a.destinationBounds );
        }
        if ( aBounds.maxX > availablePlayAreaBounds.maxX ) {
          a.shiftDestination( new Vector2( availablePlayAreaBounds.maxX - aBounds.maxX, 0 ) );
          aBounds = this.padMoleculeBounds( a.destinationBounds );
        }
        if ( aBounds.minY < availablePlayAreaBounds.minY ) {
          a.shiftDestination( new Vector2( 0, availablePlayAreaBounds.minY - aBounds.minY ) );
          aBounds = this.padMoleculeBounds( a.destinationBounds );
        }
        if ( aBounds.maxY > availablePlayAreaBounds.maxY ) {
          a.shiftDestination( new Vector2( 0, availablePlayAreaBounds.maxY - aBounds.maxY ) );
        }

        // then separate it from other molecules
        for ( let k = 0; k < numMolecules; k++ ) {
          const b = this.molecules[ k ];

          if ( a.moleculeId >= b.moleculeId ) {
            // this removes the case where a == b, and will make sure we don't run the following code twice for (a,b) and (b,a)
            continue;
          }
          const bBounds = this.padMoleculeBounds( b.destinationBounds );
          if ( aBounds.intersectsBounds( bBounds ) ) {
            foundOverlap = true;

            // get perturbed centers. this is so that if two molecules have the exact same centers, we will push them away
            const aCenter = aBounds.center.add( new Vector2( dotRandom.nextDouble() - 0.5, dotRandom.nextDouble() - 0.5 ) );
            const bCenter = bBounds.center.add( new Vector2( dotRandom.nextDouble() - 0.5, dotRandom.nextDouble() - 0.5 ) );

            // delta from center of A to center of B, scaled to half of our push amount.
            const delta = bCenter.minus( aCenter ).normalized().times( pushAmount );

            // how hard B should be pushed (A will be pushed (1-pushRatio)). Heuristic, power is to make the ratio not too skewed
            // this is done so that heavier molecules will be pushed less, while lighter ones will be pushed more
            const pushPower = 1;
            const pushRatio = Math.pow( a.getApproximateMolecularWeight(), pushPower ) / ( Math.pow( a.getApproximateMolecularWeight(), pushPower ) + Math.pow( b.getApproximateMolecularWeight(), pushPower ) );

            // push B by the pushRatio
            b.shiftDestination( delta.times( pushRatio ) );

            // push A the opposite way, by (1 - pushRatio)
            const delta1 = delta.times( -1 * ( 1 - pushRatio ) );
            a.shiftDestination( delta1 );

            aBounds = this.padMoleculeBounds( a.destinationBounds );
          }
        }
      }
    }
  }

  /**
   * Bonds one atom to another, and handles the corresponding structural changes between molecules.
   * @param {Atom2} a - An atom A
   * @param {Direction} dirAtoB - The direction from A that the bond will go in (for lewis-dot structure)
   * @param {Atom2} b - An atom B
   *
   * @private
   */
  bond( a, dirAtoB, b ) {
    this.lewisDotModel.bond( a, dirAtoB, b );
    const molA = this.getMolecule( a );
    const molB = this.getMolecule( b );
    if ( molA === molB ) {
      throw new Error( 'WARNING: loop or other invalid structure detected in a molecule' );
    }

    const newMolecule = MoleculeStructure.getCombinedMoleculeFromBond( molA, molB, a, b, new Molecule() );

    this.removeMolecule( molA );
    this.removeMolecule( molB );
    this.addMolecule( newMolecule );

    /*---------------------------------------------------------------------------*
     * bonding diagnostics and sanity checks
     *----------------------------------------------------------------------------*/

    if ( BAMQueryParameters.logData ) {
      const serializedForm = this.getMolecule( a ).toSerial2();
      console.log( `created structure: ${serializedForm}` );
    }
    const structure = this.getMolecule( a );
    if ( structure.atoms.length > 2 ) {
      structure.bonds.forEach( bond => {
        if ( bond.a.hasSameElement( bond.b ) && bond.a.symbol === 'H' ) {
          console.log( 'WARNING: Hydrogen bonded to another hydrogen in a molecule which is not diatomic hydrogen' );
        }
      } );
    }
  }

  /**
   * @param {Atom2} a - An atom A
   * @param {Atom2} b - An atom B
   * @private
   *
   * @returns {MoleculeStructure}
   */
  getPossibleMoleculeStructureFromBond( a, b ) {
    const molA = this.getMolecule( a );
    const molB = this.getMolecule( b );
    assert && assert( molA !== molB );

    return MoleculeStructure.getCombinedMoleculeFromBond( molA, molB, a, b, new Molecule() );
  }

  /**
   * Attempt to bond a molecule to another molecule based on the open bonding options
   * @param {Molecule} molecule - A molecule that should attempt to bind to other molecules
   * @private
   *
   * @returns {boolean}
   */
  attemptToBondMolecule( molecule ) {
    let bestBondingOption = null; // {BondingOption|null}
    let bestDistanceFromIdealPosition = Number.POSITIVE_INFINITY;
    let atomsOverlap = false;

    // for each atom in our molecule, we try to see if it can bond to other atoms
    molecule.atoms.forEach( ourAtom => {

      // all other atoms
      this.atoms.forEach( otherAtom => {

        // disallow loops in an already-connected molecule
        if ( this.getMolecule( otherAtom ) === molecule ) {
          return; // continue, in the inner loop
        }

        // don't bond to something in a bucket!
        if ( !this.isContainedInBucket( otherAtom ) ) {

          // sanity check, and run it through our molecule structure model to see if it would be allowable
          if ( otherAtom === ourAtom || !this.canBond( ourAtom, otherAtom ) ) {
            return; // continue, in the inner loop
          }

          this.lewisDotModel.getOpenDirections( otherAtom ).forEach( otherDirection => {
            const direction = otherDirection.opposite;
            if ( !_.includes( this.lewisDotModel.getOpenDirections( ourAtom ), direction ) ) {
              // the spot on otherAtom was open, but the corresponding spot on our main atom was not
              return; // continue, in the inner loop
            }

            // check the lewis dot model to make sure we wouldn't have two "overlapping" atoms that aren't both hydrogen
            if ( !this.lewisDotModel.willAllowBond( ourAtom, direction, otherAtom ) ) {
              return; // continue, in the inner loop
            }

            const bondingOption = new BondingOption( otherAtom, otherDirection, ourAtom );
            const distance = ourAtom.positionProperty.value.distance( bondingOption.idealPosition );
            if ( distance < bestDistanceFromIdealPosition ) {
              bestBondingOption = bondingOption;
              bestDistanceFromIdealPosition = distance;
            }

            if ( ourAtom.positionBounds.intersectsBounds( otherAtom.positionBounds ) ) {
              atomsOverlap = true;
            }
          } );
        }
      } );
    } );

    // if our closest bond is too far and our atoms don't overlap, then ignore it
    const isBondingInvalid = ( bestBondingOption === null || bestDistanceFromIdealPosition > Kit.bondDistanceThreshold ) && !atomsOverlap;

    if ( isBondingInvalid ) {
      this.separateMoleculeDestinations();
      return false;
    }

    // cause all atoms in the molecule to move to that position
    const delta = bestBondingOption.idealPosition.minus( bestBondingOption.b.positionProperty.value );
    this.getMolecule( bestBondingOption.b ).atoms.forEach( atomInMolecule => {
      atomInMolecule.setPositionAndDestination( atomInMolecule.positionProperty.value.plus( delta ) );
    } );

    // we now will bond the atom
    this.bond( bestBondingOption.a, bestBondingOption.direction, bestBondingOption.b ); // model bonding
    return true;
  }

  /**
   * Returns if two atoms can create a bond
   * @param {Atom2} a - An atom A
   * @param {Atom2} b - An atom B
   *
   * @private
   * @returns {boolean}
   */
  canBond( a, b ) {
    return this.getMolecule( a ) !== this.getMolecule( b ) &&
           this.isAllowedStructure( this.getPossibleMoleculeStructureFromBond( a, b ) ) &&
           this.collectionLayout.availablePlayAreaBounds.containsPoint( a.positionProperty.value ) &&
           this.collectionLayout.availablePlayAreaBounds.containsPoint( b.positionProperty.value );
  }

  /**
   * Checks if the molecule structure is found within our molecule data
   * @param {MoleculeStructure} moleculeStructure
   * @private
   *
   * @returns {boolean}
   */
  isAllowedStructure( moleculeStructure ) {
    return moleculeStructure.atoms.length < 2 ||
           MoleculeList.getMasterInstance().isAllowedStructure( moleculeStructure );
  }
}

// A bond option from A to B. B would be moved to the position near A to bond.
class BondingOption {
  /**
   * @param {Atom2} a - An atom A
   * @param {Direction} direction
   * @param {Atom2} b - An atom b
   */
  constructor( a, direction, b ) {

    // @public {Atom2}
    this.a = a;

    // @public {Direction}
    this.direction = direction;

    // @public {Atom2}
    this.b = b;

    // @private {Vector2} The position the atom should be placed
    this.idealPosition = a.positionProperty.value.plus( direction.vector.times( a.covalentRadius + b.covalentRadius ) );
  }
}

// @private {BondingOption} Available bonding option
Kit.BondingOption = BondingOption;

// @private {number} Determines how close a molecule needs to be to attempt to bond
Kit.bondDistanceThreshold = 100;

// @private {number} Distance between each bucket
Kit.bucketPadding = 50;

// @private {number} Determines how far away to separate the molecules from each other
Kit.interMoleculePadding = 100;

buildAMolecule.register( 'Kit', Kit );
export default Kit;
