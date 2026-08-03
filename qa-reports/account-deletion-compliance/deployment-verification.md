# Public deployment verification

Verified: 2026-08-03 (Europe/London)

## Deployment

- Hosting project: Railway `adaptive-strength-coach-site`
- Production service: `adaptive-strength-coach-site`
- Successful deployment: `58b9af04-73db-4061-a0d3-88c75e5a183a`
- Image digest: `sha256:4f5ed61f6f9d92e08e09d6d95050cf236468898a9a43a4ba09b5f0e77321df8c`
- Deployment status: `SUCCESS`
- Canonical URL: `https://adaptivestrengthcoach.com/delete-account/`

The first successful restoration deployment was `d2e60f8f-2734-4a96-911e-e4a06414da54`. Real WebKit form submission then exposed an opaque-origin compatibility failure. Commit `430ad4d` narrowly accepts `Origin: null` only when `Sec-Fetch-Site: same-origin` and the forwarded/actual Host equals the configured canonical host. The deployment above contains that correction.

## Public HTTP and TLS evidence

| Check | Result |
|---|---|
| `curl -I https://adaptivestrengthcoach.com/delete-account/` | HTTP/2 200 |
| `curl -IL https://adaptivestrengthcoach.com/delete-account/` | HTTP/2 200; no redirect |
| `curl -IL https://adaptivestrengthcoach.com/delete-account` | HTTP/2 200; no redirect |
| `https://adaptivestrengthcoach.com/privacy/` | HTTP/2 200 |
| Unknown synthetic email POST | HTTP/2 202; generic response; address not reflected |
| TLS hostname | `CN=adaptivestrengthcoach.com` |
| TLS issuer | Let's Encrypt `YE1` |
| Certificate validity observed | 2026-06-23 through 2026-09-21 |
| Bot/login challenge | None observed with curl, Chromium or mobile WebKit |
| Redirect loop | None |

The response includes CSP, HSTS, no-referrer, no-sniff and frame-denial headers. HTML inspection found the exact account-deletion title, Adaptive Strength Coach, Arx Algorithms, the POST request form, data categories and Privacy Policy link. It did not contain a secret, submitted address or bearer token.

## Rendered and interactive verification

- Chromium desktop: 1440×1000 viewport, full-page render passed.
- Chromium mobile: 390×844 viewport, full-page render passed without horizontal clipping.
- Mobile WebKit: iPhone 15 emulation, accessible DOM snapshot passed.
- Mobile WebKit form submission: the account email control and `Send secure deletion link` were operated in the public page. The final response was `Check your email`, with no console errors and no account-enumerating text.
- Screenshot evidence is retained locally under `output/playwright/account-deletion-compliance/`.

The production confirmation endpoint was also probed with a synthetic invalid bearer token. Because the RevenueCat server credential is absent, it returned HTTP 503 and the generic fail-closed response before any provider mutation. This is the intended safe state, but it prevents end-to-end completion certification.
