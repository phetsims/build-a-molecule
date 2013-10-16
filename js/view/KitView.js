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
  var Bounds2 = require( 'DOT/Bounds2' );
  var Shape = require( 'KITE/Shape' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Trail = require( 'SCENERY/util/Trail' );
  var AtomNode = require( 'BAM/view/AtomNode' );
  var MoleculeBondContainerNode = require( 'BAM/view/MoleculeBondContainerNode' );
  var MoleculeMetadataNode = require( 'BAM/view/MoleculeMetadataNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' ); // TODO: DragListener
  
  var KitView = namespace.KitView = function KitView( kit, view ) {
    Node.call( this, { layerSplit: true } );
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
    
    // override its hit testing
    atomLayer.trailUnderPoint = function( point, options, recursive, hasListener ) {
      // return accurate hits for the mouse
      if ( options && options.isMouse ) {
        return Node.prototype.trailUnderPoint.call( atomLayer, point, options, recursive, hasListener );
      }
      
      // probably a touch or something we will target
      var modelPoint = Constants.modelViewTransform.viewToModelPosition( point );
      var atom = kitView.closestAtom( modelPoint, 100 );
      if ( atom ) {
        // TODO: this is somewhat hackish. better way of doing this?
        return new Trail( [atomLayer, kitView.atomNodeMap[atom.id]] );
      } else {
        return null;
      }
    };
    // ensure that touches don't get pruned before this point
    atomLayer.touchArea = Shape.bounds( Constants.stageSize.toBounds() );
    
    _.each( kit.buckets, function( bucket ) {
      var bucketFront = new BucketFront( bucket, Constants.modelViewTransform, {
        labelFont: new PhetFont( {
          weight: 'bold',
          size: 18,
          family: 'Arial, sans-serif'
        } ) // matching the old look for now
      } );
      var bucketHole = new BucketHole( bucket, Constants.modelViewTransform );
      bucketHole.touchArea = new Shape().moveTo( bucketHole.left - bucketHole.x, bucketHole.centerY - bucketHole.y )
                                        .lineTo( bucketHole.left - bucketHole.x + 17, bucketHole.centerY + 60 - bucketHole.y )
                                        .lineTo( bucketHole.right - bucketHole.x - 17, bucketHole.centerY + 60 - bucketHole.y )
                                        .lineTo( bucketHole.right - bucketHole.x, bucketHole.centerY - bucketHole.y )
                                        .lineTo( bucketHole.right - bucketHole.x - 35, bucketHole.centerY - 55 - bucketHole.y )
                                        .lineTo( bucketHole.left - bucketHole.x + 35, bucketHole.centerY - 55 - bucketHole.y )
                                        .close();
      // but don't pick the elliptical paths in the hole
      _.each( bucketHole.children, function( child ) { child.pickable = false; } );

      topLayer.addChild( bucketFront );
      bottomLayer.addChild( bucketHole );
      
      _.each( bucket.atoms, function( atom ) {
        var atomNode = new AtomNode( atom, {
          // renderer: 'svg',
          // rendererOptions: { cssTransform: true }
        } );
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
  };
  
  inherit( Node, KitView, {
    closestAtom: function( modelPoint, threshold ) {
      assert && assert( threshold );
      
      var thresholdSquared = threshold * threshold;
      
      var atoms = this.kit.atoms;
      var numAtoms = atoms.length;
      
      var best = null;
      var bestDistanceSquared = thresholdSquared; // limit ourselves at the threshold, and add this to the best distance so we only need one check in the loop
      
      var x = modelPoint.x;
      var y = modelPoint.y;
      
      // ignore stacking order for this operation
      for ( var i = 0; i < numAtoms; i++ ) {
        var atom = atoms[i];
        var position = atom.positionProperty.get(); // no ES5 setters so we have the fastest possible code in this inner loop (called during hit testing)
        
        var dx = x - position.x;
        var dy = y - position.y;
        
        // not really distance, persay, since it can go negative
        var distanceSquared = dx * dx + dy * dy - atom.radius * atom.radius;
        
        if ( distanceSquared > bestDistanceSquared ) {
          continue;
        }
        
        bestDistanceSquared = distanceSquared;
        best = atom;
      }
      
      return best;
    },
    
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
