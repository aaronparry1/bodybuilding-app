# Canonical Mesocycle Load Policy Evidence

The 16 supplied PDFs were verified in `/Users/aaronparry/Downloads/canonical-policy-source-corpus/` (sizes and page counts recorded in the certification artifact). They remain outside the repository and are not copied or committed.

This implementation intentionally adopts no source-derived numeric adjustment rule. The current policy exposes only repository-owned Mesocycle facts (loading modes, progression families, target envelopes, evidence-required flags, and drop-off response). Because a reliable page-level extraction of the supplied PDFs is not available in the execution environment, no numeric claim is attributed to a source page. Automatic increase/reduction therefore fails closed pending source review.

| Source | Page | Rule used | Applicable mode | Limitation | Policy field |
|---|---:|---|---|---|---|
| 01-Wendler-531-Manual.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 02-Vault-T-Nation.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 03-531-Football.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 04-Managing-the-Training-of-Weightlifters-0-112-allx.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 05-Zatsiorsky-Science-and-Practice.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 06-Fundamentals-of-Special-Strength-Training-in-Sport-Y.V.-Verkhoshansky-1977-1986-1-200x.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 07-WestsideforAthletes.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 08-Tier-System-Manual-Athletic-Based-Strength-Training.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 09-Weightlifting-Training-Database-Book.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 10-The-Poliquin-Principles.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 11-Pavel-Tsatsouline-Bullet-Proof-Abs-2.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 12-Mike-Mentzer-Heavy-Duty.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 13-Chad-Waterbury-s-Programs.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 14-Charles-Atlas-Bodybuilding-Course.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 15-Development-of-the-Russian-Conjugate-SS.pdf | not adopted | source inventory only | none | no page-level rule adopted | none |
| 16-Applied-Strongman-Training-for-Sport-POLIQUIN-and-McDERMOTT.pdf | not adopted | source inventory only | none | page count unavailable to local tooling; no rule adopted | none |

The resolver is consequently conservative: exact future loads remain owned by Session Construction, and all automatic load adjustment remains review-required until a source-backed numeric policy is approved.
