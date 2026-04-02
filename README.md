# Food_Study

React Native -mobiilisovelluksen kehitysrunko (tutkimus/food-study -konteksti). Mukana on navigoinnin ja näkymien perusrakenne placeholder-sisällöllä, teemat, yhteisiä komponentteja, Firebase/Firestore -alustus **ilman** valmista autentikointia tai täyttä tietovarastologiikkaa, sekä Android-natiivikerros. Kehitystyökalut ja kevyt GitHub Actions -CI.

## Teknologiat

| Alue | Versio / työkalu |
|------|------------------|
| React Native | 0.76.5 |
| React | 18.3.x |
| TypeScript | 5.6.x |
| Node.js | ≥ 18 (CI käyttää 20) |
| Firebase | JS SDK 11.x (runko) |
| Testit | Jest 29 |
| Laatu | ESLint (@react-native/eslint-config), Prettier |
| Nativi | **Android** — `compileSdk` 35, `minSdk` 24, `targetSdk` 34 (ks. `android/build.gradle`) |

**Huom:** Tässä repossa on vain **`android/`**-projekti. **iOS-kansiota ei ole**; `package.json`-skripti `ios` olettaisi Xcode-projektin, jota ei ole generoitu mukaan.

## Mitä repossa on

- **Navigaatio:** `RootNavigator` (tällä hetkellä pääasiassa `HomeScreen`). `StudyScreen` ja reitit (`ROUTES`) ovat osittain valmiina mutta eivät täysin kytkettyinä.
- **UI:** `ScreenContainer`, `PlaceholderBlock`, `Button`, teemat (`colors`, `typography`, `spacing`).
- **Tila / esimerkki:** `usePlaceholder`, `SampleContext`.
- **Palvelut (stub):** `studyService`, `evaluationService`.
- **Firebase:** `firebaseConfig`, app-init, Firestore-instanssi — täytä konfiguraatio paikallisesti; älä commitoi avaimia.
- **Patch:** `patch-package` korjaa RN 0.76.x Metron `indexPageMiddleware` -ongelman (`postinstall`).

## Edellytykset

- **Node.js** vähintään 18.
- **Android-kehitys:** [Android Studio](https://developer.android.com/studio), Android SDK (tue projektin `compileSdk`-tasoa), emulaattori tai USB-debugattu puhelin.
- Tiedosto **`android/local.properties`**: kopioi [`android/local.properties.example`](./android/local.properties.example) → `local.properties` ja aseta `sdk.dir` SDK-polkuun (Windows-tyypillisesti `C:\Users\<käyttäjä>\AppData\Local\Android\Sdk`; WSL:ssä usein `/mnt/c/Users/.../Sdk`). Tiedosto on `.gitignore`-listalla.
- **WSL + repo Windows-levyllä** (`D:\…` → `/mnt/d/…`): oikeudet, adb/Gradle ja Metro — katso [WSL.md](./WSL.md).

## Pika-aloitus

```bash
git clone <repo-url>
cd mob-project
npm install
```

`npm install` ajaa **`postinstall` → `patch-package`**, jotta Metron korjaus tulee voimaan.

Kaksi terminaalia:

```bash
# Terminaali 1 — Metro (pidä käynnissä)
npm start
```

```bash
# Terminaali 2 — asenna ja käynnistä Android-debug
npm run android
```

## npm-skriptit

| Skripti | Kuvaus |
|---------|--------|
| `npm start` | Metro bundler (`react-native start`). |
| `npm run android` | `react-native run-android` (debug, tarvitsee Metron tai upotetun bundlen). |
| `npm run android:wsl` | Bash: WSL-ystävällinen adb/Gradle-ympäristö + `run-android` (ks. [WSL.md](./WSL.md)). |
| `npm run ios` | Ei toimi ilman `ios/`-projektia tässä repossa. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Jest. |

## Android: emulaattori tai oma puhelin

**Kerran:** Android Studio → SDK Manager → asenna tarvittava **SDK Platform** (vähintään API-taso, jota `compileSdkVersion` käyttää: tässä projektissa **35**). Varmista `android/local.properties` ja `sdk.dir`.

### Emulaattori

1. Android Studio → **Device Manager** → luo tai käynnistä **Virtual Device (AVD)**.
2. Terminaalissa: `adb devices` — odota riviä tyyliin `emulator-5554   device`.
3. `npm install` (jos et ole vielä), sitten `npm start` ensimmäisessä terminaalissa.
4. Toisessa terminaalissa: `npm run android`.

Metro pitää olla käynnissä debug-ajossa, jotta JavaScript latautuu laitteelle.

### Fyysinen puhelin (USB)

1. Ota käyttöön **kehittäjäasetukset** ja **USB-vianjäljitys**.
2. Yhdistä USB:lla, hyväksy debug-lupa puhelimessa.
3. `adb devices` → tila **`device`** (ei `unauthorized`).
4. Ohjaa Metron portti: **`adb reverse tcp:8081 tcp:8081`** (React Nativen oletusportti).
5. `npm start` + `npm run android` kuten emulaattorilla.

Langaton debug on mahdollinen (`adb tcpip` jne.); USB + `adb reverse` on yleensä helpoin.

### WSL

Emulaattori Windowsissa + repo WSL:ssä aiheuttaa usein adb/Gradle/Metro-ristiriitoja. Käytä ohjeita ja skriptiä: **`npm run android:wsl`** ja [WSL.md](./WSL.md).

### Virhe: "Unable to load script"

Debugissa: Metron ei tavoiteta (sammutettu, väärä verkko, WSL↔Windows) tai sovellus avattu ilman käynnissä olevaa packageria. Käynnistä `npm start`, tarvittaessa `adb reverse tcp:8081 tcp:8081`, ja asenna uudestaan `npm run android`. Release-build vaatii upotetun bundlen (normaali RN release -workflow).

## Kansiorakenne (tiivis)

```text
├── .github/workflows/     # CI (Node: lint, typecheck, test)
├── android/               # Nativi Android (Gradle, Kotlin)
├── patches/               # patch-package (Metro / community-cli-plugin)
├── scripts/               # WSL-apu (wsl-android-env.sh, wsl-run-android.sh)
├── src/
│   ├── components/        # Button, PlaceholderBlock, ScreenContainer
│   ├── constants/         # config, routes (ROUTES)
│   ├── context/           # SampleContext
│   ├── firebase/          # firebaseConfig, app, firestore (runko)
│   ├── hooks/             # usePlaceholder
│   ├── navigation/        # RootNavigator, tyypit
│   ├── screens/           # HomeScreen, StudyScreen
│   ├── services/          # studyService, evaluationService (stub)
│   ├── theme/             # colors, typography, spacing
│   ├── types/             # domain-tyypit
│   └── utils/             # apufunktiot + testit
├── App.tsx
├── index.js
├── app.json               # displayName: Food_Study
├── babel.config.js
├── metro.config.js
├── jest.config.js
├── tsconfig.json
├── WSL.md                 # WSL + Android + Metro -yksityiskohdat
└── package.json
```

## Konfiguraatio ja turvallisuus

- **`src/firebase/firebaseConfig.ts`:** täytä omalla Firebase-projektilla; älä commitoi avainpareja tai `.env`-tiedostoja (`.env*` on gitignoressa).
- **`android/local.properties`:** paikallinen SDK-polku, ei repossa.

## CI

Push haaraan **`main`** ja **pull requestit** ajavat [`.github/workflows/ci.yml`](./.github/workflows/ci.yml): `npm ci`, `lint`, `typecheck`, `test`. Natiivi-Android/iOS -buildit eivät ole mukana (kommentoitu TODO workflowssa).

## Seuraavat vaiheet (tuote / tekninen velka)

- Navigaatio: Stack/Tab; kytke `StudyScreen` ja `ROUTES` käyttöön `RootNavigator`-tasolla.
- Firebase: turvallinen konfiguraatio; `evaluationService` / `studyService` ilman pelkkiä `Not implemented` -polkuja tarvittaessa.
- Korvaa placeholder-tekstit ja -komponentit varsinaisella sisällöllä.
- CI: Android-buildi, kun pipeline on määritelty.

## Dokumentaatio

- [WSL.md](./WSL.md) — WSL2, `metadata`-mount, npm-oikeudet, adb, mirrored networking, Metro-virheet.
