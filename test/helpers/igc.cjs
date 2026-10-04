'use strict';
// Builds IGC text for tests, the demo and the sample generator. Synthetic data only.

const pad = (n, w) => String(Math.abs(Math.round(n))).padStart(w, '0');

/** Decimal degrees -> "DDMMmmm" + hemisphere (and the optional 4th minute digit for the LAD/LOD extensions). */
function lat(deg, extra) {
  const a = Math.abs(deg), d = Math.floor(a), min = (a - d) * 60;
  const thousandths = Math.floor(min * (extra ? 10000 : 1000) + 1e-6);
  const mm = Math.floor(thousandths / (extra ? 10000 : 1000)), frac = thousandths % (extra ? 10000 : 1000);
  return { text: pad(d, 2) + pad(mm, 2) + pad(extra ? Math.floor(frac / 10) : frac, 3) + (deg < 0 ? 'S' : 'N'), extra: extra ? String(frac % 10) : '' };
}
function lon(deg, extra) {
  const a = Math.abs(deg), d = Math.floor(a), min = (a - d) * 60;
  const thousandths = Math.floor(min * (extra ? 10000 : 1000) + 1e-6);
  const mm = Math.floor(thousandths / (extra ? 10000 : 1000)), frac = thousandths % (extra ? 10000 : 1000);
  return { text: pad(d, 3) + pad(mm, 2) + pad(extra ? Math.floor(frac / 10) : frac, 3) + (deg < 0 ? 'W' : 'E'), extra: extra ? String(frac % 10) : '' };
}

/**
 * points: [{ t (epoch s, UTC), lat, lon, gnss, press }]. Options: header overrides, `ext` (adds the LAD/LOD precision
 * extension), `eol`, `dateStyle` ('old' = HFDTE020115, 'new' = HFDTEDATE:020115,01).
 */
function makeIgc(points, o = {}) {
  const eol = o.eol || '\r\n';
  const d = new Date(points[0].t * 1000);
  const ddmmyy = pad(d.getUTCDate(), 2) + pad(d.getUTCMonth() + 1, 2) + pad(d.getUTCFullYear() % 100, 2);
  const lines = ['AXXXSYN synthetic test flight'];
  lines.push(o.dateStyle === 'new' ? `HFDTEDATE:${ddmmyy},01` : `HFDTE${ddmmyy}`);
  lines.push(`HFPLTPILOTINCHARGE:${o.pilot === undefined ? 'Test Pilot' : o.pilot}`);
  lines.push(`HFGTYGLIDERTYPE:${o.gliderType === undefined ? 'ASW 20' : o.gliderType}`);
  lines.push(`HFGIDGLIDERID:${o.gliderId === undefined ? 'D-1234' : o.gliderId}`);
  if (o.compId !== undefined) lines.push(`HFCIDCOMPETITIONID:${o.compId}`);
  lines.push('HFCCLCOMPETITIONCLASS:15M');
  if (o.ext) lines.push('I023636LAD3737LOD');
  for (const p of points) {
    const s = new Date(p.t * 1000);
    const la = lat(p.lat, o.ext), lo = lon(p.lon, o.ext);
    const gnss = p.gnss === undefined ? 0 : p.gnss, press = p.press === undefined ? gnss : p.press;
    const alt = (v) => (v < 0 ? '-' + pad(v, 4) : pad(v, 5));
    lines.push(`B${pad(s.getUTCHours(), 2)}${pad(s.getUTCMinutes(), 2)}${pad(s.getUTCSeconds(), 2)}${la.text}${lo.text}${p.validity || 'A'}${alt(press)}${alt(gnss)}${o.ext ? la.extra + lo.extra : ''}`);
  }
  lines.push('LXXXSYN end of synthetic flight', '');
  return lines.join(eol);
}

/** A ~40 minute synthetic glider flight: tow climb, ridge soaring in circles, a long glide. 1 Hz. */
function syntheticFlight({ lat0 = 48.55, lon0 = 9.45, t0 = Date.UTC(2026, 5, 20, 11, 0, 0) / 1000, seconds = 2400 } = {}) {
  const pts = [];
  for (let i = 0; i < seconds; i++) {
    const phase = i / seconds;
    const r = 0.012 + 0.006 * Math.sin(phase * 6);
    const ang = phase * 14 * Math.PI;                              // seven circles around the thermal
    const alt = 700 + 1400 * Math.sin(Math.min(1, phase * 1.6) * Math.PI / 2) - 900 * Math.max(0, phase - 0.7);
    pts.push({ t: t0 + i, lat: lat0 + r * Math.sin(ang) + phase * 0.05, lon: lon0 + r * 1.4 * Math.cos(ang) + phase * 0.08, gnss: Math.round(alt), press: Math.round(alt - 15) });
  }
  return pts;
}

module.exports = { makeIgc, syntheticFlight };
