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
| `npm run seed` | Kirjoittaa kehitysdatan Firestoreen (`scripts/seedFirestore.ts`). Katso [Firestore-seed](#firestore-seed-kehitysdata) ja `--dry-run`. |

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
├── scripts/               # WSL-apu, Firestore-seed (seedFirestore.ts)
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

### Firebase (`.env`)

Kopioi malli ja täytä oman projektisi tiedot:

```bash
cp .env.example .env
```

**Firebase Console:**

1. Avaa [Firebase Console](https://console.firebase.google.com/).
2. Valitse projekti (tai **Lisää projekti** ja luo uusi).
3. Vasemmalta **⚙️ Projektin asetukset** (*Project settings*).
4. Välilehti **Yleiset** (*General*), kohta **Omat sovelluksesi** (*Your apps*).
5. Jos **Web**-sovellusta (`</>`) ei ole vielä, paina **Lisää sovellus** → valitse **Web** (`</>`), anna lempinimi (vapaaehtoinen), tarvittaessa Analytics päälle → **Rekisteröi sovellus**.
6. Näet koodiblokin `firebaseConfig` / `const firebaseConfig = { ... }`. Kopioi kentät `.env`-tiedostoon alla olevan taulukon mukaan (ei lainausmerkkejä arvojen ympärille, ellei Firebase itse anna niitä).

| Firebase-konsolin kenttä (`firebaseConfig`) | Muuttuja `.env`-tiedostossa |
|---------------------------------------------|-----------------------------|
| `apiKey` | `FIREBASE_API_KEY` |
| `authDomain` | `FIREBASE_AUTH_DOMAIN` |
| `projectId` | `FIREBASE_PROJECT_ID` |
| `storageBucket` | `FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `FIREBASE_APP_ID` |
| `measurementId` (vain jos Analytics käytössä) | `FIREBASE_MEASUREMENT_ID` |

**Tärkeää:** `FIREBASE_API_KEY` ja `FIREBASE_PROJECT_ID` ovat pakollisia, jotta `getFirebaseApp()` toimii. Muut kentät kannattaa täyttää samasta objektista, jotta SDK käyttäytyy oikein.

Kun muutat `.env`-tiedostoa, käynnistä Metro uudelleen (tarvittaessa `npm start -- --reset-cache`).

**WSL:** `.env` on repojuuressa (`/mnt/d/.../mob-project/.env` tai `~/.../.env`). Jos muokkaat tiedostoa Windows-editorilla, käytä mieluummin **LF**-rivinvaihtoja; vältä commitointia (`.env` on `.gitignore`-listalla). Firestore-tallennus WSL:ssä: katso [WSL.md](./WSL.md) kohdasta **7. Firebase / Firestore (WSL)**.

### Firestore (sovellus)

- Kokoelmat: **`sessions`** (vähintään yksi dokumentti, kenttä `samples`: string-taulukko), **`evaluations`** (luodaan automaattisesti ensimmäisellä tallennuksella).
- Arviointi: etusivun pistemäärä välittyy kontekstilla → **Arviointi** → **Tallenna ja jatka** kirjoittaa dokumentin kentillä `sampleCode`, `rating`, `sessionId`, `createdAt`.
- **Säännöt:** Firebase Console → Firestore → Rules. Ilman kirjoitusoikeutta `evaluations`-kokoelmaan tallennus epäonnistuu (sovellus näyttää virheen). Tuotantoon älä jätä avoimia testisääntöjä.

### Firestore-seed (kehitysdata)

Skripti **`scripts/seedFirestore.ts`** kirjoittaa hallitusti testidatan **omaan dev-Firebase-projektiisi** (sama `.env` kuin sovelluksella). Lähde: `src/data/mockData.ts` (`mockSamples` → istunnon `samples`-taulukko; esimerkkiarviointeista kaksi dokumenttia `evaluations`-kokoelmaan, sama kenttämalli kuin sovelluksen tallennuksessa).

```bash
# Näytä mitä tehtäisiin (ei verkko-/kirjoituspyyntöjä)
npm run seed -- --dry-run

# Varsinainen kirjoitus
npm run seed
```

**Idempotenssi:** käytössä on kiinteät dokumentti-id:t (`sessions/seed-dev-session`, `evaluations/seed-evaluation-mock-example`, `evaluations/seed-evaluation-mock-payload`). Uudelleenajo päivittää samat dokumentit (`setDoc` + `merge`), ei luo uusia rivejä joka ajolla.

**Tuotantosuoja:** skripti **keskeyttää** (poistumakoodi ≠ 0), jos `FIREBASE_PROJECT_ID` ei näytä kehitysprojektilta (heuristiikka: tunnuksessa esim. `dev`, `test`, `staging`, `sandbox`, välimerkkien ympäröimä `-project-`, tai `amk` …). Muussa tapauksessa:

- lisää `.env`-tiedostoon `FIREBASE_SEED_ALLOW_PROJECT=<sama kuin FIREBASE_PROJECT_ID>`, tai
- aseta **vain tietoisesti** `FIREBASE_SEED_CONFIRM_PRODUCTION=I_UNDERSTAND` (kirjoittaa myös “tuotantotyyliseen” projektiin — vältä).

Lisäksi voit yliajaa ympäristömuuttujilla komentoriviltä (esim. `FIREBASE_SEED_ALLOW_PROJECT=... npm run seed`).

**Firestore rules:** seed käyttää Web SDK:ta ilman Admin-oikeuksia — devissä sääntöjen pitää sallia **luku ja kirjoitus** kokoelmiin `sessions` ja `evaluations`. Virheet tulostuvat selkeästi; epäonnistuessa prosessi palauttaa poistumakoodin **1**.

**Jos `permission-denied` / `PERMISSION_DENIED`:** tietokanta on todennäköisesti luotu **Production**-tilassa tai säännöt kiellävät kirjoituksen. Avaa **Firebase Console** → **Firestore Database** → **Rules** ja julkaise **vain kehitysprojektiin** esimerkiksi alla oleva (korvaa myöhemmin authilla ja tiukemmilla ehdoilla):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{document} {
      allow read, write: if true;
    }
    match /evaluations/{document} {
      allow read, write: if true;
    }
  }
}
```

**Älä jätä tätä tuotantoon** — kuka tahansa API-avaimella voi lukea/kirjoittaa näitä kokoelmia.

**Huom:** `fetchActiveStudySession` hakee tällä hetkellä yhden istunnon ilman järjestystä (`limit(1)`). Jos kannassa on muita `sessions`-dokumentteja, sovellus ei välttämättä valitse `seed-dev-session`-dokumenttia — devissä pidä mieluummin yksi istunto tai tyhjennä ylimääräiset.

- **`android/local.properties`:** paikallinen SDK-polku, ei repossa.

## CI

Push haaraan **`main`** ja **pull requestit** ajavat [`.github/workflows/ci.yml`](./.github/workflows/ci.yml): `npm ci`, `lint`, `typecheck`, `test`. Natiivi-Android/iOS -buildit eivät ole mukana (kommentoitu TODO workflowssa).

## Seuraavat vaiheet (tuote / tekninen velka)

- Navigaatio: Stack/Tab; kytke `StudyScreen` ja `ROUTES` käyttöön `RootNavigator`-tasolla.
- Firestore: tiukenna security rules ja auth; täytä `getSamples` tarvittaessa.
- Korvaa placeholder-tekstit ja -komponentit varsinaisella sisällöllä.
- CI: Android-buildi, kun pipeline on määritelty.

## Dokumentaatio

- [WSL.md](./WSL.md) — WSL2, `metadata`-mount, npm-oikeudet, adb, mirrored networking, Metro-virheet.
