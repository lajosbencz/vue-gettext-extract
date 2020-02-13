# vue-gettext-extract
Generates gettext pot files for standard Vue projects

Designed to be used with
[vue-gettext](https://github.com/Polyconseil/vue-gettext)
and
[nuxt-gettext](https://github.com/lajosbencz/nuxt-gettext)

### Install

```bash
npm install -D vue-gettext-extract
```

### Usage

#### Usage in terminal

```bash
cd /my/project/dir/
vue-gettext-extract --help
Options:
  --version   Show version number                                      [boolean]
  --js, -j    Glob pattern for JS files            [string] [default: "**/*.js"]
  --vue, -v   Glob pattern for Vue files          [string] [default: "**/*.vue"]
  --out, -o   Path to output pot file         [string] [default: "template.pot"]
  --help, -h  Show help                                                [boolean]
```

#### Usage in code

```js
const extract = require('vue-gettext-extract')

async function run() {
  const extractor = await extract('src/**/*.js', 'src/**/*.vue', 'locale/template.pot')
  extractor.printStats()
}
```
 
Most of the code is thanks to [gettext-extractor](https://github.com/lukasgeiter/gettext-extractor) and [this gist](https://gist.github.com/paumoreno/cdfa14942424e895168a269a2deef1f3) 
