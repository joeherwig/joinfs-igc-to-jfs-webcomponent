# Changelog

## 0.1.0

First version.

- IGC parser: B records with UTC time (also past midnight), all four hemispheres, GNSS altitude with pressure altitude for
  2D fixes, the `LAD`/`LOD` precision extensions, both `HFDTE` styles, pilot, glider and competition headers.
- `<joinfs-igc-to-jfs>`: wraps `<joinfs-gpx-to-jfs>`, prefills callsign, model, nickname and ICAO type (`GLID`) from the
  header, shows a flight summary, forwards the converter's attributes, and fires `converted` with `info.igc`.
- A preset `build` attribute hides the target-format question for embedding applications; standalone the converter asks.
- Languages: English built in; `de`, `es`, `fr`, `it`, `ko`, `nl`, `pt`, `uk` as JSON files; `lang` attribute.
