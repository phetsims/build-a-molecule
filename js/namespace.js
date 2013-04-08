// Copyright 2002-2012, University of Colorado

// mostly used for debugging purposes
define( function( require ) {
  return {
    scenery: require( 'SCENERY/main' ),
    kite: require( 'KITE/main' ),
    dot: require( 'DOT/main' ),
    core: require( 'PHET_CORE/main' ),
    assert: require( 'ASSERT/assert' ),
    
    Bucket: require( 'PHETCOMMON/model/Bucket' ),
    BucketFront: require( 'SCENERY_PHET/bucket/BucketFront' ),
    BucketHole: require( 'SCENERY_PHET/bucket/BucketHole' ),
    Element: require( 'CHEMISTRY/Element' ),
    Atom: require( 'CHEMISTRY/Atom' ),
    Fort: require( 'FORT/Fort' ),
    
    Atom2: require( 'model/Atom2' ),
    AtomNode: require( 'view/AtomNode' ),
    Bond: require( 'model/Bond' ),
    Strings: require( 'Strings' ),
    log: require( 'log' ),
    
    // for temporary benchmarks
    FastAtom2: require( 'model/FastAtom2' ),
    FastBond: require( 'model/FastBond' )
  };
} );
