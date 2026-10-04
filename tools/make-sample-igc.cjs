'use strict';
// Regenerates demo/sample.igc: a synthetic 40 minute glider flight (not real data). Run: node tools/make-sample-igc.cjs
const fs = require('fs');
const path = require('path');
const { makeIgc, syntheticFlight } = require('../test/helpers/igc.cjs');

const out = path.join(__dirname, '..', 'demo', 'sample.igc');
fs.writeFileSync(out, makeIgc(syntheticFlight(), { pilot: 'Sample Pilot', gliderType: 'ASW 20', gliderId: 'D-1234', compId: 'SY' }));
console.log('wrote', out);
