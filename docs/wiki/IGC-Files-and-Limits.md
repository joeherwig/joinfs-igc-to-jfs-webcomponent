# IGC Files and Limits

The component reads IGC flight logs as described in the
[IGC file format guide](https://xp-soaring.github.io/igc_file_format/). Only what a replay needs is used.

## What is read

| IGC record | Used for |
|---|---|
| **B** (fix) | UTC time, latitude, longitude, altitude |
| **I** with `LAD` / `LOD` | extra digits of the minutes, for a more precise position |
| **HFDTE** (both `HFDTE020115` and `HFDTEDATE:020115,01`) | the date of the flight |
| **HFPLT** | pilot name |
| **HFGTY** | glider type |
| **HFGID** | glider id (registration) |
| **HFCID** | competition id |
| **HFCCL** | competition class |
| everything else (C task, E events, F satellites, K, G signature, ...) | ignored |

## How fixes are turned into a track

- **Time** is UTC. A flight that continues past midnight keeps counting up.
- **Altitude:** the GNSS altitude is used. Fixes without one (2D fixes) fall back to the pressure altitude, and the summary
  says so if that applies to most of the flight.
- Fixes at position 0/0 (no GPS fix yet) and malformed `B` lines are skipped.
- A flight needs at least two fixes.
- IGC altitudes are whole metres. The component adds a deterministic +-2 cm dither when it hands the track to the GPX
  converter, far below the resolution of the log, so that the converter's "this track lost a digit" check (which looks for
  elevations that are all exact multiples of 0.1 m) does not fire on every IGC file.

## Aircraft data

| JoinFS field | Value |
|---|---|
| ICAO type | `GLID`, editable |
| Callsign | competition id, else glider id |
| Model title | glider type |
| Nickname | pilot |
| Category | glider |

## Limits

- **One flight per file.** If a file holds several, they are read as one track.
- **IGC files are not validated.** The G record (security signature) is not checked; this is a replay tool, not a
  competition scorer.
- **No task, turn points or events** in the recording: only the flight path.
- **Size:** files over 30 MB are refused.
- **Errors** are shown in plain language and as an `igc-error` event: not an IGC file, no date, no fixes, too few fixes.
- Everything the GPX converter cannot do, this cannot do either (for example no ICAO type guessing from the glider type).
