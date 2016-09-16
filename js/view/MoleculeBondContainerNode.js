// Copyright 2013-2015, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var MoleculeBondNode = require( 'BUILD_A_MOLECULE/view/MoleculeBondNode' );

  function MoleculeBondContainerNode( kit, molecule, view ) {
    Node.call( this, {} );
    var self = this;

    this.bondNodes = [];

    _.each( molecule.bonds, function( bond ) {
      var node = new MoleculeBondNode( bond, kit, view );
      self.addChild( node );
      self.bondNodes.push( node );
    } );
  }
  buildAMolecule.register( 'MoleculeBondContainerNode', MoleculeBondContainerNode );

  inherit( Node, MoleculeBondContainerNode, {
    destruct: function() {
      _.each( this.bondNodes, function( bondNode ) {
        bondNode.destruct();
      } );
    }
  } );

  return MoleculeBondContainerNode;
} );
