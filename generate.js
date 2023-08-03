#!/usr/bin/env node

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('bfile');
const bio = require('bufio');
const rules = require('hsd/lib/covenants/rules');
const util = require('./lib/util');

const configs = util.parseConfig();

const DATA_SRC = util.getName();
const TOPN = configs.uint('top', 10000);
const FILL = true;
const DATA_PATH = util.DATA_PATH;
const NAMES_PATH = util.NAMES_PATH;
const BUILD_PATH = util.BUILD_PATH;

const EXTRAS = require(path.join(DATA_PATH, 'extras'));
const BLACKLIST = require(path.join(NAMES_PATH, 'blacklist.json'));
const CUSTOM = require(path.join(NAMES_PATH, 'custom.json'));
const TRADEMARKS = require(path.join(NAMES_PATH, 'trademarks.json'));
const RTLD = require(path.join(NAMES_PATH, 'rtld.json'));
const ALEXA = require(path.join(NAMES_PATH, 'alexa.json'));
const WORDS = require(path.join(NAMES_PATH, 'words.json'));

const gtldExcludes = new Set(EXTRAS.gtldExcludes);
const exclude = new Set(EXTRAS.excludeNames);
const blacklist = new Set(BLACKLIST);
const words = new Set(WORDS);
const network = require('hsd/lib/protocol/network').get('main');

const VALID_PATH = path.join(BUILD_PATH, `valid-${TOPN}.json`);
const INVALID_PATH = path.join(BUILD_PATH, `invalid-${TOPN}.json`);
const LOCKUP_JSON = path.join(BUILD_PATH, 'lockup.json');
const LOCKUP_DB = path.join(BUILD_PATH, 'lockup.db');
const LOCKUP_DB_COMPACT = path.join(BUILD_PATH, 'lockup-compact.db');

function compile() {
  const table = new Map();
  const names = [];
  const invalid = [];

  const invalidate = (domain, name, rank, reason, winner = null) => {
    invalid.push({
      domain,
      rank,
      name,
      reason,
      winner
    });

    if (winner)
      reason += ` with ${winner.domain} (${winner.rank})`;

    console.error('Ignoring %s (%d) (reason=%s).', domain, rank, reason);
  };

  const insert = (domain, rank, name, tld) => {
    // Ignore blacklist.
    if (blacklist.has(name)) {
      invalidate(domain, name, rank, 'blacklist');
      return false;
    }

    // Ignore domains that were NOT reserved.
    const hash = rules.hashName(name);

    if (!rules.isReserved(hash, 1, network)) {
      invalidate(domain, name, rank, 'not-reserved');
      return false;
    }

    if (exclude.has(name)) {
      invalidate(domain, name, rank, 'excluded');
      return false;
    }

    // Check for collisions.
    const cache = table.get(name);

    if (cache) {
      assert(rank > 0);

      if (cache.rank === -2)
        invalidate(domain, name, rank, 'existing-naming-project', cache);
      else if (cache.rank === -1)
        invalidate(domain, name, rank, 'trademarked', cache);
      else
        invalidate(domain, name, rank, 'collision', cache);

      cache.collisions += 1;

      return false;
    }

    const item = {
      domain,
      rank,
      name,
      tld,
      collisions: 0
    };

    table.set(name, item);
    names.push(item);
    return true;
  };

  // Custom TLDs (these are domains
  // for existing naming projects).
  for (const [name, domain] of CUSTOM) {
    const tld = domain.split('.').slice(1).join('.');

    assert(!blacklist.has(name));

    insert(domain, -2, name, tld);
  }

  // Trademarked TLDs (these are domains
  // who submitted a trademark claim).
  for (const [name, domain] of TRADEMARKS) {
    const tld = domain.split('.').slice(1).join('.');

    assert(!blacklist.has(name));

    insert(domain, -1, name, tld);
  }

  // Root TLDs.
  for (const name of RTLD) {
    if (gtldExcludes.has(name)) {
      invalidate(name, name, 0, 'gtld-exclude');
      continue;
    }

    insert(name, 0, name, '');
  }

  assert(ALEXA.length >= 300000);

  let countAlexa = 0;

  // Alexa top 100,000 second-level domains.
  for (let i = 0; i < ALEXA.length; i++) {
    const domain_ = ALEXA[i];
    const parts = domain_.split('.');
    const rank = i + 1;

    // Strip leading `www`.
    while (parts.length > 2 && parts[0] === 'www')
      parts.shift();

    assert(parts.length >= 2);

    const domain = parts.join('.');

    // Ignore plain `www`.
    if (parts[0] === 'www') {
      invalidate(domain, 'www', rank, 'plain-www');
      continue;
    }

    // Ignore deeply nested domains.
    if (parts.length > 3) {
      invalidate(domain, '', rank, 'deeply-nested');
      continue;
    }

    // Third-level domain.
    if (parts.length === 3) {
      const [name, sld, tld] = parts;

      // Country Codes only (e.g. co.uk, com.cn).
      if (!util.isCCTLD(tld)) {
        invalidate(domain, name, rank, 'deeply-nested');
        continue;
      }

      // The SLD must be a known TLD
      // (or a widley used second-level
      // domain like `co` or `ac`).
      // Prioritize SLDs that have at
      // least 3 in the top 100k.
      switch (sld) {
        case 'com':
        case 'edu':
        case 'gov':
        case 'mil':
        case 'net':
        case 'org':
        case 'co': // common everywhere (1795)
        case 'ac': // common everywhere (572)
        case 'go': // govt for jp, kr, id, ke, th, tz (169)
        case 'gob': // govt for mx, ar, ve, pe, es (134)
        case 'nic': // govt for in (97)
        case 'or': // common in jp, kr, id (64)
        case 'ne': // common in jp (55)
        case 'gouv': // govt for fr (32)
        case 'jus': // govt for br (28)
        case 'gc': // govt for ca (19)
        case 'lg': // common in jp (15)
        case 'in': // common in th (14)
        case 'govt': // govt for nz (11)
        case 'gv': // common in au (8)
        case 'spb': // common in ru (6)
        case 'on': // ontario domain for ca (6)
        case 'gen': // common in tr (6)
        case 'res': // common in in (6)
        case 'qc': // quebec domain for ca (5)
        case 'kiev': // kiev domain for ua (5)
        case 'fi': // common in cr (4)
        case 'ab': // alberta domain for ca (3)
        case 'dn': // common in ua (3)
        case 'ed': // common in ao and jp (3)
          break;
        default:
          invalidate(domain, name, rank, 'deeply-nested');
          continue;
      }
    }

    // Get lowest-level name.
    const name = parts.shift();

    // Must match HNS standards.
    if (!util.isHNS(name)) {
      invalidate(domain, name, rank, 'formatting');
      continue;
    }

    // Ignore single letter domains.
    if (name.length === 1) {
      invalidate(domain, name, rank, 'one-letter');
      continue;
    }

    // Use stricter rules after rank 5k.
    if (rank > 1000) {
      // Ignore two-letter domains after 5k.
      if (name.length === 2) {
        invalidate(domain, name, rank, 'two-letter');
        continue;
      }
      // Ignore english words after 5k.
      if (words.has(name)) {
        invalidate(domain, name, rank, 'english-word');
        continue;
      }
    }

    const tld = parts.join('.');

    const inserted = insert(domain, rank, name, tld);

    if (inserted)
      countAlexa++;

    if (FILL && countAlexa >= TOPN)
      break;

    if (!FILL && (i + 1) === TOPN)
      break;
  }

  return [names, invalid];
}

function sortRank(a, b) {
  if (a.rank < b.rank)
    return -1;

  if (a.rank > b.rank)
    return 1;

  return util.compare(a.name, b.name);
}

function sortHash(a, b) {
  return a.hash.compare(b.hash);
}

// Execute

console.error(`Compiling top ${TOPN} Alexa domains from ${util.getName()}...`);

const [names, invalid] = compile();
const items = [];

if (!fs.existsSync(path.dirname(BUILD_PATH)))
  fs.mkdirSync(path.dirname(BUILD_PATH));

if (!fs.existsSync(BUILD_PATH))
  fs.mkdirSync(BUILD_PATH);

{
  const json = [];

  json.push('{');

  names.sort(sortRank);

  for (const {name, tld, rank, collisions} of names)
    json.push(`  "${name}": ["${tld}", ${rank}, ${collisions}],`);

  json[json.length - 1] = json[json.length - 1].slice(0, -1);
  json.push('}');
  json.push('');

  const out = json.join('\n');

  fs.writeFileSync(VALID_PATH, out);
}

{
  const json = [];

  json.push('[');

  invalid.sort(sortRank);

  for (const {domain, name, rank, reason, winner} of invalid) {
    if (winner) {
      const wd = winner.domain;
      const wr = winner.rank;
      // eslint-disable-next-line max-len
      json.push(`  ["${domain}", "${name}", ${rank}, "${reason}", ["${wd}", ${wr}]],`);
    } else {
      json.push(`  ["${domain}", "${name}", ${rank}, "${reason}"],`);
    }
  }

  json[json.length - 1] = json[json.length - 1].slice(0, -1);
  json.push(']');
  json.push('');

  const out = json.join('\n');

  fs.writeFileSync(INVALID_PATH, out);
}

// Prepare data for compilation.
{
  let totalTLDS = 0;
  let totalCustom = 0;
  let totalAlexa = 0;
  let totalTrademarks = 0;

  for (const {name, domain, rank} of names) {
    let flags = 0;

    if (rank === 0) {
      totalTLDS++;
      flags |= 1;
    }

    if (rank === -1)
      totalTrademarks++;

    if (rank === -2) {
      totalCustom++;
      flags |= 2;
    }

    if (rank > 0)
      totalAlexa++;

    const hash = rules.hashName(name);
    const hex = hash.toString('hex');
    const target = `${domain}.`;

    items.push({
      name,
      hash,
      hex,
      target,
      flags
    });
  }

  // 5 TLDs are not reserved.
  if (DATA_SRC === 'updated') {
    // ["kids", "kids", 0, "not-reserved"],
    // ["music", "music", 0, "not-reserved"],
    // ["xn--4dbrk0ce", "xn--4dbrk0ce", 0, "not-reserved"],
    // ["xn--cckwcxetd", "xn--cckwcxetd", 0, "not-reserved"],
    // ["xn--jlq480n2rg", "xn--jlq480n2rg", 0, "not-reserved"],
    const NOT_RESERVED = 5;
    const IGNORE = EXTRAS.gtldExcludes.length;
    assert(totalTLDS === RTLD.length - NOT_RESERVED - IGNORE);
  }

  if (DATA_SRC === 'original') {
    assert(totalTLDS === RTLD.length - EXTRAS.gtldExcludes.length);
  }

  assert(totalCustom === CUSTOM.length);
  assert(totalTrademarks === TRADEMARKS.length);
  assert(totalAlexa === TOPN);
}

// Build final databases.
items.sort(sortHash);

{
  const ZERO_HASH = Array(32 + 1).join('00');

  const json = [
    '{',
    `  "${ZERO_HASH}": [${items.length}],`
  ];

  for (const {hex, target, flags} of items)
    json.push(`  "${hex}": ["${target}", ${flags}],`);

  json[json.length - 1] = json[json.length - 1].slice(0, -1);
  json.push('}');
  json.push('');

  const out = json.join('\n');

  fs.writeFileSync(LOCKUP_JSON, out);
}

{
  const bw = bio.write(30 << 20);
  const {data} = bw;

  bw.writeU32(items.length);

  const offsets = [];

  for (const item of items) {
    bw.writeBytes(item.hash);
    offsets.push(bw.offset);
    bw.writeU32(0);
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const {offset} = bw;
    const pos = offsets[i];

    bio.writeU32(data, offset, pos);

    assert(item.target.length <= 255);

    const index = item.target.indexOf('.');
    assert(index !== -1);

    bw.writeU8(item.target.length);
    bw.writeString(item.target, 'ascii');
    bw.writeU8(item.flags);
    bw.writeU8(index);
  }

  const raw = bw.slice();

  fs.writeFileSync(LOCKUP_DB, raw);
}

{
  const bw = bio.write(30 << 20);

  bw.writeU32(items.length);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    assert(item.target.length <= 255);

    bw.writeBytes(item.hash);
    bw.writeU8(item.flags);
  }

  const raw = bw.slice();

  fs.writeFileSync(LOCKUP_DB_COMPACT, raw);
}
