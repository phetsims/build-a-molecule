/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';

const image = new Image();
const unlock = simLauncher.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAPCAYAAAD6Ud/mAAAAAXNSR0IArs4c6QAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sFAwQbKhv8zEIAAAMxSURBVDjLrZRPTFx1EMc/83tvFxa2wC7sQkLQhWBJ0YQo0W40amjag3+aas8mbeLFkxeJ8WJ8JtpGbcAGhZhgFXvQgIniQY3EoEaMVKy11KCGllLoLrDsYmFdWPbtGw+0Bk28SCf5niaZme/MfL+iqvSIHK6Gp6qgCSisQmYRPluB1x3VLDchpA+OxOFkGCqvAUXAdz05CVPz8ESn6tmdNrKr4GgNVH4LFxah24O1ANwbhUfbYE8pfOiI3OOoLu+o0xCMzIH2wylV5QZegF3vwbnfQN+Cge25/wM5BU93wKtZyI7Dm3NwzFHNA/SKfLIfDo7Daga+WoDCbDDQlYzf+f3oyJi3feCOA/eV2ba9Z/fulvtDlRVtkUg0ur6e801N/frcwDsfnBVV5bTIRw/CwwK+Gbi4DEkDpY3QXg4mAbRcv993tdWbS87zqaV0quh5BVMRrHCrwxGvoeGWQOOtTeGKisoSn68E1a053h86fXF4+OMOUVUcEWmEF+vhcPNWTVuBLGxOQKoSsu3Q7JaWWD92v8Lehw4RDAaxLJtCoYDrulvrEfkHLMtgWRYnul7+QVT1b/qOSKgOXgpAO2DmoX8JfmmCzipoTULz0SuzJucWsIyNiGCMwbZtfD4fIpDL/cnycoor8zNcy67pYjKxMX1peu0GI38rvBGD/Q0Qs0EAViC/CT4LjAVMQz6eTpeAsr6xQSq14CWSV8XzPHFdF7/fT004SjhcQ3l5OSKC624WXus61mM7ImV3wZcPiOzNqhbH4edNyBooi0NbGcgGaAYy58F3YaDv05V0emZ2bv6bZOLq5eCuYG0s1rgvFArdFqmujqYzqWhry+01pQF/qOgWtae3a+T85GSnfQf07DMm/rvnXT4DJxagz1H1HBGzBmOPicRHVT+fgCdPqib+QyVfbPs+AWK1dbV3G2P8yURycHRkTJmAiVWRYj90/ktHsa/h0hIU34Vnd6ojuwCWLWIiqo/3iiznYa0KDj0CBxqh7gz8NAPdOza7ITi+YkwuZ4xmRHQRNC2iC+ANw/hxqN8pG1VFVJVBkWfq4WA5RDYgn4E/FmFwFt52VAs3w73/At0y8YFiIRe9AAAAAElFTkSuQmCC';
export default image;