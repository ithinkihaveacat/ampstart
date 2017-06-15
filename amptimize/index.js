const DOCROOT = process.env['DOCROOT'] ? process.env['DOCROOT'] : '../dist';
const CANONICAL_ROOT = process.env['CANONICAL_ROOT'] ? process.env['CANONICAL_ROOT'] : 'http://localhost';

const uncdnurl = (url) => `/js${(new URL(url)).pathname}`;

const ampurl = (path) => `${CANONICAL_ROOT}${path}`.replace(/\.html$/, '.orig.html');
const ampfile = (path) => `dist${path.replace(/\.html$/, '.orig.html')}`;

const htmlfile = (path) => `dist${path}`;

const fs = require('fs');
const cheerio = require('cheerio');
const URL = require('url').URL;

const validator = require('amphtml-validator').getInstance();

if (process.argv.length < 3) {
  console.log('usage: amptimizer amppath...');
  process.exit(1);
}

function amp(s) {
  return validator.then((validator) => {
    return new Promise((resolve, reject) => {
      const res = validator.validateString(s);
      if (res.status === 'PASS') {
        resolve(s);
      } else {
        reject(res.errors);
      }
    });
  });
}

function optimize(uncdnurl, ampurl) {
  return (s) => {
    const $ = cheerio.load(s);
    $('html').attr('amp', null);
    $('html').attr('⚡', null);
    $('script[src^="https://cdn.ampproject.org/"]').each((i, tmp) => {
      const e = $(tmp);
      e.attr('src', uncdnurl(e.attr('src')));
    });
    $('head').append(`<link rel="amphtml" href="${ampurl}">`);
    return $.html();
  };
}

const readFile = (s) => (() => fs.readFileSync(s, 'utf8'));
const writeFile = (s) => ((data) => {
  fs.writeFileSync(s, data, 'utf8');
  console.log(`Output ${s}`);
});

process.argv.splice(2).forEach(path => {
  const filename = `${DOCROOT}${path}`;
  if (!fs.existsSync(filename)) {
    console.error(`error: "${filename}" not found`);
    return;
  }
  const input = Promise.resolve().then(readFile(filename)).then(amp);

  input
    .then(optimize(uncdnurl, ampurl(path)))
    .then(writeFile(htmlfile(path)))
    .catch(console.error.bind(console, filename));

  input
    .then(writeFile(ampfile(path)))
    .catch(console.error.bind(console, filename));
});
