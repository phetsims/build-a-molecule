// Copyright 2020-2021, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import KitNode from './KitNode.js';
import KitPanel from './KitPanel.js';

class KitCollectionNode extends Node {
  /**
   * @param {KitCollection} collection
   * @param {MoleculeCollectingScreenView} view
   * @param {boolean} isCollectingView
   */
  constructor( collection, view, isCollectingView ) {
    super();

    // @public {KitPanel} Create a kit panel to contain the kit buckets. Height/Widht are empirically determined
    this.kitPanel = new KitPanel( collection, 655, 148, view, isCollectingView );
    this.kitPanel.bottom = view.layoutBounds.bottom - BAMConstants.VIEW_PADDING;
    this.kitPanel.left = view.layoutBounds.left + BAMConstants.VIEW_PADDING;
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