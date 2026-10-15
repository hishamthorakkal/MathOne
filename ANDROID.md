# Mathosaur on Google Play (Android)

The Play Store app is a **Trusted Web Activity (TWA)**: a small Android app that opens
`https://hishamthorakkal.github.io/MathOne/` full-screen in Chrome, with no address bar.

## Already done in this repo

| What | Where |
| --- | --- |
| Fully offline: a service worker saves every file (code, pictures, fonts) on first launch | `vite.config.ts` (vite-plugin-pwa) |
| Fonts bundled with the app (no Google Fonts download) | `src/main.tsx` |
| App manifest: id, scope, standalone, theme colours, maskable icon | `public/manifest.webmanifest` |
| Android adaptive icon | `public/icon-maskable-512.png` (`npm run icons`) |
| Privacy policy for the store listing | `public/privacy.html` → `https://hishamthorakkal.github.io/MathOne/privacy.html` |

**Offline:** the very first launch needs internet once, to download the app files. After that the app works with no
internet at all. Updates download quietly the next time the app is opened online.

## Steps for you

### 1. Push and check the site
Push from GitHub Desktop. When the deploy finishes, open the site once in Chrome, turn on airplane mode and reload:
the game should still load.

### 2. Make the app with PWABuilder
1. Go to <https://www.pwabuilder.com>, enter `https://hishamthorakkal.github.io/MathOne/` and choose **Package for stores → Android → Google Play**.
2. **Package ID:** for example `io.github.hishamthorakkal.mathosaur`. You can never change it after publishing.
3. **App name:** Mathosaur. **Launcher name:** Mathosaur. Leave the rest as default (fallback: custom tabs; notifications off).
4. Download the zip. It contains:
   - `app-release-bundle.aab`: the file you upload to Play;
   - `signing.keystore` and `signing-key-info.txt`: **keep both safe and private** (a password manager or a backup drive). Without them you can never update the app;
   - `assetlinks.json`: needed in step 3.

### 3. Prove you own the website (removes the address bar)
Android looks for the proof at the **root** of the domain, `https://hishamthorakkal.github.io/.well-known/assetlinks.json`,
not inside `/MathOne/`. So it needs a second, tiny repo:

1. On GitHub, create a public repo named exactly **`hishamthorakkal.github.io`**.
2. Add two files:
   - `.nojekyll` (empty; lets GitHub serve the `.well-known` folder);
   - `.well-known/assetlinks.json` (the file from the PWABuilder zip).
3. In that repo, open **Settings → Pages** and set the source to the `main` branch.
4. Check that `https://hishamthorakkal.github.io/.well-known/assetlinks.json` opens in a browser.

Without this, the app still works but shows a small address bar at the top.

### 4. Google Play Console
1. Create a developer account at <https://play.google.com/console> ($25 one-time, with an identity check).
2. **Create app:** name Mathosaur, type *App*, *Free*, default language English.
3. **App integrity → Play App Signing:** copy the **SHA-256 certificate fingerprint** that Google shows. Add it to
   `assetlinks.json` in the `hishamthorakkal.github.io` repo, next to the one from PWABuilder (the
   `sha256_cert_fingerprints` list can hold both). Without this, the Play-installed app shows the address bar.
4. **App content:**
   - *Privacy policy:* `https://hishamthorakkal.github.io/MathOne/privacy.html`;
   - *Ads:* No ads;
   - *Target audience:* ages 5–8 (this enrols the app in the **Families** programme);
   - *Data safety:* no data collected, no data shared;
   - *Content rating:* fill in the questionnaire (education, no violence and no chat), which should give "Everyone / 3+".
5. **Store listing:** short and full description, the 512×512 icon (`public/icon-512.png`), a 1024×500 feature graphic
   and at least 2 phone screenshots.

### 5. Testing, then release
- New personal developer accounts must run a **closed test with at least 12 testers for 14 days in a row** before
  they can publish to everyone. Upload the `.aab` to **Testing → Closed testing** and add testers by email (family and friends).
- After 14 days, apply for production access, then promote the release to **Production**. Google's review usually takes a few days.

## Updating the app later
- **Game changes:** commit and push as usual. The website updates, and the app picks up the new version the next time it
  is opened online. No new Play release is needed.
- **New Play release:** only when the app name, icon or package settings change. Rebuild in PWABuilder with the **same keystore**
  and a higher version number.

## Good to know
- Progress is saved on each device, not in the cloud. On the same phone the app and the website in Chrome share progress,
  because the app runs on Chrome. To move progress to another phone, use the backup option in Grown-ups settings.
- The read-aloud button uses the phone's built-in voice. If a phone has no voice installed, go to Settings → Text-to-speech.
