'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const J = require('../src/joinfs-igc-to-jfs.js');

const SRC = path.join(__dirname, '..', 'src');
const EN = J.messages.en;
const LOCALES = ['de', 'es', 'fr', 'it', 'ko', 'nl', 'pt', 'uk'];          // the languages JoinFS ships plus Ukrainian, never ru
const placeholders = (s) => (s.match(/\{(\w+)\}/g) || []).sort();

test('there is a locale file for every supported language and none for others', () => {
  const files = fs.readdirSync(SRC).filter((f) => /^joinfs-igc-to-jfs-.+\.json$/.test(f)).map((f) => f.replace(/^joinfs-igc-to-jfs-|\.json$/g, '')).sort();
  assert.deepEqual(files, [...LOCALES].sort());
});

for (const lang of LOCALES) {
  test(`${lang}: same keys and placeholders as English, nothing empty`, () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, `joinfs-igc-to-jfs-${lang}.json`), 'utf8'));
    assert.deepEqual(Object.keys(EN).filter((k) => !(k in data)), [], 'missing keys');
    assert.deepEqual(Object.keys(data).filter((k) => !(k in EN)), [], 'unknown keys');
    for (const k of Object.keys(EN)) {
      assert.ok(typeof data[k] === 'string' && data[k].trim(), `${k} is empty`);
      assert.deepEqual(placeholders(data[k]), placeholders(EN[k]), `placeholders of ${k}`);
    }
  });
}

test('every parser error code has a translatable message', () => {
  for (const code of ['notIgc', 'noDate', 'noFixes', 'fewFixes', 'tooLarge', 'read', 'noConverter']) assert.ok(`err.${code}` in EN, code);
});
