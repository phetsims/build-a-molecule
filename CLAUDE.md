# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
npm test
```

## Architecture Overview

This is a PhET educational chemistry simulation with three progressive screens:
1. **Single** - Build one molecule at a time
2. **Multiple** - Build multiple molecules simultaneously  
3. **Playground** - Free exploration mode

### Key Architectural Patterns

- **Model-View Separation**: Models in `js/common/model/`, views in `js/common/view/`
- **Screen Structure**: Each screen extends `BAMScreen` with its own model and view
- **Property-Based State**: Uses Axon Properties for reactive state management (see `phet-info/doc/phet-software-design-patterns.md` for Property patterns)
- **3D Visualization**: THREE.js for molecular rendering with ball-and-stick and space-filling models

### Core Components

**Models:**
- `BAMModel` - Base model for all screens
- `Kit` - Collection of atoms that can be manipulated
- `KitCollection` - Manages multiple kits and molecule collection areas
- `Atom2` - Individual atom with position and bonding capabilities
- `Molecule` - Collection of bonded atoms
- `CompleteMolecule` - Molecule with known chemical formula and 3D structure

**Views:**
- `BAMScreenView` - Base view with kit/collection areas
- `MoleculeCollectingScreenView` - Adds molecule collection boxes
- `AtomNode` - Visual representation of atoms
- `MoleculeNode` - 2D molecule visualization
- `Molecule3DNode` - 3D molecule rendering

### Data Sources

- **Molecule Database**: `js/common/model/data/` contains PubChem-sourced molecular structures
- **Supported Elements**: B, Br, C, Cl, F, H, I, N, O, P, S, Si (defined in `BAMConstants`)
- **Bonding Model**: Lewis dot structure implementation in `js/common/model/`

## Development Notes

### Current TypeScript Migration
- Repository is on `typescript-245` branch for TypeScript conversion
- Many files have `// @ts-nocheck` and `/* eslint-disable */` temporarily
- When making changes, prefer fixing TypeScript/ESLint issues in modified files

### Testing Strategy
- **Snapshot Tests**: `test/snapshot-comparison.test.js` validates visual consistency
- **Type Safety**: Run `grunt type-check` before committing
- **Code Quality**: Run `grunt lint --fix` to auto-fix style issues

### Important Files
- Entry point: `js/build-a-molecule-main.ts`
- Constants and configuration: `js/common/BAMConstants.ts`
- Implementation details: `doc/implementation-notes.md`
- Model documentation: `doc/model.md`

### PhET-Specific Considerations
- This simulation is part of a larger ecosystem with 20+ sibling repositories
- Build tools are in `../chipper/`
- Common UI components come from `../sun/`, `../scenery/`, `../joist/`
- For Property linking/unlinking patterns, see `../phet-info/doc/phet-software-design-patterns.md`

# CURRENT TASK - CONVERT TO TYPESCRIPT
IMPORTANT! Working solely in type space and in code comments, we are porting the files from JavaScript to TypeScript.

Steps:
1. For the selected file: Remove `// @ts-nocheck` and `/* eslint-disable */`
2. Add class attribute declarations for members assigned in the constructor. Move documentation to the declaration site.
3. Add return types for methods.
4. For reference, see /Users/reids/phet/root/membrane-transport/js/common/model/MembraneTransportModel.ts as an idiomatic TypeScript file.
5. See /Users/reids/phet/root/wilder/js/wilder/model/WilderOptionsPatterns.ts for an example of how to use optionize instead of merge.
6. After a file is converted, run `npm test`. This will report any runtime discrepancy (remember we do not want any runtime behavior changes or regressions), and type checking and linting.
7. If there are tricky parts that you cannot get AFTER 3 TRIES, you have to tag it with // eslint-disable-line or // @ts-expect-error. If those do not work put // @ts-nocheck or /* eslint-disable */ at the top of the file again. DO NOT GET STUCK
8. The developer will be responsible for commits.