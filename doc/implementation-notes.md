Build a Molecule - Implementation Notes
================

### Terminology

- Atom: A singular representation of an element.
- Molecule: A representation of one or more atoms that are bonded
- Kit Collection: The whole grouping of kits and collection boxes
- Kit: A grouping of buckets and their atoms. This is housed within the carousel at the bottom of the screen.
- Collection Box: Area that houses a goal molecule. Collection boxes have cues to indicate dropping an atom in the area
and are housed in a Collection Panel
- Goal Molecule: These molecules are the targets for successfully completing a collection. For example, H20 on the first screen
- Collection Panel: Panel that houses all of the collection boxes
- Kit Play Area: Area where users can add molecules to and from. In this area, we can break molecules and bond them. This
is where most of the interaction will occur between building molecules.
- Bucket: Holds the atoms for each kit
- Refill Button: Fills the buckets to their initial state returning all molecules in the kit play area back into their respective buckets.
- Reset Collection Button: Refill the buckets, clears the kit play area, and clears the collection panel.
- 3D Dialog: Dialog box that displays the 3D representation of molecules with 3D data. There are options to toggle between a Space Filling model or Ball and Stick model.

### Fundamentals
This sim's layout is focus around 3 main partitions: The Kit Play Area, The Kit, and if on the 1st and 2nd screen the
Collection Panel. Users are meant to remove an atom from a bucket and place it in the kit play area. From here the atoms
are now recognized as Molecules. Molecules that are placed in the Kit Play Area are stored in maps. When molecules are added
or removed, the Kit Collection checks if any of the molecules are valid Goals and cues the user to place them in a collection
box.

### Kits and Kit Collections
Valid molecules are limited to the available buckets and atoms present in each kit. A user cannot build a molecule using atoms from another kit. Each collection has a limited number of kits. The motivation behind this design is to limit the number of 
possible molecules a user can build from a kit. 

Kits are swapped via the carousel. Depending on the page number of the carousel, the kit's molecules, buckets, and atoms are hidden from the view and restored when the carousel returns back to that Kit's page.

Kit Collections are treated similarly to Kits but contain the collection boxes along with a grouping of Kits. When all
of the Goals in the Collection Boxes have been met, the user is prompted to go to the next Kit Collection. A new Kit Collection is generated with a new set of Kits, Collection Boxes, and Goals. These are randomly generated.

There is no limit to the number of Kit Collections we can generate in the sim's lifetime.

The PlayGround screen only has one Kit Collection with several kits because there is no set of Goals to collect on this screen.
   
### Atoms
Atoms are represented by an element, covalent radius, and a color. Atoms in a molecule are bonded based on the lewis dot
model. The bond direction is dependent on the nearest available bond location along with the bond order. Atoms exists
throughout the full lifetime of the sim and are transferred between the bucket, the play area, and collection boxes.

The current set of available atoms include: O, H, C, Cl, N, F, B, Si, P, Br

### Molecules
Molecules are represented by a series of bonds and atoms. The bonds and atoms are organized in a Molecule Structure
that details how the molecule is shaped and arranged. A CompleteMolecule is a molecule whose molecular structure is stable,
with a common name, and may include a 2D and/or 3D representation. The data structure is serialized in StructureData.js. Additionally molecules that are present in the Molecule Data can be created. While a molecule may be physically possible to build it may not be in our data set and considered invalid. See OtherMoleculeData.js for the full set of valid molecule.

### Molecule Data
This sim requires a data set with entries for each possible molecule that can be built from the available atoms. The
source of this data set is pulled from PubChem and has been ported from the legacy version of Build-A-Molecule. The data
set is separated into Collection Molecule Data and Other Molecule Data
An entry of this data set can be read as follows:

##### Entry for H20 (Water):
`water|H2O|962|full|3|2|O 2.5369 -0.155 0 0 0|H 3.0739 0.155 0.2774 0.8929 0.2544,0-1|H 2.0 0.155 0.6068 -0.2383 -0.7169,0-1`

##### Formatted as:
`moleculeName|generalFormula|compoundCID|2d3dOrBoth|totalAtoms|totalBonds|{ElementA  x,y,z}|{ElementB x,y,z}|{ElementZ x,y,z}`

 - `Molecule Name`: Common name for the built molecule 
 - `General Formula`:  Formula representation of the molecule
 - `Compound CID`: ID used for identifying molecule in PubChem data set
 - `2d3dOrBoth`: Whether this molecule has 2d and/or 3d representations
 - `Total Atoms`: Number of atoms in the molecule
 - `Total Bonds`: Number of bonds in the molecule
 - `ElementX x,y,z` : The x,y,z position of the corresponding element X in the molecule


### 3D Representation
The model representation is built on the THREE.js library. It uses the x, y, z vector positions provided in our data set and maps it within a dialog box. These molecules are rotated independently from the data set model data, as a quaternion value is computed to handle rotation. The x, y, z vector values are unitless and only represent a position in model space. 

Both Ball and Stick and Space-Filling representations are built from the data set above, but the bonds in the Ball and Stick
model utilize some creative liberties. This approach was taken to visually represent the thickness and length of a bond
in this mode.
