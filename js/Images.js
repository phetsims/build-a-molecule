// Copyright 2002-2013, University of Colorado Boulder

/**
 * Module that defines the image names and gets a getImage method once they are loaded.  See SimLauncher.
 * Makes it possible to load through the module system rather than passed as parameter everywhere or used as global.
 */
define( function() {
  'use strict';

  return {
    imageNames: [
      'split-blue.png',
      'green-left.png',
      'green-right.png',
      'green-middle.png',
      'scissors.png',
      'scissors-closed.png'
    ]
  };
} );
