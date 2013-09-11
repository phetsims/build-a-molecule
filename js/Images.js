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
      
      // png files (for non-IE cursors)
      'scissors.png',
      'scissors-closed.png',
      'scissors-up.png',
      'scissors-closed-up.png',
      
      /* Notes on .cur files:
icotool -c -o scissors.cur -X 11 -Y 10 scissors.png
icotool -c -o scissors-closed.cur -X 13 -Y 7 scissors-closed.png
icotool -c -o scissors-up.cur -X 10 -Y 11 scissors-up.png
icotool -c -o scissors-closed-up.cur -X 7 -Y 13 scissors-closed-up.png

icotool -c -o scissors.cur scissors.png
icotool -c -o scissors-closed.cur scissors-closed.png
icotool -c -o scissors-up.cur scissors-up.png
icotool -c -o scissors-closed-up.cur scissors-closed-up.png

icotool --hotspot-x=11 --hotspot-y=10 -c -o scissors.cur scissors.png
icotool --hotspot-x=13 --hotspot-y=7 -c -o scissors-closed.cur scissors-closed.png
icotool --hotspot-x=10 --hotspot-y=11 -c -o scissors-up.cur scissors-up.png
icotool --hotspot-x=7 --hotspot-y=13 -c -o scissors-closed-up.cur scissors-closed-up.png

icotool -c -o scissors.ico scissors.png
icotool -c -o scissors-closed.ico scissors-closed.png
icotool -c -o scissors-up.ico scissors-up.png
icotool -c -o scissors-closed-up.ico scissors-closed-up.png
      */
      
      // cursor files (for Internet Explorer)
      'scissors.cur',
      'scissors-closed.cur',
      'scissors-up.cur',
      'scissors-closed-up.cur'
    ]
  };
} );
