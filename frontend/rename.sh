#!/bin/bash

# 1. Rename all .tsx to .jsx
find src -name "*.tsx" -exec sh -c 'mv "$0" "${0%.tsx}.jsx"' {} \;

# 2. Rename all .ts to .js
find src -name "*.ts" -exec sh -c 'mv "$0" "${0%.ts}.js"' {} \;

# 3. Remove TypeScript config and types
rm tsconfig.json
rm src/vite-env.d.ts
rm -rf src/types

echo "File renaming complete. Now update the code content below."
