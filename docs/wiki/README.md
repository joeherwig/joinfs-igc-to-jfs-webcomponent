# Wiki sources

These pages are the wiki of the component. They live in the repository so they are versioned with the code. Links use the
GitHub wiki style (`[text](Page-Name)`, no extension): browse them in the wiki, not in this folder.

## Publish to the GitHub wiki

GitHub keeps a wiki in a separate repository (`<repo>.wiki.git`) that exists after the first page has been created in the
web interface (enable the wiki under Settings, then "Create the first page" on the Wiki tab).

```sh
git clone git@github.com:joeherwig/joinfs-igc-to-jfs-webcomponent.wiki.git ../joinfs-igc-to-jfs-webcomponent.wiki
cp docs/wiki/*.md ../joinfs-igc-to-jfs-webcomponent.wiki/
cp -r docs/wiki/images ../joinfs-igc-to-jfs-webcomponent.wiki/
rm ../joinfs-igc-to-jfs-webcomponent.wiki/README.md
cd ../joinfs-igc-to-jfs-webcomponent.wiki && git add -A && git commit -m "Update wiki" && git push
```

The screenshots were taken from `demo/index.html` with the synthetic `demo/sample.igc`.
