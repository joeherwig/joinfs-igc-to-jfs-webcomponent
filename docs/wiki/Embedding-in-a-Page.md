# Embedding in a Page

## Minimal page

```html
<script src="joinfs-gpx-to-jfs.js"></script>   <!-- peer dependency -->
<script src="joinfs-igc-to-jfs.js"></script>
<joinfs-igc-to-jfs></joinfs-igc-to-jfs>

<script>
  document.querySelector('joinfs-igc-to-jfs').addEventListener('converted', (e) => {
    // e.detail: { info, blob, filename }
    // e.detail.info.igc: { pilot, gliderType, gliderId, compId, compClass, date, fixes, durationS, altitude }
  });
</script>
```

The component needs [joinfs-gpx-to-jfs](https://github.com/joeherwig/joinfs-gpx-to-jfs-webcomponent). Either include its script
first, or let the IGC component load it: it fetches `converter-src`, by default `joinfs-gpx-to-jfs.js` next to its own script.
If neither works the dialog says the GPX converter could not be loaded.

Keep the locale files (`joinfs-igc-to-jfs-<locale>.json`) in the same folder as the script, or point `locale-base` at their
folder. See [Languages](Languages).

## Attributes

| Attribute | Meaning |
|---|---|
| `lang` | force a language; observed, so changing it re-renders the component |
| `converter-src` | URL of `joinfs-gpx-to-jfs.js` if it is not defined yet |
| `locale-base` | folder of the locale files (default: the folder of the script) |
| `build` | `fs2024` or `other`. **Presets the target format and hides that question.** An application that decides the format itself sets it; for a stand-alone page leave it out and the converter asks |
| `hz`, `systems`, `typerole`, `elevation-scale`, `altitude-offset`, `smooth-pos`, `ground-clearance`, `controls`, `no-url-params`, `auto-convert` | passed on to the GPX converter, see its README. `typerole` defaults to `glider` |

## Methods and events

- **`loadFile(file)`** returns a promise. It is what the picker and the drop area call. Use it when your page already has the
  file (for example from its own drop handler): the user then does not choose it twice.
- **`converted`** (bubbles, composed): `detail { info, blob, filename }`; `info` is the GPX converter's info plus `info.igc`.
- **`igc-error`**: `detail { code, message }`; codes `notIgc`, `noDate`, `noFixes`, `fewFixes`, `tooLarge`, `read`,
  `noConverter`. The component also shows the message itself.

## The parser alone

`JoinfsIgc` is available as a global (and `module.exports` in Node):

```js
const { points, meta } = JoinfsIgc.parse(igcText);   // points: [{ t (epoch s, UTC), lat, lon, ele }]
const gpx = JoinfsIgc.toGpx(points, 'My flight');    // GPX 1.1 text
const form = JoinfsIgc.prefillFor(meta);             // { icaoType, callsign?, model?, nickname? }
```

`parse` throws `IgcError` with a `code` (see above). Details of what is read: [IGC Files and Limits](IGC-Files-and-Limits).

## How the form gets prefilled

The GPX converter takes its form defaults from the preferences stored under its `storage-key`. For every file the wrapper
stores the values under a private key, starts the converter with that key, and removes it afterwards, so only the wanted
fields are prefilled (a preset `build` stays hidden) and nothing lingers in the browser. Without usable storage the values are
passed as attributes and the form then shows every field, including the build.

## Run the demo

The demo expects this repository and `joinfs-gpx-to-jfs-webcomponent` side by side. Serve their common parent folder with any
static file server and open `/joinfs-igc-to-jfs-webcomponent/demo/`; `?lang=de` forces German. `demo/sample.igc` is a
synthetic flight (no real data).
