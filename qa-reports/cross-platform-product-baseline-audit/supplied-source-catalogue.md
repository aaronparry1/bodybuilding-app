# Supplied source catalogue

## Status and provenance

At repository baseline commit `411d9f6`, `project_sources/` did not exist and none of the requested files was available in the repository. That remains the historical truth recorded by the original audit. The later supplemental pass found the exact 16 filenames, outside the repository, at `/Users/aaronparry/Downloads/canonical-policy-source-corpus/`. The files were inspected in place and were not copied into version control. [directly verified]

Result: **15/16 historical sources were inspected; Source 16 remains unresolved but is not a product or audit-completion blocker.** Across the inspected set there are 1,910 usable logical PDF pages. Five files require OCR, two have mixed text/image coverage, and two have damaged page trees for which Poppler's nominal page count is inflated; the catalogue uses the stable logical page count returned by `pypdf`. Extraction details and the sampling method are in `supplied-source-extraction-and-ocr-report.md`.

| # | Exact filename | Usable pages | Extraction class | Evidence/use class | Inspection result |
|---:|---|---:|---|---|---|
| 1 | `01-Wendler-531-Manual.pdf` | 97 | native text | coach-authored commercial programme manual | inspected; page-attributable methods available |
| 2 | `02-Vault-T-Nation.pdf` | 200 | native text | commercial article compilation; uncertain editorial provenance | inspected; definitions/inspiration only |
| 3 | `03-531-Football.pdf` | 169 | native text | coach-authored sport programme manual | inspected; methods and heuristics available |
| 4 | `04-Managing-the-Training-of-Weightlifters-0-112-allx.pdf` | 130 | image-only/OCR required | foundational historical coach-science text/translation | inspected by rendered-page OCR samples |
| 5 | `05-Zatsiorsky-Science-and-Practice.pdf` | 247 | image-only/OCR required | foundational academic textbook | inspected by rendered-page OCR samples |
| 6 | `06-Fundamentals-of-Special-Strength-Training-in-Sport-Y.V.-Verkhoshansky-1977-1986-1-200x.pdf` | 207 | image-only/OCR required | foundational historical coach-science text | inspected by rendered-page OCR samples |
| 7 | `07-WestsideforAthletes.pdf` | 32 | native text | coach-authored system/slides | inspected; method definitions available |
| 8 | `08-Tier-System-Manual-Athletic-Based-Strength-Training.pdf` | 251 | native text | coach-authored system/manual | inspected; programme architecture available |
| 9 | `09-Weightlifting-Training-Database-Book.pdf` | 239 | mixed | commercial exercise/routine database compilation | inspected; weak provenance and many image pages |
| 10 | `10-The-Poliquin-Principles.pdf` | 66 | image-only/OCR required; damaged page tree | historical coach-authored commercial manual | inspected on 66 stable logical pages; Poppler reports 139 |
| 11 | `11-Pavel-Tsatsouline-Bullet-Proof-Abs-2.pdf` | 65 | mixed/native; damaged page tree | historical commercial programme manual | inspected on 65 stable logical pages; Poppler reports 134 |
| 12 | `12-Mike-Mentzer-Heavy-Duty.pdf` | 43 | image-only/OCR required | historical commercial/opinion-led system | inspected by rendered-page OCR samples |
| 13 | `13-Chad-Waterbury-s-Programs.pdf` | 33 | native text | coach-authored programme compilation | inspected; routine examples only |
| 14 | `14-Charles-Atlas-Bodybuilding-Course.pdf` | 91 | native text | historical commercial course | inspected; historical/product inspiration only |
| 15 | `15-Development-of-the-Russian-Conjugate-SS.pdf` | 40 | native text | historical secondary thesis/coach-science synthesis | inspected; explanation and architecture only |
| 16 | `16-Applied-Strongman-Training-for-Sport-POLIQUIN-and-McDERMOTT.pdf` | — | unresolved; earlier binary corrupt | coach-authored commercial sport system; exact contents unverified; current mission relevance low | not reviewed: the earlier external binary was unreadable and the described usable replacement was not available in this repository workspace |

These are deliberately multi-label classifications. The set contains no contemporary systematic review, meta-analysis, consensus statement or clinical guideline. A manual's specificity and practical utility do not elevate it above peer-reviewed evidence, and title/author reputation is not a substitute for claim-level appraisal.

## Unresolved low-priority supplement

Source 16 may be reviewed later only if a clean exact edition, identity and permission are available. Search results suggesting a similarly titled 121-page copy and preliminary owner observations were not treated as inspected evidence and generated no claims. Because strongman-sport preparation is outside the locked product mission, this is a **low-priority unresolved supplementary-source item, not a gate** for product scope, evidence planning or reliability work. The truthful completion state is 15 historical sources reviewed and Source 16 unresolved.
