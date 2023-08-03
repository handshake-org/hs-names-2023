#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const reserved = require('hsd/lib/covenants/reserved');
const util = require('./lib/util');
const {locked} = require('./lib/locked');

const unreserved = [];
const unreservedRoot = [];

for (const [hash, item] of reserved) {
  if (locked.has(hash))
    continue;

  const json = {
    name: item.name,
    hash: item.hash.toString('hex'),
    target: item.target,
    root: item.root
  };

  if (item.root)
    unreservedRoot.push(json);
  else
    unreserved.push(json);
}

fs.writeFileSync(
  path.resolve(util.BUILD_PATH, 'unreserved.json'),
  JSON.stringify(unreserved, null, 2) + '\n');

fs.writeFileSync(
  path.resolve(util.BUILD_PATH, 'unreserved-root.json'),
  JSON.stringify(unreservedRoot, null, 2) + '\n');
