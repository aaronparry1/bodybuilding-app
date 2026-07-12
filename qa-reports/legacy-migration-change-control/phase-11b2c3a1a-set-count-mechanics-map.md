# Set-count mechanics map

`shiftRecommendedSetRange` currently shifts both recommended endpoints by `delta`, clamps positive movement at the prescription hard/soft cap and negative movement at ten, normalises through `withSetPrescription`, and may lower required sets on reduction. C3A1A introduces an unintegrated primitive set-count calculator only; range normalization and caller routing remain C3A1C/D because they require existing prescription context.
