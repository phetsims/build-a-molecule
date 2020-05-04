// Copyright 2013-2020, University of Colorado Boulder

/**
 * Supertype for modules in Build a Molecule. Handles code required for all modules (bounds and the ability to switch models)
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Screen from '../../../../joist/js/Screen.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import merge from '../../../../phet-core/js/merge.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import BAMBucket from '../model/BAMBucket.js';
import CollectionBox from '../model/CollectionBox.js';
import Kit from '../model/Kit.js';
import KitCollection from '../model/KitCollection.js';
import MoleculeList from '../model/MoleculeList.js';

class BAMScreen extends Screen {
  /**
   * @param {function} createModel
   * @param {function} createView
   * @param {Object} [options]
   */
  constructor( createModel, createView, options ) {
    options = merge( {
      backgroundColorProperty: new Property( BAMConstants.PLAY_AREA_BACKGROUND_COLOR )
    }, options );

    //REVIEW: The main model object for simulations is normally named with <ScreenName>Model or <Sim>Model, something
    //REVIEW: representative for various subtypes. This KitCollectionList SEEMS to be acting in this capacity,
    //REVIEW: so it should presumably be renamed BAMModel?
    //REVIEW: Also, the main model gets stepped, so we don't need to create a stepEmitter here and have this
    //REVIEW: complicated forwarding with all the callbacks being passed in here.
    //REVIEW: Create the Emitter in BAMModel(e.g. KitCollectionList). Subtype it for MultipleModel, PlaygroundModel
    //REVIEW: and SingleModel. In those subtypes, do the actual model creation that you have now in the
    //REVIEW: Screen types (but now they'll have access to the collectionLayout, stepEmitter, etc.) We won't need
    //REVIEW: access to the BAMScreen or callbacks to create the models now, they should be fairly self-contained,
    //REVIEW: e.g. new PlaygroundModel() should be able to create the model.
    //REVIEW: THEN, you can have the Screen essentially be:
    //REVIEW: () => new PlaygroundModel(), model => new SomeScreenView( model ) without callbacks.

    super( createModel, createView, options );
  }

  /**
   * Select a random molecule from the data set of possible collection box molecules
   * @param {Array.<Molecules>}molecules
   *
   * @private
   * @returns {CompleteMolecule}
   */
  pickRandomMoleculeNotIn( molecules ) {
    // Infinite loop. We're living on the edge now, baby!
    while ( true ) { // eslint-disable-line no-constant-condition
      const molecule = MoleculeList.collectionBoxMolecules[
        phet.joist.random.nextIntBetween( 0, MoleculeList.collectionBoxMolecules.length - 1 )
        ];
      if ( !_.includes( molecules, molecule ) ) {
        return molecule;
      }
    }
  }

  /**
   * Generate a group of collection boxes and kits such that the boxes can be filled.
   * @param {boolean} allowMultipleMolecules Whether collection boxes can have more than 1 molecule
   * @param {number} numBoxes               Number of collection boxes
   * @param {Emitter} stepEmitter
   * @param {CollectionLayout} collectionLayout
   *
   * @public
   * @returns {KitCollection} A consistent kitCollection
   */
  generateKitCollection( allowMultipleMolecules, numBoxes, stepEmitter, collectionLayout ) {
    const maxInBox = 3;

    const usedMolecules = []; // [CompleteMolecule]
    const kits = [];
    const boxes = [];
    let molecules = []; // store all the molecules that will need to be created

    let molecule; // used twice in two different loops :(

    for ( let i = 0; i < numBoxes; i++ ) {
      molecule = this.pickRandomMoleculeNotIn( usedMolecules );
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
        molecules.push( molecule.copy() );
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
      molecules.forEach( moleculeStructure => {
        if ( moleculeStructure.getHillSystemFormulaFragment() === molecule.getHillSystemFormulaFragment() ) {
          equivalentMoleculesRemaining++;
        }
      } );

      const ableToIncreaseMultiple = allowMultipleMolecules && equivalentMoleculesRemaining > 1;
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
        const bucketWidth = BAMBucket.calculateIdealBucketWidth( element.covalentRadius, atomCount );

        buckets.push( new BAMBucket( new Dimension2( bucketWidth, 200 ), stepEmitter, element, atomCount ) );
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
  }

}


buildAMolecule.register( 'BAMScreen', BAMScreen );
export default BAMScreen;