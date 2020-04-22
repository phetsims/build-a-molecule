Build a Molecule - Model Notes
================

### Atoms
Atoms are represented by an element, covalent radius, and a color. Atoms in a molecule are bonded based on the lewis dot
model. The bond direction is dependent on the nearest available bond location along with the bond order. Atoms exists
throughout the full lifetime of the sim and are transferred between the bucket, the play area, and collection boxes.

The current set of available atoms include: O, H, C, Cl, N, F, B, Si, P, Br

### Molecules
Molecules are represented by a series of bonds and atoms. The bonds and atoms are organized in a Molecule Structure
that details how the molecule is shaped and arranged. A CompleteMolecule is a molecule whose molecular structure is stable,
with a common name, and may include a 2D and/or 3D representation. The data structure is serialized in StructureData.js 

###Molecule Data
This sim requires a data set with entries for each possible molecule that can be built from the available atoms. The
source of this data set is pulled from PubChem and has been ported from the legacy version of Build-A-Molecule. The data
set is separated into Collection Molecule Data and Other Molecule Data
An entry of this data set can be read as follows:

#####Entry for H20 (Water):
`water|H2O|962|full|3|2|O 2.5369 -0.155 0 0 0|H 3.0739 0.155 0.2774 0.8929 0.2544,0-1|H 2.0 0.155 0.6068 -0.2383 -0.7169,0-1`

#####Formatted as:
`moleculeName|generalFormula|compoundCID|2d3dOrBoth|totalAtoms|totalBonds|{ElementA  x,y,z}|{ElementB x,y,z}|{ElementZ x,y,z}`

 - `Molecule Name`: Common name for the built molecule 
 - `General Formula`:  Formula representation of the molecule
 - `Compound CID`: ID used for identifying molecule in PubChem data set
 - `2d3dOrBoth`: Whether or not this molecule has 2d and/or 3d representations
 - `Total Atoms`: Number of atoms in the molecule
 - `Total Bonds`: Number of bonds in the molecule
 - `ElementX x,y,z` : The x,y,z position of the corresponding element X in the molecule


###3D Representation
The model representation is built on the THREE.js library. It uses the x, y, z vector positions and maps it within a dialog
box. These molecules are rotated independently from the data set model data, as a quaternion value is computed to handle
rotation. The x, y, z vector values are unitless and only represent a position in model space. 

Both Ball and Stick and Space-Filling representations are built from the data set above, but the bonds in the Ball and Stick
model utilize some creative liberties. This approach was taken to visually represent the thickness and length of a bond
in this mode.