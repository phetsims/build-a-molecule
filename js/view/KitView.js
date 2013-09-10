// Copyright 2002-2013, University of Colorado

/**
 * Shows a kit (series of buckets full of different types of atoms)
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var assert = require( 'ASSERT/assert' )( 'build-a-molecule' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var Node = require( 'SCENERY/nodes/Node' );
  var AtomNode = require( 'BAM/view/AtomNode' );
  var MoleculeBondContainerNode = require( 'BAM/view/MoleculeBondContainerNode' );
  var MoleculeMetadataNode = require( 'BAM/view/MoleculeMetadataNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  
  var KitView = namespace.KitView = function KitView( kit, view ) {
    var kitView = this;
    
    this.kit = kit;
    this.view = view;
    
    this.metadataMap = {}; // moleculeId => MoleculeMetadataNode
    this.bondMap = {}; // moleculeId => MoleculeBondContainerNode
    this.atomNodeMap = {}; // atom.id => AtomNode
    
    this.topLayer = new Node();
    this.metadataLayer = new Node();
    this.atomLayer = new Node();
    this.bottomLayer = new Node();
    
    _.each( kit.buckets, function( bucket ) {
      var bucketFront = new BucketFront( bucket, Constants.modelViewTransform );
      var bucketHole = new BucketHole( bucket, Constants.modelViewTransform );

      kitView.topLayer.addChild( bucketFront );
      kitView.bottomLayer.addChild( bucketHole );
      
      _.each( bucket.atoms, function( atom ) {
        var atomNode = new AtomNode( atom );
        kitView.atomNodeMap[atom.id] = atomNode;
        kitView.atomLayer.addChild( atomNode );
        
        // Add a drag listener that will move the model element when the user
        // drags this atom.
        atomNode.addInputListener( new SimpleDragHandler( {
          start: function( evt, trail ) {
            atom.userControlled = true;
            
            var molecule = kit.getMolecule( atom );
            if ( molecule ) {
              _.each( molecule.atoms, function( moleculeAtom ) {
                kitView.atomNodeMap[atom.id].moveToFront();
              } );
            } else {
              atomNode.moveToFront();
            }
          },
          
          end: function( evt, trail ) {
            atom.userControlled = false;
          },
          
          translate: function( data ) {
            var modelDelta = Constants.modelViewTransform.viewToModelDelta( data.delta );
            kit.atomDragged( atom, modelDelta );
          }
        } ) );
      } );
    } );
    
    // handle molecule creation and destruction
    kit.on( 'addedMolecule', function( molecule ) {
      var moleculeMetadataNode = new MoleculeMetadataNode( kit, molecule );
      kitView.metadataLayer.addChild( moleculeMetadataNode );
      kitView.metadataMap[molecule.moleculeId] = moleculeMetadataNode;

      if ( Constants.allowBondBreaking ) {
        kitView.addMoleculeBondNodes( molecule );
      }
    } );
    kit.on( 'removedMolecule', function( molecule ) {
      var moleculeMetadataNode = kitView.metadataMap[molecule.moleculeId];
      moleculeMetadataNode.destruct();
      kitView.metadataLayer.removeChild( moleculeMetadataNode );
      delete kitView.metadataMap[molecule.moleculeId];

      if ( Constants.allowBondBreaking ) {
        kitView.removeMoleculeBondNodes( molecule );
      }
    } );
    
    assert && assert( kit.molecules.length === 0 );
    // BuildAMoleculeApplication.allowBondBreaking.addObserver( new SimpleObserver() {
    //     public void update() {
    //         if ( BuildAMoleculeApplication.allowBondBreaking.get() ) {
    //             // enabled, so add in bond nodes
    //             for ( Molecule molecule : metadataMap.keySet() ) {
    //                 addMoleculeBondNodes( molecule );
    //             }
    //         }
    //         else {
    //             // disabled, so remove bond nodes
    //             for ( Molecule molecule : bondMap.keySet() ) {
    //                 removeMoleculeBondNodes( molecule );
    //             }
    //         }
    //     }
    // } );

    // update visibility based on the kit visibility
    kit.visibleProperty.link( function( visible ) {
      kitView.topLayer.visible = visible;
      kitView.metadataLayer.visible = visible;
      kitView.atomLayer.visible = visible;
      kitView.bottomLayer.visible = visible;
    } );
  };
  
  KitView.prototype = {
    constructor: KitView, 
    
    addMoleculeBondNodes: function( molecule ) {
      var moleculeBondContainerNode = new MoleculeBondContainerNode( this.kit, molecule, this.view );
      this.metadataLayer.addChild( moleculeBondContainerNode );
      this.bondMap[molecule.moleculeId] = moleculeBondContainerNode;
    },

    removeMoleculeBondNodes: function( molecule ) {
      var moleculeBondContainerNode = this.bondMap[molecule.moleculeId];
      moleculeBondContainerNode.destruct();
      this.metadataLayer.removeChild( moleculeBondContainerNode );
      delete this.bondMap[molecule.moleculeId];
    }
  };
  
  return KitView;
} );
