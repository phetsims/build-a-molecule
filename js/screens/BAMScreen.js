// Copyright 2013-2019, University of Colorado Boulder

/*
 * Supertype for modules in Build a Molecule. Handles code required for all modules (bounds, canvas handling, and the ability to switch models)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var Bucket = require( 'BUILD_A_MOLECULE/model/Bucket' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var KitCollectionList = require( 'BUILD_A_MOLECULE/model/KitCollectionList' );
  var BAMConstants = require( 'BUILD_A_MOLECULE/BAMConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Kit = require( 'BUILD_A_MOLECULE/model/Kit' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );

  /**
   * @param {Function} createInitialKitCollection
   * @param {LayoutBounds} layoutBounds
   * @param {Function} createKitCollection
   * @param {Function} createView
   * @param {Object} options
   * @constructor
   */
  function BAMScreen( createInitialKitCollection, layoutBounds, createKitCollection, createView, options ) {
    options = _.extend( {
      backgroundColorProperty: new Property( BAMConstants.CANVAS_BACKGROUND_COLOR )
    }, options );
    var stepEmitter = new Emitter( { validators: [ { valueType: 'number' } ] } ); // emits 1 parameter, timeElapsed

    Screen.call( this,
      function() {
        return new KitCollectionList( createInitialKitCollection( layoutBounds, stepEmitter ), layoutBounds, stepEmitter, createKitCollection );
      },
      createView, options );
  }

  buildAMolecule.register( 'BAMScreen', BAMScreen );

  /**
   * Generate a group of collection boxes and kits such that the boxes can be filled.
   *
   * @param allowMultipleMolecules Whether collection boxes can have more than 1 molecule
   * @param numBoxes               Number of collection boxes
   * @returns {KitCollection} A consistent kitCollection
   */
  BAMScreen.generateKitCollection = function( allowMultipleMolecules, numBoxes, stepEmitter, layoutBounds ) {
    var maxInBox = 3;

    var usedMolecules = []; // [CompleteMolecule]
    var kits = [];
    var boxes = [];
    var molecules = []; // store all the molecules that will need to be created

    var molecule; // used twice in two different loops :(

    for ( var i = 0; i < numBoxes; i++ ) {
      molecule = BAMScreen.pickRandomMoleculeNotIn( usedMolecules );
      usedMolecules.push( molecule );

      var numberInBox = allowMultipleMolecules ? phet.joist.random.nextIntBetween( 1, maxInBox ) : 1;

      // restrict the number of carbon that we can have
      var carbonCount = molecule.getHistogram().getQuantity( Element.C );
      if ( carbonCount > 1 ) {
        numberInBox = Math.min( 2, numberInBox );
      }

      var box = new CollectionBox( molecule, numberInBox );
      boxes.push( box );

      // add in that many molecules
      for ( var j = 0; j < box.capacity; j++ ) {
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
      molecules.forEach( function( moleculeStructure ) {
        if ( moleculeStructure.getHillSystemFormulaFragment() === molecule.getHillSystemFormulaFragment() ) {
          equivalentMoleculesRemaining++;
        }
      } );

      var ableToIncreaseMultiple = allowMultipleMolecules && equivalentMoleculesRemaining > 1;
      // var atomMultiple = 1 + ( ableToIncreaseMultiple ? random.nextInt( equivalentMoleculesRemaining ) : 0 );
      var atomMultiple = 1 + ( ableToIncreaseMultiple ? equivalentMoleculesRemaining : 0 );

      // for each type of atom
      _.uniq( molecule.getElementList() ).forEach( function( element ) {
        // find out how many atoms of this type we need
        var requiredAtomCount = 0;
        molecule.atoms.forEach( function( atom ) {
          if ( atom.element.isSameElement( element ) ) {
            requiredAtomCount++;
          }
        } );

        // create a multiple of the required number of atoms, so they can construct 'atomMultiple' molecules with this
        var atomCount = requiredAtomCount * atomMultiple;

        // possibly add more, if we can only have 1 molecule per box
        if ( !element.isCarbon() && ( element.isHydrogen() || atomCount < 4 ) ) {
          atomCount += phet.joist.random.nextIntBetween( 0, 1 );
        }

        // funky math part. sqrt scales it so that we can get two layers of atoms if the atom count is above 2
        var bucketWidth = Bucket.calculateIdealBucketWidth( element.covalentRadius, atomCount );

        buckets.push( new Bucket( new Dimension2( bucketWidth, 200 ), stepEmitter, element, atomCount ) );
      } );

      // add the kit
      kits.push( new Kit( layoutBounds, buckets ) );

      // remove our 1 main molecule
      molecules.shift();
      atomMultiple -= 1;

      // NOTE: for the future, we could sort through and find out if we can construct another whole atom within our larger margins

      // if we can remove others (due to an atom multiple), remove the others
      while ( atomMultiple > 0 ) {
        for ( var k = 0; k < molecules.length; k++ ) {
          if ( molecules[ k ].getHillSystemFormulaFragment() === molecule.getHillSystemFormulaFragment() ) {
            molecules.splice( k, 1 );
            break;
          }
        }
        atomMultiple -= 1;
      }
    }

    var collection = new KitCollection();
    kits.forEach( collection.addKit.bind( collection ) );
    boxes.forEach( collection.addCollectionBox.bind( collection ) );
    return collection;
  };

  inherit( Screen, BAMScreen, {} );

  // from array of CompleteMolecule, returns {CompleteMolecule}
  BAMScreen.pickRandomMoleculeNotIn = function( molecules ) {
    // Infinite loop. We're living on the edge now, baby!
    while ( true ) { // eslint-disable-line no-constant-condition
      var molecule = MoleculeList.collectionBoxMolecules[ phet.joist.random.nextIntBetween( 0, MoleculeList.collectionBoxMolecules.length - 1 ) ];
      if ( !_.includes( molecules, molecule ) ) {
        return molecule;
      }
    }
  };

  return BAMScreen;
} );
