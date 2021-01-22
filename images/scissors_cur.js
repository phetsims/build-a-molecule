/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/x-icon;base64,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';
export default image;