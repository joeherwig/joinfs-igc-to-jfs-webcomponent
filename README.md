# joinfs-igc-to-jfs

A web component that turns **IGC glider flight logs** into **JoinFS recordings** (`.jfs`) in the browser, so a real
soaring flight can be replayed in JoinFS. Nothing is uploaded.

It is a thin wrapper around [joinfs-gpx-to-jfs](https://github.com/joeherwig/joinfs-gpx-to-jfs-webcomponent): the
IGC file is parsed here, handed to the GPX converter as a track, and the form is prefilled from the IGC header. The
conversion itself (ground contact, attitude, gear, flaps, lights) is done by the GPX converter, so there is one engine.

![The converter after dropping an IGC file: flight summary, prefilled form, Convert button](docs/screenshots/demo-loaded.png)

The same in German on a dark page (the language follows the `lang` attribute or the browser):

![German, dark](docs/screenshots/demo-loaded-de-dark.png)

More in the [wiki sources](docs/wiki/Home.md): how to use it, embedding, IGC details, languages.

## Use

```html
<script src="joinfs-gpx-to-jfs.js"></script>   <!-- peer dependency; or let converter-src load it -->
<script src="joinfs-igc-to-jfs.js"></script>
<joinfs-igc-to-jfs></joinfs-igc-to-jfs>
<script>
  document.querySelector('joinfs-igc-to-jfs').addEventListener('converted', (e) => {
    // e.detail: { info, blob, filename };  e.detail.info.igc = { pilot, gliderType, gliderId, compId, date, fixes, durationS, ... }
  });
</script>
```

The user drops an IGC file (or chooses one); a summary of the flight appears with the converter's form below it. Press
Convert and the `.jfs` is offered for download and announced in the `converted` event.

### Prefill from the IGC header

| Form field | Taken from |
|---|---|
| Callsign | competition id (`HFCID`), else glider id (`HFGID`) |
| Model | glider type (`HFGTY`) |
| Nickname | pilot (`HFPLT`) |
| ICAO type | `GLID` (the generic glider designator); editable, e.g. `AS21` |
| Aircraft category | glider (not asked) |

### Attributes

| Attribute | Meaning |
|---|---|
| `lang` | force a language (observed; see Languages) |
| `converter-src` | URL of `joinfs-gpx-to-jfs.js` if the element is not defined yet (default: next to this script) |
| `locale-base` | folder of the locale files (default: the folder of this script) |
| `build` | `fs2024` or `other`: **presets the target format and hides that question**. An embedding application that decides the format itself sets this; standalone, leave it out and the converter asks |
| `hz`, `systems`, `typerole`, `elevation-scale`, `altitude-offset`, `smooth-pos`, `ground-clearance`, `controls`, `no-url-params`, `auto-convert` | forwarded to `<joinfs-gpx-to-jfs>` (see its README) |

### API and events

- `loadFile(file)` returns a promise; it is what the picker and the drop area call, and what an embedding application
  calls with a file the user already chose.
- `converted`: `detail { info, blob, filename }`, `info.igc` holds the flight header and statistics.
- `igc-error`: `detail { code, message }` (codes: `notIgc`, `noDate`, `noFixes`, `fewFixes`, `tooLarge`, `read`, `noConverter`).

### The parser on its own

`JoinfsIgc.parse(text)` returns `{ points: [{ t, lat, lon, ele }], meta, warnings }` and `JoinfsIgc.toGpx(points, name)` a
GPX 1.1 string. It reads the B records (UTC time, past midnight too; GNSS altitude, pressure altitude for 2D fixes;
the `LAD`/`LOD` precision extensions), the date (`HFDTE`, both header styles) and the pilot, glider and competition
headers. Spec: <https://xp-soaring.github.io/igc_file_format/>.

## Languages

English is built into the script. Every other language is a JSON file next to the script, named
`joinfs-igc-to-jfs-<locale>.json`: `de`, `es`, `fr`, `it`, `ko`, `nl`, `pt`, `uk` (the languages JoinFS ships, plus
Ukrainian). The files are fetched lazily, once per language, relative to the script's own URL; if a file cannot be
loaded the console says so and the component continues in English.

- **Choosing:** the element's `lang` attribute (observed, can change at runtime), else the browser's languages
  (`navigator.languages`), else English. `de-AT` counts as `de`, `pt-BR` as `pt`. The component does not read the URL; the
  demo page maps `?lang=` onto the attribute.
- **Hosting:** keep the JSON files in the same folder as `joinfs-igc-to-jfs.js`, or point `locale-base` at their folder.
- **Adding a language:** copy `src/joinfs-igc-to-jfs-de.json`, translate the values (keep keys and `{placeholders}`), add the
  code to `SUPPORTED` in the script and to `LOCALES` in `test/locales.test.js`. The locale test checks that every file
  has exactly the English keys and placeholders. The German texts use the informal "du"; the other translations are first
  drafts, corrections are welcome. (The files are generated from `tools/make-locales.cjs`.)

The dialog of the wrapped GPX converter follows the same `lang`.

## Development

```sh
npm test            # parser, locale parity, and (if the GPX converter is next to this repo) IGC -> JFS end to end
npm run sample      # regenerates demo/sample.igc (synthetic flight, no real data)
```

The demo (`demo/index.html`) expects this repository and `joinfs-gpx-to-jfs-webcomponent` side by side; serve their common
parent folder and open `/joinfs-igc-to-jfs-webcomponent/demo/`. Tests find the GPX converter in the sibling folder or at
`JOINFS_GPX_CONVERTER` (path to its `src`).

## License

[CC BY-NC-SA 4.0](LICENSE), like the GPX converter. See [NOTICE.md](NOTICE.md).
