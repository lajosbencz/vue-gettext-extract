const fs = require('fs');
const SAXParser = require('parse5-sax-parser');

const RGX_TEST_ATTRIBUTE = /^(v-)|:|@/;
const RGX_MATCH_EXPRESSION = /{{[\s\S]*?}}/g;

const trim = str => str.replace(/^\s+|\s+$/g, '');

const selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

function deferredPromise() {
  return (() => {
    let res = null;
    let rej = null;
    const p = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    return {
      promise: p,
      reject: rej,
      resolve: res,
    };
  })();
}

// Credits for https://gist.github.com/paumoreno/cdfa14942424e895168a269a2deef1f3
async function parseVueFile(filename) {
  const defer = deferredPromise();

  const parser = new SAXParser({sourceCodeLocationInfo: true});
  const readStream = fs.createReadStream(filename, {
    encoding: 'utf8',
  });

  const snippets = [];
  const tagNames = [];
  let lastAttrs = [];
  let depth = 0;

  parser.on('startTag', ({tagName, attrs, selfClosing, sourceCodeLocation}) => {
    lastAttrs = attrs;
    selfClosing = selfClosing || selfClosingTags.includes(tagName);
    if (!selfClosing) {
      tagNames.push(tagName);
    }
    if (!selfClosing) {
      depth++;
    }
  });

  parser.on('text', ({text, sourceCodeLocation}) => {
    if (tagNames.length < 1) {
      return;
    }
    const attrs = lastAttrs;
    const tagName = tagNames[tagNames.length - 1];
    attrs.forEach((attr) => {
      if (attr.name.match(RGX_TEST_ATTRIBUTE)) {
        let code;
        if (attr.name === 'v-translate') {
          code = '$gettext("' + text + '")';
        } else {
          code = attr.value;
        }
        snippets.push({
          code,
          line: sourceCodeLocation.startLine,
          type: 'attr',
        });
      }
    });

    if (tagName === 'translate') {
      let plr = null;
      let ctx = null;
      attrs.forEach((v) => {
        switch (v.name) {
          case 'translate-plural':
            plr = trim(v.value);
            break;
          case 'translate-context':
            ctx = trim(v.value);
            break;
        }
      });
      let code = '$gettext(\'' + trim(text) + '\')';
      if (plr && ctx) {
        code = '$npgettext(\'' + trim(ctx) + '\', \'' + trim(text) + '\', \'' + trim(plr) + '\')';
      } else if (ctx) {
        code = '$pgettext(\'' + trim(ctx) + '\', \'' + trim(text) + '\')';
      } else if (plr) {
        code = '$ngettext(\'' + trim(text) + '\', \'' + trim(plr) + '\')';
      }
      snippets.push({
        code,
        line: sourceCodeLocation.startLine,
        type: 'tag',
      });
    }

    let matches;
    if ((matches = text.match(RGX_MATCH_EXPRESSION))) {
      matches.map(v => trim(v.substr(2, v.length - 4))).forEach((code) => {
        if (trim(code).length > 0) {
          snippets.push({
            code,
            line: sourceCodeLocation.startLine,
            type: 'cdata',
          });
        }
      });
    }

    if (depth === 1 && tagName === 'script') {
      snippets.push({
        code: text,
        line: sourceCodeLocation.startLine,
        type: 'script',
      });
    }
  });

  parser.on('endTag', ({tagName, sourceCodeLocation}) => {
    depth--;
    tagNames.pop();
    lastAttrs = [];
  });

  readStream.on('end', () => {
    defer.resolve();
  });
  readStream.on('open', () => {
    readStream.pipe(parser);
  });
  await defer.promise;
  return snippets;
}

module.exports = parseVueFile;
