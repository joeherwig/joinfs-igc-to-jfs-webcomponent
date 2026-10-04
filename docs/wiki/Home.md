# joinfs-igc-to-jfs

Turn an **IGC glider flight log** into a **JoinFS recording** (`.jfs`), in your browser, so a real soaring flight can be
replayed in JoinFS. Nothing is uploaded.

![The converter with a loaded IGC file](images/demo-loaded.png)

## What you get

- A flight summary (pilot, glider, date, number of fixes, duration) as soon as you drop the file.
- A form that is **already filled in from the IGC header**: callsign, model, pilot name, ICAO type `GLID`, category glider.
- The recording with ground contact, attitude, gear, flaps and lights derived like for any GPX track.
- Works as a stand-alone page or embedded in another application, in 9 languages.

It is a thin wrapper around [joinfs-gpx-to-jfs](https://github.com/joeherwig/joinfs-gpx-to-jfs-webcomponent): the IGC file
is read here, handed to the GPX converter as a track, and the GPX converter does the conversion. One engine, one set of
behaviour.

## Pages

| I want to... | Read |
|---|---|
| convert a flight | [Using the Converter](Using-the-Converter) |
| put the component on my own page or app | [Embedding in a Page](Embedding-in-a-Page) |
| know what is read from an IGC file and what is not | [IGC Files and Limits](IGC-Files-and-Limits) |
| change or add a language | [Languages](Languages) |

## In the JoinFS Recording Toolkit

The [JoinFS Recording Toolkit](https://github.com/joeherwig/JoinFS-recording-toolkit) uses this component through its `igc`
plugin: drop a `.igc` file onto the toolkit and the same dialog opens, the result becomes a track next to your other
recordings. There the target-format question is skipped, because the toolkit decides it when saving.

## License

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International.
