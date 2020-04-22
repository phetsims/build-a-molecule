Build a Molecule - Implementation Notes
================

### Terminology

- Atom: Singular representation of an element.
- Molecule: A representation of one or more atoms that are bonded
- Kit Collection: The whole grouping of kits and collection boxes
- Kit: A grouping of buckets and their atoms. This is houses within the carousel at the bottom of the screen.
- Collection Box: Area that houses a goal molecule. Collection boxes have cues to indicate dropping an atom in the area
and are housed in a Collection Panel
- Goal Molecule: These molecules are the targets for successfully completing a collection. For example, H20 on the first
screen screen
- Collection Panel: Panel that houses all of the collection boxes
- Kit Play Area: Area where users can add molecules to and from. In this area, we can break molecules and bond them. This
is where most of the interaction will occur between building molecules.
- Bucket: Houses the atoms for each kit
- Refill Button: Fills the buckets to their initial state returning all molecules in the kit play area back into their respective buckets.
- Reset Collection Button: Refill the buckets, clears the kit play area, and clears the collection panel.

### Fundamentals
This sim's layout is focus around 3 main partitions: The Kit Play Area, The Kit, and if on the 1st and 2nd screen the
Collection Panel. Users are meant to remove an atom from the bucket and place it in the kit play area. From here the atoms
are now recognized as Molecules. Molecules that are placed in the Kit Play Area are stored in maps. When molecules are added
or removed the Kit Collection checks if any of the molecules are valid Goals and cues the user to place them in a collection
box.

### Kits and Kit Collections
Kits are limited to the available buckets and atoms present in each kit. A user cannot build a molecule using atoms from
another kit. Each collection has a limited number of kits. The motivation behind this design is to limit the number of 
possible molecules a user can build from a kit. 

Kits are swapped via the carousel. Depending on the page number of the carousel,
the kit's molecules, buckets, and atoms are hidden from the view and restored when the carousel returns back to that Kit's page.

Kit Collections are treated similarly to Kits but contain the collection boxes along with a grouping of Kits. When all
of the Goals in the Collection Boxes have been met, the user is prompted to go to the next Kit Collection. A new Kit Collection
is generated with a new set of Kits, Collection Boxes, and Goals. These are randomly generated.

There is no limit to the number of Kit Collections we can generate in the sim's lifetime.

The PlayGround screen only has one Kit Collection with several kits because there is no set of Goals to collect on this screen.
   

