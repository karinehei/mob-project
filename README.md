# Food_Study

React Native -pohjainen mobiilisovelluksen kehitysrunko. Tällä hetkellä mukana on navigoinnin ja näkymien perusrakenne placeholder-sisällöllä, kehitystyökalut sekä Firebase/Firestore-integraation tekninen runko ilman valmista tietovarastologiikkaa tai autentikointia.

## Teknologiat

- **React Native** 0.76, **React** 18
- **TypeScript**
- **ESLint** (@react-native/eslint-config), **Prettier**
- **Jest** (yksikkötestejä varten)
- **Firebase** (JavaScript SDK) — projektissa alustustiedostot ja palvelurunko; konfiguraatio ja Firestore-kutsut eivät ole käytössä loppuun asti
- **GitHub Actions** — kevyt CI: `lint`, `typecheck`, `test` (ei deploya)

## Kansiorakenne

```text
├── .github/workflows/   # CI-workflow
├── src/
│   ├── components/      # ScreenContainer, PlaceholderBlock
│   ├── constants/       # config, reittivakiot (ROUTES)
│   ├── firebase/        # firebaseConfig, app-init, Firestore-instanssi (runko)
│   ├── hooks/           # usePlaceholder
│   ├── navigation/      # RootNavigator (tällä hetkellä vain HomeScreen)
│   ├── screens/         # HomeScreen, StudyScreen (Study ei ole kytketty navigaattoriin)
│   ├── services/        # studyService (stub), evaluationService (stub)
│   ├── theme/           # värit, typografia, spacing
│   ├── types/           # domain-tyyppien placeholderit
│   └── utils/           # format-apuri + testi
├── App.tsx
├── index.js
├── app.json
├── babel.config.js
├── metro.config.js
├── jest.config.js
├── tsconfig.json
└── package.json
```

## Edellytykset

- **Node.js** vähintään 18 (`package.json` → `engines`)
- Android-kehitysympäristö sovelluksen ajamiseksi laitteella tai emulaattorilla (React Nativen viralliset vaatimukset)

## Käynnistysohjeet

```bash
npm install
npm start
```

Toisessa terminaalissa:

```bash
npm run android
```

Muut npm-skriptit:

- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript (`tsc --noEmit`)
- `npm run test` — Jest

## CI

Push haaraan `main` ja pull requestit käynnistävät workflow’n `.github/workflows/ci.yml`: asennus, lint, typecheck ja testit.

## TODO / seuraavat vaiheet

- Oikea navigaattori (Stack/Tab); `StudyScreen` ja reitit (`ROUTES`) ovat valmiina mutta eivät käytössä `RootNavigator`-tasolla.
- Firebase: täyttää `src/firebase/firebaseConfig.ts` turvallisesti (ei avaimia repoon); toteuttaa `evaluationService` ja tarvittaessa `studyService` ilman pelkkiä `Not implemented` -heittoja.
- Korvata placeholder-tekstit ja -komponentit varsinaisella sisällöllä ja liiketoimintalogiikalla.
- CI: tarvittaessa natiivibuildit (Android), kun pipeline on suunniteltu (workflow-kommentti).
