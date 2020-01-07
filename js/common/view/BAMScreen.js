// Copyright 2013-2020, University of Colorado Boulder

/*
 * Supertype for modules in Build a Molecule. Handles code required for all modules (bounds, canvas handling, and the ability to switch models)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BAMConstants = require( 'BUILD_A_MOLECULE/common/BAMConstants' );
  const Bucket = require( 'BUILD_A_MOLECULE/common/model/Bucket' );
  const buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  const CollectionBox = require( 'BUILD_A_MOLECULE/common/model/CollectionBox' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Element = require( 'NITROGLYCERIN/Element' );
  const Emitter = require( 'AXON/Emitter' );
  const Kit = require( 'BUILD_A_MOLECULE/common/model/Kit' );
  const KitCollection = require( 'BUILD_A_MOLECULE/common/model/KitCollection' );
  const KitCollectionList = require( 'BUILD_A_MOLECULE/common/model/KitCollectionList' );
  const merge = require( 'PHET_CORE/merge' );
  const MoleculeList = require( 'BUILD_A_MOLECULE/common/model/MoleculeList' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  class BAMScreen extends Screen {
    /**
     * @param {Function} createInitialKitCollection
     * @param {CollectionLayout} collectionLayout
     * @param {Function} createKitCollection
     * @param {Function} createView
     * @param {Object} options
     */
    constructor( createInitialKitCollection, collectionLayout, createKitCollection, createView, options ) {
      options = merge( {
        backgroundColorProperty: new Property( BAMConstants.CANVAS_BACKGROUND_COLOR )
      }, options );
      const stepEmitter = new Emitter( { parameters: [ { valueType: 'number' } ] } ); // emits 1 parameter, timeElapsed

      super( () => {
          return new KitCollectionList( createInitialKitCollection( collectionLayout, stepEmitter ), collectionLayout, stepEmitter, createKitCollection );
        },
        createView, options );
    }
  }

  /**
   * Generate a group of collection boxes and kits such that the boxes can be filled.
   *
   * @param {boolean} allowMultipleMolecules Whether collection boxes can have more than 1 molecule
   * @param {number} numBoxes               Number of collection boxes
   * @param {Emitter} stepEmitter
   * @param {CollectionLayout} collectionLayout
   *
   * @returns {KitCollection} A consistent kitCollection
   */
  BAMScreen.generateKitCollection = ( allowMultipleMolecules, numBoxes, stepEmitter, collectionLayout ) => {
    const maxInBox = 3;

    const usedMolecules = []; // [CompleteMolecule]
    const kits = [];
    const boxes = [];
    let molecules = []; // store all the molecules that will need to be created

    let molecule; // used twice in two different loops :(

    for ( let i = 0; i < numBoxes; i++ ) {
      molecule = BAMScreen.pickRandomMoleculeNotIn( usedMolecules );
      usedMolecules.push( molecule );

      let numberInBox = allowMultipleMolecules ? phet.joist.random.nextIntBetween( 1, maxInBox ) : 1;

      // restrict the number of carbon that we can have
      const carbonCount = molecule.getHistogram().getQuantity( Element.C );
      if ( carbonCount > 1 ) {
        numberInBox = Math.min( 2, numberInBox );
      }

      const box = new CollectionBox( molecule, numberInBox );
      boxes.push( box );

      // add in that many molecules
      for ( let j = 0; j < box.capacity; j++ ) {
        molecules.push( molecule.getAtomCopy() );
      }
    }

    // randomize the molecules that we will pull from
    molecules = phet.joist.random.shuffle( molecules );

    // while more molecules to construct are left, create another kit
    while ( molecules.length ) {
      var buckets = [];

      // pull off the 1st molecule
      molecule = molecules[ 0 ];

      // NOTE: for the future, we could potentially add another type of atom?

      var equivalentMoleculesRemaining = 0;
      // TODO: we include the current molecule in this list, maybe that was unintended?
      molecules.forEach( moleculeStructure => {
        if ( moleculeStructure.getHillSystemFormulaFragment() === molecule.getHillSystemFormulaFragment() ) {
          equivalentMoleculesRemaining++;
        }
      } );

      const ableToIncreaseMultiple = allowMultipleMolecules && equivalentMoleculesRemaining > 1;
      // var atomMultiple = 1 + ( ableToIncreaseMultiple ? random.nextInt( equivalentMoleculesRemaining ) : 0 );
      var atomMultiple = 1 + ( ableToIncreaseMultiple ? equivalentMoleculesRemaining : 0 );

      // for each type of atom
      _.uniq( molecule.getElementList() ).forEach( element => {
        // find out how many atoms of this type we need
        let requiredAtomCount = 0;
        molecule.atoms.forEach( atom => {
          if ( atom.element.isSameElement( element ) ) {
            requiredAtomCount++;
          }
        } );

        // create a multiple of the required number of atoms, so they can construct 'atomMultiple' molecules with this
        let atomCount = requiredAtomCount * atomMultiple;

        // possibly add more, if we can only have 1 molecule per box
        if ( !element.isCarbon() && ( element.isHydrogen() || atomCount < 4 ) ) {
          atomCount += phet.joist.random.nextIntBetween( 0, 1 );
        }

        // funky math part. sqrt scales it so that we can get two layers of atoms if the atom count is above 2
        const bucketWidth = Bucket.calculateIdealBucketWidth( element.covalentRadius, atomCount );

        buckets.push( new Bucket( new Dimension2( bucketWidth, 200 ), stepEmitter, element, atomCount ) );
      } );

      // add the kit
      kits.push( new Kit( collectionLayout, buckets ) );

      // remove our 1 main molecule
      molecules.shift();
      atomMultiple -= 1;

      // NOTE: for the future, we could sort through and find out if we can construct another whole atom within our larger margins

      // if we can remove others (due to an atom multiple), remove the others
      while ( atomMultiple > 0 ) {
        for ( let k = 0; k < molecules.length; k++ ) {
          if ( molecules[ k ].getHillSystemFormulaFragment() === molecule.getHillSystemFormulaFragment() ) {
            molecules.splice( k, 1 );
            break;
          }
        }
        atomMultiple -= 1;
      }
    }

    const collection = new KitCollection();
    kits.forEach( collection.addKit.bind( collection ) );
    boxes.forEach( collection.addCollectionBox.bind( collection ) );
    return collection;
  };


  // from array of CompleteMolecule, returns {CompleteMolecule}
  BAMScreen.pickRandomMoleculeNotIn = molecules => {
    // Infinite loop. We're living on the edge now, baby!
    while ( true ) { // eslint-disable-line no-constant-condition
      const molecule = MoleculeList.collectionBoxMolecules[ phet.joist.random.nextIntBetween( 0, MoleculeList.collectionBoxMolecules.length - 1 ) ];
      if ( !_.includes( molecules, molecule ) ) {
        return molecule;
      }
    }
  };

  return buildAMolecule.register( 'BAMScreen', BAMScreen );
} );
