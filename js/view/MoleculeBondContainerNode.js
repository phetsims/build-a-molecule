// Copyright 2013-2017, University of Colorado Boulder

/**
 * Contains "bond breaking" nodes for a single molecule, so they can be cut apart with scissors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var buildAMolecule = require( 'BUILD_A_MOLECULE/buildAMolecule' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeBondNode = require( 'BUILD_A_MOLECULE/view/MoleculeBondNode' );
  var Node = require( 'SCENERY/nodes/Node' );

  function MoleculeBondContainerNode( kit, molecule, view ) {
    Node.call( this, {} );
    var self = this;

    this.bondNodes = [];

    //REVIEW: Could do this.bondNodes = molecule.bonds.map( ... )
    molecule.bonds.forEach( function( bond ) {
      var node = new MoleculeBondNode( bond, kit, view );
      self.addChild( node );
      self.bondNodes.push( node );
    } );
  }
  buildAMolecule.register( 'MoleculeBondContainerNode', MoleculeBondContainerNode );

  inherit( Node, MoleculeBondContainerNode, {
    /**
     * @override
     */
    dispose: function() {
      this.bondNodes.forEach( function( bondNode ) {
        bondNode.dispose();
      } );
      Node.prototype.dispose.call( this );
    }
  } );

  return MoleculeBondContainerNode;
} );
