# Local PDF resources

The task protocol export runs entirely in the browser. Both scripts are loaded
from this app's origin with the existing application scripts. Once loaded,
exporting does not need a network connection. No task text is sent to an
external service.

- `jspdf.umd.min.js`: jsPDF 4.2.1, MIT license (included in the file).
  Upstream: https://github.com/parallax/jsPDF/tree/v4.2.1
  Download: https://raw.githubusercontent.com/parallax/jsPDF/v4.2.1/dist/jspdf.umd.min.js
- `liberation-sans.js`: unmodified Liberation Sans Regular and Bold TTF files,
  embedded as base64 for local/offline loading. Copied from the bundled
  `pdfjs-dist/standard_fonts` distribution. SIL Open Font License 1.1;
  see `LICENSE-LiberationSans.txt`.

The embedded font supports German umlauts, ß, accented Latin text, Greek,
Cyrillic and common typographic symbols. Characters absent from its glyph set
(for example some emoji or CJK characters) are preserved as explicit `[U+…]`
codes with a note in the PDF, instead of disappearing or aborting the export.
The original task content is never modified.
