module.exports = {
  './src/**/*{.js,.ts}': ['prettier --write'],
  './src/**/*{.js,.jsx,.ts,.tsx}': ['yarn lint'],
  // Compiles all TypeScript without emitting JS files to
  // check for type errors. This is specified as a function
  // so that lint-staged doesn't pass any arguments to tsc
  './src/**/*.ts?(x)': () => 'tsc -p ./tsconfig.json --noEmit'
}
