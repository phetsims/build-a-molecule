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

# GOTCHAS - TypeScript Conversion

## Critical API Compatibility Issues
- **NEVER change property names during conversion** - Other unconverted files may depend on exact property names at runtime
- Automated tests may pass while runtime crashes due to missing properties
- When in doubt, keep original naming even if it violates current PhET conventions (use eslint-disable-line)

## Band-aid Fixes for Dependencies
- Unconverted dependencies require `as any` with proper documentation:
  ```typescript
  ( someObject as any ).property // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO: Fix when SomeClass is converted, see https://github.com/phetsims/build-a-molecule/issues/245
  ```
- Always include the issue number in TODO comments
- Common areas needing band-aids: constructor signatures, property access, method calls

## Import and Type Issues
- Import types that may not exist yet - define placeholder types when necessary
- Use existing pattern: `import { ParticleContainer } from '../../../../phetcommon/js/model/ParticleContainer.js';`
- Generic types often need explicit type parameters: `SphereBucket<Atom2>`, `Property<CompleteMolecule | null>`

## Options Pattern Migration  
- Replace `merge`/`required` with `optionize` pattern
- Define `SelfOptions` and `[Class]Options` types
- Use `optionize<[Class]Options, SelfOptions, EmptySelfOptions>()()`
- For non-constructor options, may need `combineOptions<>()`

## Lodash Elimination
- Replace `_.includes()` with `Array.includes()`
- Replace `_.uniq()` with custom filter: `arr.filter((item, index, arr) => arr.indexOf(item) === index)`
- Avoid importing lodash in new TypeScript files

## Property and Naming Conventions
- PhET requires Property suffix for properties, but legacy code may not follow this
- Use eslint-disable-line when maintaining compatibility is more important
- Watch for "readonly" vs mutable properties (some methods need mutable arrays)

## Multi-step Editing Process
- Large MultiEdit operations may fail - break into smaller Edit operations if needed  
- Always verify changes actually applied by re-reading the file
- Test frequently with `npm test` after major changes

## Type Annotation Strategy
- Start with broad types, narrow down as dependencies are converted
- Use explicit `any` with eslint-disable-line for temporary compatibility
- Add type annotations to arrays: `const items: Type[] = []`
- Function parameters and return types are essential for method signatures

## Testing Limitations
- `npm test` may pass while runtime fails due to incomplete integration testing
- Pay attention to property access patterns in unconverted files
- When property names change, search codebase for usage before committing

## Loop and Closure Issues
- Avoid functions declared in loops that reference loop variables
- Use eslint-disable-next-line for complex cases that can't be easily refactored
- Consider extracting loop bodies to separate methods when practical

## PRESERVE COMMENTS
- In JSDoc @param and @returns, preserve comments. Only delete if there is no comment for any @param.