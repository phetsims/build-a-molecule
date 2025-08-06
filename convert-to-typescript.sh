#!/usr/bin/env bash
#
# convert-to-typescript.sh
# Usage: ./convert-to-typescript.sh "Convert @./js/common/view/KitPlayAreaNode.ts to TypeScript."

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $(basename "$0") \"<task prompt>\""
  exit 1
fi

TASK_PROMPT="$1"

claude --model sonnet \
  --add-dir ../membrane-transport ../wilder \
  --allowedTools "Edit(js/**/*.ts),Edit(js/**/*.js),Bash(npm test)" \
  --verbose \
  --max-turns 1000 \
  -p "
Following the instructions in @./CLAUDE.md,
convert @./js/common/model/MoleculeStructure.ts to TypeScript.

For style and conventions, refer to
  • @../membrane-transport/js/common/model/MembraneTransportModel.ts

When resolving merge logic, use optionize / combineOptions patterns from
  • @../wilder/js/wilder/model/WilderOptionsPatterns.ts

Note the current working directory ./ is the same as ../build-a-molecule/

$TASK_PROMPT
"