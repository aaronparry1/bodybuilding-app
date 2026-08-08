# Supplied-source extraction and OCR report

## Scope and method

The 16 requested binaries were inspected in place at `/Users/aaronparry/Downloads/canonical-policy-source-corpus/`; no source PDF was copied into the repository or changed. Baseline commit `411d9f6` correctly recorded that they were absent from `project_sources/` at that time.

For every parseable file the pass recorded byte size, metadata, logical page count, per-page native-text yield and pages with fewer than 20 or at least 100 extracted characters. Beginning, middle and end pages were rasterised and visually inspected. For image-only and mixed files, representative pages plus contents/claim pages were OCR'd with Apple Vision (`accurate`, `en-US`, language correction) and checked against page renders. OCR is a navigation aid, not authoritative transcription; cited claims were visually checked on the rendered PDF page.

## Results

| # | Bytes | Logical pages | Native characters | Pages >=100 chars | Pages <20 chars | Result |
|---:|---:|---:|---:|---:|---:|---|
| 1 | 7,716,370 | 97 | 104,842 | 87 | 5 | native text, readable |
| 2 | 26,195,848 | 200 | 263,124 | 183 | 2 | native text, readable |
| 3 | 514,379 | 169 | 177,221 | 166 | 2 | native text, readable |
| 4 | 5,493,335 | 130 | 0 | 0 | 130 | image-only; OCR required |
| 5 | 36,016,663 | 247 | 56 | 0 | 246 | image-only; OCR required |
| 6 | 7,954,121 | 207 | 0 | 0 | 207 | image-only; OCR required |
| 7 | 537,448 | 32 | 13,745 | 32 | 0 | native text/slides, readable |
| 8 | 5,383,428 | 251 | 344,618 | 232 | 1 | native text, readable |
| 9 | 5,930,984 | 239 | 192,639 | 178 | 60 | mixed text/image |
| 10 | 80,471,953 | 66 | 0 | 0 | 66 | image-only; damaged page tree; OCR required |
| 11 | 2,343,023 | 65 | 95,814 | 55 | 8 | mixed/native; damaged page tree |
| 12 | 761,776 | 43 | 0 | 0 | 43 | image-only; OCR required |
| 13 | 820,441 | 33 | 86,436 | 30 | 0 | native text, readable |
| 14 | 4,183,385 | 91 | 215,812 | 88 | 0 | native text, readable |
| 15 | 558,036 | 40 | 72,563 | 40 | 0 | native text, readable |
| 16 | 15,159,296 (earlier external binary) | — | — | — | — | earlier binary corrupt; no usable repository replacement inspected |

Usable total: **1,910 logical pages across 15 files**. Counts use the PDF page number, beginning at 1, rather than printed folio numbers. Sources 10 and 11 contain broken cross-reference/page-tree structures: Poppler reports 139 and 134 pages respectively, while stable logical traversal yields 66 and 65. Claims cite the stable logical PDF page. The earlier external Source 16 binary produced invalid cross-reference, missing `endstream` and null top-level pages errors; independent attempts with `pypdf`, Poppler and Apple PDFKit all failed. No usable replacement was available in this repository workspace, so no later page, render or OCR claim is made.

## OCR quality and limits

Representative text-bearing samples usually produced high recognition confidence (approximately 0.97–1.00), including tables and body text. Confidence and completeness fell on bilingual covers, photographs, rotated pages and dense diagrams; source 9 has image pages with no text to recover. Accordingly:

- OCR-derived wording was not copied verbatim into product content.
- Page candidates were confirmed visually before inclusion.
- Tables, formulae, load prescriptions and unusual proper nouns require a second human transcription check before quotation or data entry.
- This was a targeted claim-extraction pass, not an assertion that every line on every image-only page was exhaustively OCR'd.
- Source 16 cannot be inferred from similarly titled copies. It remains an optional low-priority future supplement, not a current completion gate.

## Reproducibility boundary

The PDFs are not checked into the repository, so another reviewer needs the same corpus (or approved replacements) to reproduce page-level inspection. The reports preserve filenames, logical page locations, extraction status and limitations without reproducing copyrighted pages.
