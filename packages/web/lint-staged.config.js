module.exports = {
  './src/**/*{.js,.jsx,.ts,.tsx}': ['yarn lint'],
  './**/*{.js,.jsx,.ts,.tsx,.scss}': ['prettier --write'],
  // Compiles all TypeScript without emitting JS files to
  // check for type errors. This is specified as a function
  // so that lint-staged doesn't pass any arguments to tsc
  './**/*.ts?(x)': () => 'tsc -p ./tsconfig.json --noEmit'
}
