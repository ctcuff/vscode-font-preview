module.exports = {
  './extension/**/*{.js,.ts}': ['prettier --write'],
  './extension/**/*{.js,.jsx,.ts,.tsx}': ['yarn lint:extension'],
  './web/src/**/*{.js,.jsx,.ts,.tsx}': ['yarn lint:web'],
  './web/**/*{.js,.jsx,.ts,.tsx,.scss}': ['prettier --write'],
  // Compiles all TypeScript without emitting JS files to
  // check for type errors. This is specified as a function
  // so that lint-staged doesn't pass any arguments to tsc
  './extension/**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
  './web/**/*.ts?(x)': () => 'tsc -p ./web/tsconfig.json --noEmit'
}
