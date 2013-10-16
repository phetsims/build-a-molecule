// Copyright 2002-2013, University of Colorado

/**
 * Shows a kit (series of buckets full of different types of atoms)
 *
 * TODO: consider 'KitNode' as a name?
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */

define( function( require ) {
  'use strict';
  
  var inherit = require( 'PHET_CORE/inherit' );
  var namespace = require( 'BAM/namespace' );
  var Constants = require( 'BAM/Constants' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var AtomNode = require( 'BAM/view/AtomNode' );
  var MoleculeBondContainerNode = require( 'BAM/view/MoleculeBondContainerNode' );
  var MoleculeMetadataNode = require( 'BAM/view/MoleculeMetadataNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  
  var KitView = namespace.KitView = function KitView( kit, view ) {
    Node.call( this );
    var kitView = this;
    
    this.kit = kit;
    this.view = view;
    
    this.metadataMap = {}; // moleculeId => MoleculeMetadataNode
    this.bondMap = {}; // moleculeId => MoleculeBondContainerNode
    this.atomNodeMap = {}; // atom.id => AtomNode
    
    var topLayer = this.topLayer = new Node();
    var metadataLayer = this.metadataLayer = new Node();
    var atomLayer = this.atomLayer = new Node();
    var bottomLayer = this.bottomLayer = new Node();
    
    this.addChild( bottomLayer );
    this.addChild( atomLayer );
    this.addChild( metadataLayer );
    this.addChild( topLayer );
    
    _.each( kit.buckets, function( bucket ) {
      var bucketFront = new BucketFront( bucket, Constants.modelViewTransform, {
        labelFont: new PhetFont( {
          weight: 'bold',
          size: 18,
          family: 'Arial, sans-serif'
        } ) // matching the old look for now
      } );
      var bucketHole = new BucketHole( bucket, Constants.modelViewTransform );

      topLayer.addChild( bucketFront );
      bottomLayer.addChild( bucketHole );
      
      _.each( bucket.atoms, function( atom ) {
        var atomNode = new AtomNode( atom );
        kitView.atomNodeMap[atom.id] = atomNode;
        atomLayer.addChild( atomNode );
        
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
      metadataLayer.addChild( moleculeMetadataNode );
      kitView.metadataMap[molecule.moleculeId] = moleculeMetadataNode;

      if ( Constants.allowBondBreaking ) {
        kitView.addMoleculeBondNodes( molecule );
      }
    } );
    kit.on( 'removedMolecule', function( molecule ) {
      var moleculeMetadataNode = kitView.metadataMap[molecule.moleculeId];
      moleculeMetadataNode.destruct();
      metadataLayer.removeChild( moleculeMetadataNode );
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
      kitView.visible = visible;
    } );
  };
  
  inherit( Node, KitView, {
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
  } );
  
  return KitView;
} );
