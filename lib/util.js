'use strict';

const assert = require('assert');
const path = require('path');
const sha3 = require('bcrypto/lib/sha3');
const common = require('./common');
const Config = require('bcfg');

const TLD = new Set(common.TLD);

let CONFIGS = null;

exports.parseConfig = (options) => {
  if (CONFIGS)
    return CONFIGS;

  const config = new Config('hns');

  config.load({
    argv: true,
    env: true
  });

  if (options)
    config.inject(options);

  CONFIGS = config;

  return config;
};

exports.getName = (name) => {
  if (!name) {
    const config = exports.parseConfig();
    name = config.path('data-source', 'updated');
  }

  return name;
};

exports.dataPath = (name) => {
  name = exports.getName(name);
  return path.resolve(__dirname, '..', 'data', name);
};

exports.namesPath = (name) => {
  name = exports.getName(name);
  return path.resolve(__dirname, '..', 'names', name);
};

exports.buildPath = (name) => {
  name = exports.getName(name);
  return path.resolve(__dirname, '..', 'build', name);
};

exports.DATA_PATH = exports.dataPath();
exports.NAMES_PATH = exports.namesPath();
exports.BUILD_PATH = exports.buildPath();

const {ICCTLD} = require(path.resolve(exports.DATA_PATH, 'icctlds.js'));

exports.isHNS = function isHNS(name) {
  assert(typeof name === 'string');

  if (name.length === 0)
    return false;

  if (name.length > 63)
    return false;

  if (!/^[a-z0-9\-_]+$/.test(name))
    return false;

  if (/^[\-_]|[\-_]$/.test(name))
    return false;

  return true;
};

exports.isTLD = function isTLD(tld) {
  assert(typeof tld === 'string');
  return TLD.has(tld);
};

exports.isCCTLD = function isCCTLD(tld) {
  assert(typeof tld === 'string');
  return tld.length === 2 || ICCTLD.has(tld);
};

exports.isGTLD = function isGTLD(tld) {
  assert(typeof tld === 'string');
  return !exports.isTLD(tld) && !exports.isCCTLD(tld);
};

exports.compare = function compare(a, b) {
  assert(typeof a === 'string');
  assert(typeof b === 'string');

  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const x = a.charCodeAt(i);
    const y = b.charCodeAt(i);

    if (x < y)
      return -1;

    if (x > y)
      return 1;
  }

  if (a.length < b.length)
    return -1;

  if (a.length > b.length)
    return 1;

  return 0;
};

exports.hashName = function hashName(name) {
  assert(typeof name === 'string');

  const raw = Buffer.from(name, 'ascii');

  return sha3.digest(raw);
};
