// Copyright 2020-2024, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

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

  // Public properties
  public readonly id: number; // unique identifier
  public readonly atomsInPlayArea: any; // @ts-expect-error - ObservableArrayDef.<Atom2> - atoms currently in the play area
  public readonly selectedAtomProperty: Property<any>; // @ts-expect-error - Property.<Atom|null> - Atom that has been clicked by user. Used for triggering cut targets for breaking bonds
  public readonly activeProperty: BooleanProperty; // Whether this kit is the present kit being displayed and interacted with
  public readonly visibleProperty: BooleanProperty; // Whether this kit is visible
  public readonly addedMoleculeEmitter: Emitter; // Called with a single parameter molecule
  public readonly removedMoleculeEmitter: Emitter; // Called with a single parameter molecule
  public readonly atoms: any[]; // @ts-expect-error - Array.<Atom2> - Main list of atoms (in and out of buckets), but not ones in collection boxes
  public readonly atomsInCollectionBox: any[]; // @ts-expect-error - Array.<Atom2> - atoms in the collection box
  public readonly molecules: Molecule[]; // molecules in the play area
  public lewisDotModel: any; // @ts-expect-error - LewisDotModel|null - Created later, lewis-dot connections between atoms on the play area
  public readonly buckets: any[]; // @ts-expect-error - Array.<Bucket> - the buckets in this kit
  public readonly collectionLayout: any; // @ts-expect-error - CollectionLayout - the layout for this kit

  /**
   * @param collectionLayout - The collection layout
   * @param buckets - Array of buckets
   */
  public constructor( collectionLayout: any, buckets: any[] ) { // @ts-expect-error - TODO: Fix when CollectionLayout and Bucket are converted, see https://github.com/phetsims/build-a-molecule/issues/245

    this.id = kitIdCounter++;
    this.atomsInPlayArea = createObservableArray();
    this.selectedAtomProperty = new Property( null );
    this.activeProperty = new BooleanProperty( false );
    this.visibleProperty = new BooleanProperty( false );
    this.addedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
    this.removedMoleculeEmitter = new Emitter( { parameters: [ { valueType: Molecule } ] } );
    this.atoms = [];
    this.atomsInCollectionBox = [];
    this.molecules = [];
    this.lewisDotModel = null;
    this.buckets = buckets;
    this.collectionLayout = collectionLayout;

    // Rest the kit and adjust the bucket layout
    this.reset();
    this.layoutBuckets( buckets );

    // Add a molecule to the kit whenever we add an atom to the play area.
    this.atomsInPlayArea.addItemAddedListener( ( atom: any ) => { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245

      // Add a molecule to the kit with our newly added atom
      const molecule = new Molecule();
      molecule.addAtom( atom );
      this.addMolecule( molecule );
    } );
  }

  /**
   * Reset the kit
   */
  public reset(): void {
    // not resetting visible, since that is not handled by us
    this.selectedAtomProperty.reset();

    // send out notifications for all removed molecules
    this.molecules.slice().forEach( this.removeMolecule.bind( this ) );

    // put everything back in buckets
    this.atoms.concat( this.atomsInCollectionBox ).forEach( ( atom: any ) => { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
    this.buckets.forEach( ( bucket: any ) => { // @ts-expect-error - TODO: Fix when Bucket is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      this.atoms = this.atoms.concat( bucket.getParticleList() );

      bucket.getParticleList().forEach( ( atom: any ) => { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
        this.lewisDotModel.addAtom( atom );
      } );

      // Set the bucket to its filled state.
      bucket.setToFullState();
    } );
  }

  /**
   * Adjust the layout of the buckets along with moving their atoms to the correct positions
   * @param buckets - Array of buckets to layout
   */
  public layoutBuckets( buckets: any[] ): void { // @ts-expect-error - TODO: Fix when Bucket is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
      bucket.getParticleList().forEach( ( atom: any ) => { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
        const atomPosition = atom.positionProperty.value;
        bucketBounds.includeBounds( new Bounds2( atomPosition.x - atom.covalentRadius, atomPosition.y - atom.covalentRadius,
          atomPosition.x + atom.covalentRadius, atomPosition.y + atom.covalentRadius ) );
      } );
      bucket.position = new Vector2( usedWidth, 0 );
      usedWidth += bucket.width;
    }

    // centers the buckets horizontally within the kit
    buckets.forEach( ( bucket: any ) => { // @ts-expect-error - TODO: Fix when Bucket is converted, see https://github.com/phetsims/build-a-molecule/issues/245

      // also note: this moves the atoms also!
      bucket.position = new Vector2( bucket.position.x - usedWidth / 2 + bucket.width / 2, bucketBounds.centerY );
    } );
  }

  /**
   * Returns the bucket for a given element
   * @param element - The element to find a bucket for
   */
  private getBucketForElement( element: any ): any { // @ts-expect-error - TODO: Fix when Element and Bucket are converted, see https://github.com/phetsims/build-a-molecule/issues/245
    const elementBucket = this.buckets.find( ( bucket: any ) => { // @ts-expect-error - TODO: Fix when Bucket is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      return bucket.element.isSameElement( element );
    } );
    assert && assert( elementBucket, 'Element does not have an associated bucket.' );
    return elementBucket;
  }

  /**
   * Returns kit bounds within the collection layout
   */
  public get availableKitBounds(): any { // @ts-expect-error - TODO: Fix when Bounds2 type is available, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.collectionLayout.availableKitBounds;
  }

  /**
   * Returns play area bounds within the collection layout
   */
  public get availablePlayAreaBounds(): any { // @ts-expect-error - TODO: Fix when Bounds2 type is available, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.collectionLayout.availablePlayAreaBounds;
  }

  /**
   * Called when an atom is dropped within either the play area OR the kit area. This will NOT be called for molecules
   * dropped into the collection area successfully
   * @param atom - The dropped atom
   * @param droppedInKitArea - Whether the atom was dropped in the kit area
   */
  public atomDropped( atom: any, droppedInKitArea: boolean ): void { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
   * @param molecule - The molecule being put in the box
   * @param box - The collection box
   */
  public moleculePutInCollectionBox( molecule: Molecule, box: any ): void { // @ts-expect-error - TODO: Fix when CollectionBox is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    if ( BAMQueryParameters.logData ) {
      console.log( `You have collected: ${box.moleculeType.commonName}` );
    }
    this.removeMolecule( molecule );
    molecule.atoms.forEach( ( atom: any ) => { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
   * @param atom - The atom to check
   */
  public isAtomInPlay( atom: any ): boolean { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.getMolecule( atom ) !== null;
  }

  /**
   * Return the molecule of a given atom. This can return a molecule with only one atom and zero bonds (single atom).
   * @param atom - The atom to find a molecule for
   */
  public getMolecule( atom: any ): Molecule | null { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
   * @param molecule - The molecule to break
   */
  public breakMolecule( molecule: Molecule ): void {
    const createdMolecules = [];
    this.removeMolecule( molecule );
    molecule.atoms.forEach( ( atom: any ) => { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245

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
   * @param a - Atom A
   * @param b - Atom B
   */
  public breakBond( a: any, b: any ): void { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245

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
   * @param a - Atom A
   * @param b - Atom B
   */
  public getBondDirection( a: any, b: any ): any { // @ts-expect-error - TODO: Fix when Atom2 and Direction are converted, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.lewisDotModel.getBondDirection( a, b );
  }

  /**
   * Checks if all of the buckets in the kit are filled.
   */
  public allBucketsFilled(): boolean {
    let allBucketsFilled = true;
    this.buckets.forEach( ( bucket: any ) => { // @ts-expect-error - TODO: Fix when Bucket is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      if ( !bucket.isFull() ) {
        allBucketsFilled = false;
      }
    } );
    return allBucketsFilled;
  }

  /**
   * Add a molecule to this kit
   * @param molecule - The molecule to add
   */
  public addMolecule( molecule: Molecule ): void {
    this.molecules.push( molecule );
    this.addedMoleculeEmitter.emit( molecule );
  }

  /**
   * Remove a molecule from this kit
   * @param molecule - The molecule to remove
   */
  public removeMolecule( molecule: Molecule ): void {
    arrayRemove( this.molecules, molecule );
    this.removedMoleculeEmitter.emit( molecule );
  }

  /**
   * Takes an atom that was in a bucket and hooks it up within our structural model. It allocates a molecule for the
   * atom, and then attempts to bond with it.
   * @param atom - The atom to add to play
   */
  public addAtomToPlay( atom: any ): void { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245

    // add the atoms to our models
    const molecule = new Molecule();
    molecule.addAtom( atom );

    this.addMolecule( molecule );

    // attempt to bond
    this.attemptToBondMolecule( molecule );
  }

  /**
   * Returns whether or not the atom is contained in any of this kit's buckets
   * @param atom - The atom to check
   */
  private isContainedInBucket( atom: any ): boolean { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.buckets.some( ( bucket: any ) => { // @ts-expect-error - TODO: Fix when Bucket is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      return bucket.containsParticle( atom );
    } );
  }

  /**
   * Takes an atom, invalidates the structural bonds it may have, and puts it in the correct bucket
   * @param atom - The atom to recycle
   * @param animate - Whether we should display animation
   */
  private recycleAtomIntoBuckets( atom: any, animate: boolean ): void { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
   * @param molecule - The molecule to recycle
   */
  private recycleMoleculeIntoBuckets( molecule: Molecule ): void {
    molecule.atoms.forEach( ( atom: any ) => { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
      this.recycleAtomIntoBuckets( atom, true );
    } );
    this.removeMolecule( molecule );
  }

  /**
   * Add padding to the molecule bounds.
   * @param bounds - The bounds to pad
   */
  private padMoleculeBounds( bounds: any ): any { // @ts-expect-error - TODO: Fix when Bounds2 is available, see https://github.com/phetsims/build-a-molecule/issues/245
    const halfPadding = Kit.interMoleculePadding / 2;
    return Bounds2.rect( bounds.x - halfPadding, bounds.y - halfPadding, bounds.width + Kit.interMoleculePadding, bounds.height + Kit.interMoleculePadding );
  }

  /**
   * Update atom destinations so that separate molecules will be separated visually
   */
  private separateMoleculeDestinations(): void {
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
   * @param a - Atom A
   * @param dirAtoB - The direction from A that the bond will go in (for lewis-dot structure)
   * @param b - Atom B
   */
  private bond( a: any, dirAtoB: any, b: any ): void { // @ts-expect-error - TODO: Fix when Atom2 and Direction are converted, see https://github.com/phetsims/build-a-molecule/issues/245
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
      structure.bonds.forEach( ( bond: any ) => { // @ts-expect-error - TODO: Fix when Bond is converted, see https://github.com/phetsims/build-a-molecule/issues/245
        if ( bond.a.hasSameElement( bond.b ) && bond.a.symbol === 'H' ) {
          console.log( 'WARNING: Hydrogen bonded to another hydrogen in a molecule which is not diatomic hydrogen' );
        }
      } );
    }
  }

  /**
   * @param a - Atom A
   * @param b - Atom B
   */
  private getPossibleMoleculeStructureFromBond( a: any, b: any ): MoleculeStructure { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    const molA = this.getMolecule( a );
    const molB = this.getMolecule( b );
    assert && assert( molA !== molB );

    return MoleculeStructure.getCombinedMoleculeFromBond( molA, molB, a, b, new Molecule() );
  }

  /**
   * Attempt to bond a molecule to another molecule based on the open bonding options
   * @param molecule - A molecule that should attempt to bind to other molecules
   */
  private attemptToBondMolecule( molecule: Molecule ): boolean {
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
   * @param a - Atom A
   * @param b - Atom B
   */
  private canBond( a: any, b: any ): boolean { // @ts-expect-error - TODO: Fix when Atom2 is converted, see https://github.com/phetsims/build-a-molecule/issues/245
    return this.getMolecule( b ) !== null &&
           this.getMolecule( a ) !== this.getMolecule( b ) &&
           this.isAllowedStructure( this.getPossibleMoleculeStructureFromBond( a, b ) ) &&
           this.collectionLayout.availablePlayAreaBounds.containsPoint( a.positionProperty.value ) &&
           this.collectionLayout.availablePlayAreaBounds.containsPoint( b.positionProperty.value );
  }

  /**
   * Checks if the molecule structure is found within our molecule data
   * @param moleculeStructure - The molecule structure to check
   */
  private isAllowedStructure( moleculeStructure: MoleculeStructure ): boolean {
    return moleculeStructure.atoms.length < 2 ||
           MoleculeList.getMainInstance().isAllowedStructure( moleculeStructure );
  }
}

// A bond option from A to B. B would be moved to the position near A to bond.
class BondingOption {

  public readonly a: any; // @ts-expect-error - Atom2 - the first atom in the bond
  public readonly direction: any; // @ts-expect-error - Direction - the direction of the bond from atom a
  public readonly b: any; // @ts-expect-error - Atom2 - the second atom in the bond
  private readonly idealPosition: any; // @ts-expect-error - Vector2 - The position the atom should be placed

  /**
   * @param a - Atom A
   * @param direction - The direction
   * @param b - Atom B
   */
  public constructor( a: any, direction: any, b: any ) { // @ts-expect-error - TODO: Fix when Atom2 and Direction are converted, see https://github.com/phetsims/build-a-molecule/issues/245
    this.a = a;
    this.direction = direction;
    this.b = b;
    this.idealPosition = a.positionProperty.value.plus( direction.vector.times( a.covalentRadius + b.covalentRadius ) );
  }
}

// Static properties for Kit
Kit.BondingOption = BondingOption; // Available bonding option
Kit.bondDistanceThreshold = 100; // Determines how close a molecule needs to be to attempt to bond
Kit.bucketPadding = 50; // Distance between each bucket
Kit.interMoleculePadding = 100; // Determines how far away to separate the molecules from each other

buildAMolecule.register( 'Kit', Kit );
export default Kit;