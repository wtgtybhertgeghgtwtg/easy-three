const builtinModules = require('builtin-modules');
const minimist = require('minimist');
const pMap = require('p-map');
const path = require('path');
const readPkgs = require('read-pkgs');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
const write = require('write');

const cwd = process.cwd();
const {_: packageNames} = minimist(process.argv.slice(2));

const indexJsFlow = "// @flow\nexport * from '../src';";

readPkgs('packages/*', {cwd}).then(pkgs => {
  const packagesToBuild =
    packageNames.length > 0
      ? pkgs.filter(({pkg}) => packageNames.includes(pkg.name))
      : pkgs;
  return pMap(packagesToBuild, async ({directory, pkg}) => {
    const bundle = await rollup({
      external: [...builtinModules, ...Object.keys(pkg.dependencies)],
      input: path.resolve(cwd, directory, 'src/index.js'),
      plugins: [babel()],
    });
    const mainFile = path.resolve(cwd, directory, pkg.main);
    const moduleFile = path.resolve(cwd, directory, pkg.module);
    await bundle.write({
      file: mainFile,
      format: 'cjs',
      sourcemap: true,
    });
    await write(`${mainFile}.flow`, indexJsFlow);
    await bundle.write({
      file: moduleFile,
      format: 'es',
      sourcemap: true,
    });
  });
});
