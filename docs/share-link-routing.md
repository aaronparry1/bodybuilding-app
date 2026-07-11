# Share Link Routing

## Why The Image Is Not Enough

Adaptive Strength Coach share cards are image-first because progress should look polished when shared. Most social platforms do not make the image itself clickable, so every share payload also includes a caption/text fallback with a stable download link:

`https://adaptivestrengthcoach.com/download`

The image carries the achievement. The text carries the clickable route back to the app.

## Smart Link Behaviour

The `/download` URL should be the permanent public link used in PR cards, strength progress cards, powerlifting total cards, and workout summary cards.

Expected website behaviour:

- iPhone or iPad: redirect to the App Store listing when the final URL is available.
- Android: redirect to the Google Play listing when the final URL is available.
- Desktop or unknown device: show a landing page with both store buttons.
- If the app is installed and universal/app links are configured by the store/domain files, open the app where possible.

## App Store And Play Store URLs

The app keeps store URLs configurable rather than hardcoding fake listings:

- `APP_STORE_URL`
- `GOOGLE_PLAY_URL`
- `APP_DOWNLOAD_URL`

Until final store URLs are available, shared cards should continue using the stable `/download` URL.

## Universal Links And Android App Links

The app config includes safe plumbing for future app links:

- iOS Associated Domain: `applinks:adaptivestrengthcoach.com`
- Android verified intent filter: `https://adaptivestrengthcoach.com/download`

The website still needs the matching platform files before these links can fully verify:

- iOS: `https://adaptivestrengthcoach.com/.well-known/apple-app-site-association`
- Android: `https://adaptivestrengthcoach.com/.well-known/assetlinks.json`

Those files must use the final production bundle/package identifiers and signing fingerprints.

## Firebase Dynamic Links

Do not use Firebase Dynamic Links. It has been shut down and should not be part of the routing strategy.

## Required Website Implementation

The `/download` page should:

1. Detect platform from user agent.
2. Redirect iPhone/iPad users to the App Store URL when configured.
3. Redirect Android users to the Google Play URL when configured.
4. Fall back to a branded landing page with both store buttons.
5. Keep the URL stable even if store listings change later.
6. Avoid collecting sensitive training data from share links.

This keeps share cards simple, durable, and promotional without requiring social accounts, community features, or personal data.
