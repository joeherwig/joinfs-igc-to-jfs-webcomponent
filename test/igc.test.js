'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parse, toGpx, prefillFor, IgcError } = require('../src/joinfs-igc-to-jfs.js');
const { makeIgc, syntheticFlight } = require('./helpers/igc.cjs');

const T0 = Date.UTC(2026, 5, 20, 11, 0, 0) / 1000;
const pts = (n, extra) => Array.from({ length: n }, (_, i) => ({ t: T0 + i, lat: 48.5 + i * 1e-4, lon: 9.4 + i * 1e-4, gnss: 700 + i, ...extra }));

test('parses fixes: position, GNSS altitude, UTC time', () => {
  const { points, meta } = parse(makeIgc(pts(10)));
  assert.equal(points.length, 10);
  assert.ok(Math.abs(points[0].lat - 48.5) < 2e-5 && Math.abs(points[0].lon - 9.4) < 2e-5);
  assert.equal(points[0].t, T0);
  assert.equal(points[9].t, T0 + 9);
  assert.equal(points[3].ele, 703);
  assert.equal(meta.fixes, 10);
  assert.equal(meta.durationS, 9);
  assert.equal(meta.date, '2026-06-20');
});

test('handles all four hemispheres', () => {
  for (const [la, lo] of [[48.5, 9.4], [-33.9, 151.2], [47.6, -122.3], [-34.6, -58.4]]) {
    const { points } = parse(makeIgc([{ t: T0, lat: la, lon: lo, gnss: 500 }, { t: T0 + 1, lat: la, lon: lo, gnss: 500 }]));
    assert.ok(Math.abs(points[0].lat - la) < 2e-5, `lat ${la}`);
    assert.ok(Math.abs(points[0].lon - lo) < 2e-5, `lon ${lo}`);
  }
});

test('the LAD/LOD extension adds the fourth minute digit', () => {
  const p = [{ t: T0, lat: 48.123456, lon: 9.654321, gnss: 100 }, { t: T0 + 1, lat: 48.123456, lon: 9.654321, gnss: 100 }];
  const fine = parse(makeIgc(p, { ext: true })).points[0];
  assert.ok(Math.abs(fine.lat - 48.123456) < 2e-6 && Math.abs(fine.lon - 9.654321) < 2e-6, `${fine.lat} ${fine.lon}`);
});

test('time runs past midnight into the next day', () => {
  const start = Date.UTC(2026, 5, 20, 23, 59, 58) / 1000;
  const { points, meta } = parse(makeIgc(pts(6).map((p, i) => ({ ...p, t: start + i }))));
  assert.equal(points[5].t, start + 5);
  assert.ok(points.every((p, i) => i === 0 || p.t > points[i - 1].t), 'strictly increasing across midnight');
  assert.equal(meta.date, '2026-06-20');
});

test('both date header styles and CRLF / LF line ends', () => {
  for (const o of [{ dateStyle: 'old', eol: '\r\n' }, { dateStyle: 'new', eol: '\n' }]) {
    assert.equal(parse(makeIgc(pts(3), o)).meta.date, '2026-06-20');
  }
});

test('header fields: pilot, glider type and id, competition id; labels are stripped', () => {
  const { meta } = parse(makeIgc(pts(3), { pilot: 'Max Muster', gliderType: 'ASK 21', gliderId: 'D-7777', compId: 'XY' }));
  assert.deepEqual([meta.pilot, meta.gliderType, meta.gliderId, meta.compId, meta.compClass], ['Max Muster', 'ASK 21', 'D-7777', 'XY', '15M']);
});

test('pressure altitude is used for fixes without GNSS altitude', () => {
  const { points, meta } = parse(makeIgc(pts(4, { gnss: 0, press: 650, validity: 'V' })));
  assert.equal(points[0].ele, 650);
  assert.equal(meta.altitude, 'pressure');
  assert.equal(parse(makeIgc(pts(4))).meta.altitude, 'gnss');
});

test('negative altitudes survive', () => {
  const { points } = parse(makeIgc(pts(3, { gnss: -12, press: -12 })));
  assert.equal(points[0].ele, -12);
});

test('fixes without a position (0/0) and malformed B records are skipped', () => {
  const lines = makeIgc(pts(5)).replace(/\r\n/g, '\n').split('\n');
  lines.splice(8, 0, 'B1100030000000N00000000EA0000000000', 'B11000');
  assert.equal(parse(lines.join('\n')).points.length, 5);
});

test('errors carry codes', () => {
  const code = (fn) => { try { fn(); } catch (e) { assert.ok(e instanceof IgcError); return e.code; } return null; };
  assert.equal(code(() => parse('hello world, not a log')), 'notIgc');
  assert.equal(code(() => parse('AXXX\nHFDTE200626\n')), 'noFixes');
  assert.equal(code(() => parse(makeIgc(pts(3)).replace(/HFDTE\d+/, 'HFDTE999999'))), 'noDate');
  assert.equal(code(() => parse(makeIgc(pts(3)).replace(/HFDTE\d+\r\n/, ''))), 'noDate');
  assert.equal(code(() => parse(makeIgc(pts(1)))), 'fewFixes');
});

test('toGpx: well-formed GPX with one point per fix, metres and UTC times', () => {
  const { points } = parse(makeIgc(syntheticFlight({ seconds: 30 })));
  const gpx = toGpx(points, 'A & B <test>');
  assert.match(gpx, /^<\?xml/);
  assert.equal((gpx.match(/<trkpt /g) || []).length, 30);
  assert.match(gpx, /<name>A &amp; B &lt;test&gt;<\/name>/);
  assert.match(gpx, /<time>2026-06-20T11:00:00\.000Z<\/time>/);
});

test('prefill: competition id wins over glider id, ICAO type is the generic glider designator', () => {
  const m = parse(makeIgc(pts(3), { compId: 'XY' })).meta;
  assert.deepEqual(prefillFor(m), { icaoType: 'GLID', callsign: 'XY', model: 'ASW 20', nickname: 'Test Pilot' });
  assert.equal(prefillFor(parse(makeIgc(pts(3))).meta).callsign, 'D-1234');
  assert.equal('callsign' in prefillFor({ pilot: '', gliderType: '', gliderId: '', compId: '' }), false);
});
