const extract = require('../lib/index');
const yargs = require('yargs');
const meta = require('../package');

const argv = yargs
  .version(meta.version)
  .option('js', {
    alias: 'j',
    description: 'Glob pattern for JS files',
    type: 'string',
    default: '**/*.js',
  })
  .option('vue', {
    alias: 'v',
    description: 'Glob pattern for Vue files',
    type: 'string',
    default: '**/*.vue',
  })
  .option('out', {
    alias: 'o',
    description: 'Path to output pot file',
    type: 'string',
    default: 'template.pot',
  })
  .help()
  .alias('help', 'h')
  .argv;

(async () => {
  const extractor = await extract(argv.js, argv.vue, argv.out);
  extractor.printStats();
})();
