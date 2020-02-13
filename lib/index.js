const parserJsCreate = require('../lib/parser-js-create');
const parseVueFile = require('../lib/parse-vue-file');
const gettext = require('gettext-extractor');
const glob = require('glob');

async function extract(jsGlob = '**/*.js', vueGlob = '**/*.vue', outputFile = 'template.pot') {
  const GettextExtractor = gettext.GettextExtractor;
  const extractor = new GettextExtractor();
  const parserJs = parserJsCreate(extractor);
  if(typeof jsGlob === 'string' && jsGlob.length > 0) {
    parserJs.parseFilesGlob(jsGlob);
  }
  if(typeof vueGlob === 'string' && vueGlob.length > 0) {
    const vueFiles = glob.sync(vueGlob);
    for (const vueFile of vueFiles) {
      const snippets = await parseVueFile(vueFile);
      for (const snip of snippets) {
        parserJs.parseString(snip.code, vueFile, {
          lineNumberStart: snip.line,
        });
      }
    }
  }
  if (typeof outputFile === 'string' && outputFile.length > 0) {
    extractor.savePotFile(outputFile);
  }
  return extractor;
}

module.exports = extract;
