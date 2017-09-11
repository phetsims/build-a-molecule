// Copyright 2013-2015, University of Colorado Boulder

/*
 * Screen for 2nd tab. Collection boxes take multiple molecules of the same type, and start off with a different kit collection each time
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var BAMScreen = require( 'BUILD_A_MOLECULE/screens/BAMScreen' );
  var Bucket = require( 'BUILD_A_MOLECULE/model/Bucket' );
  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var CollectionBox = require( 'BUILD_A_MOLECULE/model/CollectionBox' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Kit = require( 'BUILD_A_MOLECULE/model/Kit' );
  var KitCollection = require( 'BUILD_A_MOLECULE/model/KitCollection' );
  var LayoutBounds = require( 'BUILD_A_MOLECULE/model/LayoutBounds' );
  var MoleculeCollectingView = require( 'BUILD_A_MOLECULE/view/MoleculeCollectingView' );
  var MoleculeList = require( 'BUILD_A_MOLECULE/model/MoleculeList' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var titleCollectMultipleString = require( 'string!BUILD_A_MOLECULE/title.collectMultiple' );

  function CollectMultipleScreen( collectionAreaWidth ) {

    var options = {
      name: titleCollectMultipleString,
      homeScreenIcon: new Rectangle( 0, 0, 548, 373, { fill: 'green' } )
    };

    BAMScreen.call( this,

      // createInitialKitCollection
      function( bounds, clock ) {
        var kitCollection = new KitCollection();
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 400, 200 ), clock, Element.H, 2 ),
          new Bucket( new Dimension2( 450, 200 ), clock, Element.O, 2 )
        ] ) );

        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 500, 200 ), clock, Element.C, 2 ),
          new Bucket( new Dimension2( 600, 200 ), clock, Element.O, 4 ),
          new Bucket( new Dimension2( 500, 200 ), clock, Element.N, 2 )
        ] ) );
        kitCollection.addKit( new Kit( bounds, [
          new Bucket( new Dimension2( 600, 200 ), clock, Element.H, 12 ),
          new Bucket( new Dimension2( 600, 200 ), clock, Element.O, 4 ),
          new Bucket( new Dimension2( 500, 200 ), clock, Element.N, 2 )
        ] ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.CO2, 2 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.O2, 2 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.H2, 4 ) );
        kitCollection.addCollectionBox( new CollectionBox( MoleculeList.NH3, 2 ) );
        return kitCollection;
      },

      // layoutBounds
      new LayoutBounds( false, collectionAreaWidth ), function( bounds, clock ) {
        return BAMScreen.generateKitCollection( true, 4, clock, bounds );
      },

      // createKitCollection
      function( model ) {
        // create the view
        return new MoleculeCollectingView( model, false, function() {
          // next collection callback
          model.addCollection( BAMScreen.generateKitCollection( true, 4, model.clock, model.layoutBounds ) );
        } );
      },

      options );
  }

  buildAMolecule.register( 'CollectMultipleScreen', CollectMultipleScreen );

  inherit( BAMScreen, CollectMultipleScreen );

  return CollectMultipleScreen;
} );
