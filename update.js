#!/usr/bin/env node

'use strict';

// Source: https://github.com/handshake-org/hs-names/blob/7270561b4b1a5b45e77252e2e4740ffee34ba876/update.js

// TLD Resources:
// https://www.icann.org/resources/pages/tlds-2012-02-25-en
// https://data.iana.org/TLD/tlds-alpha-by-domain.txt
// https://www.internic.net/domain/root.zone

// SLD Resources:
// https://www.google.com/search?q=alexa+top+100000
// https://www.quora.com/What-are-the-top-100-000-most-visited-websites
// https://s3.amazonaws.com/alexa-static/top-1m.csv.zip

const assert = require('assert');
const fs = require('bfile');
const path = require('path');
const {fromZone} = require('bns/lib/wire');
const {countLabels, trimFQDN} = require('bns/lib/util');
const util = require('./lib/util');
const {TLD, BLACKLIST, TRADEMARKS} = require('./lib/common');

const DATA_PATH = util.DATA_PATH;

const TLD_PATH = path.resolve(DATA_PATH, 'tlds-alpha-by-domain.txt');
const ALEXA_PATH = path.resolve(DATA_PATH, 'top-1m.csv');
const ROOT_PATH = path.resolve(DATA_PATH, 'root.zone');
const {CUSTOM} = require(path.resolve(DATA_PATH, 'custom.js'));
// New words come from updated /usr/share/dict/words
const WORDS = require(path.resolve(DATA_PATH, 'words.json'));

const CCTLD = (() => {
  const data = fs.readFileSync(TLD_PATH, 'utf8');
  const lines = data.split('\n');
  const result = [];

  for (const line of lines) {
    const name = line.trim().toLowerCase();

    if (name.length === 0)
      continue;

    if (name[0] === '#')
      continue;

    assert(name.length <= 63);

    // ccTLDs only!
    if (util.isCCTLD(name))
      result.push(name);
  }

  return result;
})();

const GTLD = (() => {
  const data = fs.readFileSync(TLD_PATH, 'utf8');
  const lines = data.split('\n');
  const result = [];

  for (const line of lines) {
    const name = line.trim().toLowerCase();

    if (name.length === 0)
      continue;

    if (name[0] === '#')
      continue;

    assert(name.length <= 63);

    // gTLDs only!
    if (util.isGTLD(name))
      result.push(name);
  }

  return result;
})();

const RTLD = (() => {
  const text = fs.readFileSync(ROOT_PATH, 'utf8');
  const records = fromZone(text);
  const set = new Set();
  const result = [];

  for (const rr of records) {
    if (countLabels(rr.name) !== 1)
      continue;

    const name = rr.name.toLowerCase();

    if (set.has(name))
      continue;

    set.add(name);

    result.push(trimFQDN(name));
  }

  return result;
})();

const ALEXA = (() => {
  const data = fs.readFileSync(ALEXA_PATH, 'utf8');
  const lines = data.split('\n');
  const result = [];

  let cur = 1;

  for (const line of lines) {
    const ln = line.trim().toLowerCase();

    if (ln.length === 0)
      continue;

    const items = ln.split(/\s*,\s*/);
    assert(items.length === 2);

    const [num, domain] = items;
    const rank = parseInt(num, 10);

    assert((rank >>> 0) === rank);

    // No idea why alexa does this.
    if (rank !== cur) {
      assert(rank > cur);
      console.error('Warning: rank inconsistency!');
      console.error('Rank %d is missing.', cur);
      cur = rank;
    }

    result.push(domain);
    cur += 1;
  }

  return result;
})();

const dir = util.NAMES_PATH;

if (!fs.existsSync(path.dirname(dir)))
  fs.mkdirSync(path.dirname(dir));

if (!fs.existsSync(dir))
  fs.mkdirSync(dir);

fs.writeFileSync(
  path.resolve(dir, 'blacklist.json'),
  JSON.stringify(BLACKLIST, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'custom.json'),
  JSON.stringify(CUSTOM, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'tld.json'),
  JSON.stringify(TLD, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'cctld.json'),
  JSON.stringify(CCTLD, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'gtld.json'),
  JSON.stringify(GTLD, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'rtld.json'),
  JSON.stringify(RTLD, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'alexa.json'),
  JSON.stringify(ALEXA, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'words.json'),
  JSON.stringify(WORDS, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(dir, 'trademarks.json'),
  JSON.stringify(TRADEMARKS, null, 2) + '\n');
