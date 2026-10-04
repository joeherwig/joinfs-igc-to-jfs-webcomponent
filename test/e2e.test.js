'use strict';
// IGC -> GPX -> the real GPX converter. Needs joinfs-gpx-to-jfs: set JOINFS_GPX_CONVERTER to its src folder, or keep the
// repositories side by side (../joinfs-gpx-to-jfs-webcomponent). Without it the tests are skipped, not failed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { parse, toGpx } = require('../src/joinfs-igc-to-jfs.js');
const { makeIgc, syntheticFlight } = require('./helpers/igc.cjs');

const root = process.env.JOINFS_GPX_CONVERTER
  ? path.resolve(process.env.JOINFS_GPX_CONVERTER, '..')
  : path.resolve(__dirname, '..', '..', 'joinfs-gpx-to-jfs-webcomponent');
const script = path.join(root, 'src', 'joinfs-gpx-to-jfs.js');
const available = fs.existsSync(script);

let Gpx2Jfs, DOMParser;
if (available) {
  Gpx2Jfs = require(script);
  DOMParser = createRequire(path.join(root, 'package.json'))('@xmldom/xmldom').DOMParser;
}

class Quiet extends (DOMParser || Object) { constructor() { super({ onError() {} }); } }

test('an IGC flight converts to a JoinFS recording through the GPX converter', { skip: !available && 'joinfs-gpx-to-jfs not found' }, () => {
  const { points, meta } = parse(makeIgc(syntheticFlight({ seconds: 600 }), { compId: 'XY' }));
  const { data, info } = Gpx2Jfs.convert(toGpx(points, 'test'), { icaoType: 'GLID', callsign: 'XY', model: meta.gliderType, typerole: 5 }, Quiet);
  assert.ok(data.length > 1000);
  assert.equal(info.inputPoints, 600);
  assert.ok(Math.abs(info.durationS - 599) < 1.5, `duration ${info.durationS}`);
  assert.ok(info.maxAltM > 1500, `max altitude ${info.maxAltM}`);
  assert.ok(info.distanceKm > 1, `distance ${info.distanceKm}`);
});

test('the GPX handed to the converter does not trigger its "lost a digit" advisory', { skip: !available && 'joinfs-gpx-to-jfs not found' }, () => {
  const { points } = parse(makeIgc(syntheticFlight({ seconds: 300 })));
  assert.ok(points.every((p) => Number.isInteger(p.ele)), 'IGC altitudes are whole metres');
  const parsed = Gpx2Jfs.parseGpx(toGpx(points, 'x'), Quiet);
  assert.equal(Gpx2Jfs.elevationLooksScaled(parsed.pts), false);
  assert.ok(Math.abs(parsed.pts[100].ele - points[100].ele) < 0.03, 'the dither stays far below the log resolution');
});
