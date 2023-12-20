module.exports = {
  './**/*{.js,.ts}': ['prettier --write'],
  './**/*{.js,.ts,}': ['yarn lint'],
  // Compiles all TypeScript without emitting JS files to
  // check for type errors. This is specified as a function
  // so that lint-staged doesn't pass any arguments to tsc
  './**/*.ts': () => 'tsc -p ./tsconfig.json --noEmit'
}
