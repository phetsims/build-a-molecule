// Copyright 2002-2013, University of Colorado

// mostly used for debugging purposes
define( function( require ) {
  'use strict';
  
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  
  return {
    scenery: require( 'SCENERY/main' ),
    kite: require( 'KITE/main' ),
    dot: require( 'DOT/main' ),
    core: require( 'PHET_CORE/main' ),
    
    Bucket: require( 'PHETCOMMON/model/Bucket' ),
    BucketFront: require( 'SCENERY_PHET/bucket/BucketFront' ),
    BucketHole: require( 'SCENERY_PHET/bucket/BucketHole' ),
    NextPreviousNavigationNode: require( 'SCENERY_PHET/NextPreviousNavigationNode' ),
    Element: require( 'NITROGLYCERIN/Element' ),
    Atom: require( 'NITROGLYCERIN/Atom' ),
    
    Property: Property,
    PropertySet: PropertySet,
    
    soundEnabled: new Property( false ),
    
    timeTick: new PropertySet( {} )
  };
} );
