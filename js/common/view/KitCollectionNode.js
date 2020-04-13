// Copyright 2020, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import KitNode from './KitNode.js';
import KitPanel from './KitPanel.js';

class KitCollectionNode extends Node {
  /**
   * @param {KitCollection} collection
   * @param {MoleculeCollectingScreenView} view
   * @param {boolean} isCollectingView
   * @constructor
   */
  constructor( collection, view, isCollectingView ) {
    super();
    this.kitPanel = new KitPanel( collection, BAMConstants.KIT_VIEW_WIDTH, BAMConstants.KIT_VIEW_HEIGHT, view, isCollectingView );
    this.kitPanel.bottom = BAMConstants.STAGE_SIZE.bottom - BAMConstants.VIEW_PADDING;
    this.kitPanel.left = BAMConstants.STAGE_SIZE.left + BAMConstants.VIEW_PADDING;
    this.addChild( this.kitPanel );

    // Maps kit ID => KitNode
    const kitMap = [];
    collection.kits.forEach( kit => {
      kitMap[ kit.id ] = new KitNode( kit, view );
    } );
  }
}

buildAMolecule.register( 'KitCollectionNode', KitCollectionNode );
export default KitCollectionNode;