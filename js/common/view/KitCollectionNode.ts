// Copyright 2020-2025, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import KitCollection from '../model/KitCollection.js';
import BAMScreenView from './BAMScreenView.js';
import KitNode from './KitNode.js';
import KitPanel from './KitPanel.js';

class KitCollectionNode extends Node {

  public readonly kitPanel: KitPanel;

  /**
   * @param collection - The collection of kits
   * @param view - The screen view
   * @param isCollectingView - Whether this is in collecting mode
   */
  public constructor( collection: KitCollection, view: BAMScreenView, isCollectingView: boolean ) {
    super();

    // Create a kit panel to contain the kit buckets. Height/Width are empirically determined
    this.kitPanel = new KitPanel( collection, 655, 148, view, isCollectingView );
    this.kitPanel.bottom = view.layoutBounds.bottom - BAMConstants.VIEW_PADDING;
    this.kitPanel.left = view.layoutBounds.left + BAMConstants.VIEW_PADDING;
    this.addChild( this.kitPanel );

    // Maps kit ID => KitNode
    const kitMap: KitNode[] = [];
    collection.kits.forEach( kit => {
      kitMap[ kit.id ] = new KitNode( kit, view );
    } );
  }
}

buildAMolecule.register( 'KitCollectionNode', KitCollectionNode );
export default KitCollectionNode;