// Copyright 2002-2013, University of Colorado

// mostly used for debugging purposes
define( function( require ) {
  'use strict';
  
  return {
    scenery: require( 'SCENERY/main' ),
    kite: require( 'KITE/main' ),
    dot: require( 'DOT/main' ),
    core: require( 'PHET_CORE/main' ),
    assert: require( 'ASSERT/assert' ),
    
    Bucket: require( 'PHETCOMMON/model/Bucket' ),
    BucketFront: require( 'SCENERY_PHET/bucket/BucketFront' ),
    BucketHole: require( 'SCENERY_PHET/bucket/BucketHole' ),
    Element: require( 'NITROGLYCERIN/Element' ),
    Atom: require( 'NITROGLYCERIN/Atom' ),
    
    Atom2: require( 'model/Atom2' ),
    AtomNode: require( 'view/AtomNode' ),
    Bond: require( 'model/Bond' ),
    Strings: require( 'Strings' ),
    Constants: require( 'Constants' )
  };
} );
