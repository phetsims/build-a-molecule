/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';

const image = new Image();
const unlock = simLauncher.createLock( image );
image.onload = unlock;
image.src = 'data:image/x-icon;base64,AAACAAEAFBcAAAoACwC0BwAAFgAAACgAAAAUAAAALgAAAAEAIAAAAAAAMAcAAAAAAAAAAAAAAAAAAAAAAAAAAH8JAACgqgAAtdUAALXPAAClqQAAfxcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfxcAAK+pAADK0AAAytYAAK+qAAB/CQAAnKoAAOH+AADe/QAA4P8AAOb/AAC/3gAAl0gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJxIAADM3wEB8f8BAe//AQHy/gMD+P4AAK2qAACr1QAA4P8AAJWpAACLVgAAr9AAAOX/AADB3gAAji0AAAAAAAAAAAAAAAAAAAAAAACSLQAAyeAAAOz/AACtzgAAjlYAAJypAgL1/wAAx9UAALHZAADS/gAAkGEAAAAAAAB/DwAAqcwAAOb/AACnvAAAAAAAAAAAAAAAAAAAAAAAAK28AADr/wAAoMoAAH8PAAAAAAAAlWEBAe/+AADK0wAAoL4AANj/AACgtgAAAAAAAAAAAACLRAAA0vgAAMruAAB/JAAAAAAAAAAAAAB/JAAA2fIAANb2AACJRAAAAAAAAAAAAACrtgIC9P8AALe9AACLTgAAzPgAAMHpAACVZQAAAAAAAH8BAAC13QAA2f8AAI5XAAAAAAAAAAAAAJVXAADn/wAAsdQAAH8BAAAAAAAAl2UAANzuAADl9AAAmU4AAAAAAACXrwAA1P4AAMHtAACVoAAAiWwAAMb7AADW/gAAi1EAAAAAAAAAAAAAi7QAAOT+AADP6wAAi2wAAJmgAADW8AAA6/4AAKutAAAAAAAAAAAAAH8EAACZtAAAzPcAANf/AADT/wAA2/8AALX/AACSsAAAMgIAAIt8AADX+AAA3P4AAOz/AADl/wAA6v8AAOP3AACrsgAAfwQAAAAAAAAAAAAAAAAAAAAAAACSXAAApbkAALXXAACg8gAA3f8AAOT8AACLmwAAueIAANj/AADS9QAAs8gAANDXAAC9ugAApVwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG5BAADN9Rwfu/8CBI7+AADE/gAA4P8AAIu4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3bjyszX/+np6f/Ex+P/DBCL+gAAaiMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOkRAA4SOic3q6+v/19vZ/9/i4f+3vbn6YGplYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABlbmx65+jo++Dg4P/p6en/maCe/+jo6P+OlZLVOkRACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOkRAEKCpp9nn5+f/4+Pj/8THx/rY2dn/4eHh/+nr6/5qc26WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABue3ah7e7u/+Pj4//r7Ov/bHZxs7/EwuTj5OT/5eXl/7G3teVETkojAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASlVRLMTHxufm5ub/5+fn/6Cpp9w6REARbHZxkunr6/7j4+P/6+vr/3F7dr0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7hH+87e7u/+Xl5f/k5eX8Y25qfAAAAAA6REAJlZyZ0ujo6P/l5eX/09bW9FllYFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXGdjW93e3vXo6Oj/6+zs/32Hgs06READAAAAAAAAAABeamVf3d/f9uXl5f/p6en/fYmE0zpEQAYAAAAAAAAAAAAAAAAAAAAAAAAAADpEQAaQmZXM6+vr/+np6f/P1NPyV2BcRwAAAAAAAAAAAAAAAAAAAAB4gn296+zs/+Xl5f/k5eX9Y25qjQAAAAAAAAAAAAAAAAAAAAAAAAAAVWBcXuTm5f7p6en/7O3t/254drcAAAAAAAAAAAAAAAAAAAAAAAAAAEZRTCq9wsHn6Ojo/+jo6P+Ql5XWAAAAAAAAAAAAAAAAAAAAAAAAAABRXFdQ19vb9urq6v+rs6/jQEpGHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGpzcZrp6ur/6erq/4eQjs4AAAAAAAAAAAAAAAAAAAAAAAAAADpEQAF4gn/F5Ofn/mVubJIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOkRADJKcmdXc3t74XmdjbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFFcVztcZWDYOkRACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXmplZmVubMU6REABAAAAAAAAAAAAAAAAh/4XAAP8CAAR+IAAOPHBABzzgwCc85EAhOIZAMBgOADwAPwA/gf/AP4P/wD+D/8A/gf/APwD/wD4A/8A+EH/APDh/wDw8P8A4fB/AOH4fgDj+H4A4/z+APf+/gA=';
export default image;