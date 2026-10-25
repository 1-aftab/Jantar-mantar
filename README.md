# Jantar Mantar: Protest Mayhem

**A snack-powered, top-down comedy action adventure set in a fictional protest ground.**

> Everything in this game is fictional. It uses a playful, respectful, non-partisan setting and original procedural artwork — no real people, organizations, brands, or events are depicted.

![Phaser 3](https://img.shields.io/badge/Phaser-3.90-4a68a8?logo=javascript&logoColor=white) ![Capacitor](https://img.shields.io/badge/Capacitor-Android-119eff?logo=capacitor&logoColor=white) ![Offline](https://img.shields.io/badge/works-offline-yes-5d9a75)

## Play

- **Browser:** GitHub Pages deploys automatically from `main` through [`.github/workflows/pages.yml`](.github/workflows/pages.yml). In the repository settings, set **Pages → Source → GitHub Actions** once if Pages has not been enabled already.
- **Local browser:**

  ```bash
  npm install
  npm run dev
  ```

  Open the local address printed by Vite. Use `npm run build` to generate the production `dist/` folder.

- **Android:** download the `Protest-Mayhem-Android-APK` workflow artifact from the **Android Debug APK** GitHub Actions run, then install `app-debug.apk` on an Android device. It contains all game code and procedural art; no network or account is needed after installation.

## Controls

| Desktop | Action |
| --- | --- |
| `WASD` / arrow keys | Move |
| `Shift` | Sprint (uses stamina) |
| `E` / `Space` | Contextual interaction / collect / talk / help |
| `F` | Dance and recruit nearby crowd circles |
| `Esc` | Pause and settings |

Android has an on-screen analogue stick plus **ACT**, **DANCE**, **RUN**, and pause buttons. Landscape is recommended, but the canvas and controls scale to different viewports.

## What is playable

The game begins at the mission board in the south-west. All campaign objectives are real world interactions—not static menu text—and campaign completion, score, settings, and best chaos are saved locally with `localStorage` / Capacitor WebView storage.

### Campaign (10 missions)

1. **Operation: Feed Everyone** — collect snack parcels and water, then deliver them to hungry NPCs.
2. **The Great Barricade Confusion** — move three physical barricades to reopen a route.
3. **Find the Missing Chai** — recover a kettle and take it back to Chai Uncle.
4. **Rescue the Sleepy Protester** — wake Snoozy and escort them to first aid.
5. **The Accidental Dance Revolution** — dance near separate crowd clusters.
6. **The Great Water Bottle Shortage** — resupply thirsty protestors from the coolers.
7. **The Confused Tourist** — guide a lost visitor to the Metro exit.
8. **Banner Emergency** — retrieve a runaway banner and return it to the stage.
9. **The Cleanup Conundrum** — gather scattered placards.
10. **The Final Chaos Challenge** — make a grand finale once chaos and patrol conditions are met.

### Systems

- Large scrolling 2D protest ground with tents, stalls, signs, trees, crowds, barricades, a stage, and a minimap.
- Procedural, original 2D Canvas sprites and effects; there are no downloaded game assets or 3D models.
- Inventory, score, stamina, collectibles, persistent campaign progress, mission tracker, speech bubbles, and funny Hinglish-flavoured dialogue.
- Chaos meter that triggers random missing-chai, samosa, tourist, cameraman, and dance-circle events. High chaos expands police detection.
- Patrol routes, pursuit, inexpensive steering-based obstacle avoidance, being caught, and a working hiding bush/escape path.
- Subtle optional screen shake plus optional sound effects. Settings are stored locally.

## Architecture

```text
src/
  main.js                 Phaser configuration and Android back handling
  scenes/BootScene.js     Procedurally generates original texture assets
  scenes/GameScene.js     World, movement, AI, interactions, missions, saves
  scenes/UIScene.js       HUD, minimap, mission board, touch controls, menus
  game/missions.js        Campaign data (easy to expand beyond 10)
  game/SaveManager.js     Local persistent save helper
android/                  Capacitor Android project and committed Gradle wrapper
.github/workflows/        Debug APK, signed release APK, and Pages deployment
```

The web build has a relative Vite base (`./`) so it works from a GitHub Pages project site and from Capacitor's local WebView.

## Android development

Requirements: Node 22+ and a JDK 21 Android environment (required by the current Capacitor Android runtime).

```bash
npm ci
npm run cap:sync
npm run android:debug
```

`cap sync` builds the browser game first and copies the resulting offline files to `android/app/src/main/assets/public`. The committed Gradle wrapper makes local and CI builds reproducible.

### Signed release workflow

Run **Signed Android Release APK** manually. It deliberately fails before building if any required secret is absent. Add these repository secrets in **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 contents of your `.jks` / `.keystore` file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Signing key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

The workflow decodes the key only inside the runner, signs `app-release.apk`, and uploads it as `Protest-Mayhem-Signed-Release-APK`. It never publishes a GitHub Release and no signing material is committed. The debug workflow triggers on pushes to `main` and manual runs, checks that an APK exists, then retains its `Protest-Mayhem-Android-APK` artifact for 14 days.

## Quality checks

```bash
npm test       # campaign data integrity tests
npm run build  # production browser bundle
```

For a hands-on smoke test: accept Mission 1 from the board, collect snacks/water around the supply stalls, give them to nearby hungry NPCs with `E`, then test a patrol chase and the bush at the eastern edge. Continue through the board to test barricades, escorting, dancing, and saves.

## Privacy and offline behaviour

The game makes no API calls, uses no account, analytics, ads, location service, or paid service. It has no external gameplay assets. Browser saves live in this origin's local storage; Android saves use the app WebView's persistent storage and remain between launches unless app data is cleared.

## License

MIT — see [LICENSE](LICENSE).
