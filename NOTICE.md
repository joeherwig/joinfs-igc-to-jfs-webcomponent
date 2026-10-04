# Third-party notices

## IGC file format

The IGC flight-recorder format is specified by the FAI/IGC; this component implements a reader for the subset needed to
replay a flight (header, fixes, fix extensions for position precision). A readable description of the format is at
<https://xp-soaring.github.io/igc_file_format/>.

## joinfs-gpx-to-jfs

The conversion to the JoinFS recording layout is done by
[joinfs-gpx-to-jfs-webcomponent](https://github.com/joeherwig/joinfs-gpx-to-jfs-webcomponent), which this component wraps
and which is licensed under the same terms. See its `NOTICE.md` for the JoinFS notice (MIT) that applies to the `.jfs`
layout.

This project is an independent tool. It is not part of, endorsed by or affiliated with JoinFS, the FAI/IGC or their
contributors. "JoinFS" and other product names belong to their respective owners.
