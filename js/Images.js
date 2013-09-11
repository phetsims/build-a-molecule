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
      
      /* Notes on .cur file generation, all from the images directory, with "sudo apt-get install icoutils" for icotool:
icotool -c -o scissors.ico scissors.png
icotool -c -o scissors-closed.ico scissors-closed.png
icotool -c -o scissors-up.ico scissors-up.png
icotool -c -o scissors-closed-up.ico scissors-closed-up.png

./ico2cur.py scissors.ico -x 11 -y 10
./ico2cur.py scissors-closed.ico -x 13 -y 7
./ico2cur.py scissors-up.ico -x 10 -y 11
./ico2cur.py scissors-closed-up.ico -x 7 -y 13
      */
      
      // cursor files (for Internet Explorer)
      'scissors.cur',
      'scissors-closed.cur',
      'scissors-up.cur',
      'scissors-closed-up.cur'
    ]
  };
} );
