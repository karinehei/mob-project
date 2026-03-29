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

## Git ja GitHub – työvirta (aloittelijalle)

Tämä projekti elää Git-repositoriossa GitHubissa. **Päähaara** on `main`. Uudet ominaisuudet ja korjaukset tehdään omassa **haarassa** ja viedään takaisin `main`-haaraan **pull requestin** (PR) kautta.

### Sanasto (lyhyesti)

| Termi | Mitä se tarkoittaa |
|--------|---------------------|
| **Repo** | Projektin versionhallinta (tiedostot + historia). |
| **Commit** | Tallennettu tilanne: mitä muuttui ja lyhyt viesti (`git commit`). |
| **Haara (branch)** | Rinnakkainen kehityslinja, esim. `MOB-16-kuvaus` tai `feature/login`. |
| **Push** | Lähetät paikalliset commitit GitHubiin (`git push`). |
| **Pull request (PR)** | Pyyntö yhdistää haarasi `main`-haaraan; keskustelu, tarkistus ja CI ajetaan täällä. |
| **Merge** | Hyväksytty PR yhdistää muutokset `main`-haaraan. |

### Kerta-asiat: kloonaa repo

```bash
git clone <repo-url>
cd mob-project
npm install
```

`<repo-url>` on GitHub-repon osoite (HTTPS tai SSH), jonka saat reposta **Code**-napista.

### Päivittäinen työ: uusi ominaisuus tai korjaus

1. **Päivitä `main` paikallisesti** (aina ennen uutta työtä tai ennen uuden haaran tekoa):

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Luo uusi haara** (nimeä selkeästi, esim. tiketin mukaan):

   ```bash
   git checkout -b MOB-16-kuvaava-nimi
   ```

3. **Tee muutokset** editorissa. Testaa paikallisesti:

   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```

   Nämä samat vaiheet ajetaan myös GitHubissa (katso CI alla).

4. **Tallenna muutokset**:

   ```bash
   git status                 # näet mitä tiedostoja muuttui
   git add .                  # tai git add polku/tiedosto
   git commit -m "Lyhyt kuvaava viesti suomeksi tai englanniksi"
   ```

5. **Lähetä haara GitHubiin** (ensimmäisellä kerralla):

   ```bash
   git push -u origin MOB-16
   ```

   Seuraavilla kerroilla samaan haaraan riittää usein `git push`.

6. **GitHubissa**: avaa **Pull requests** → **New pull request**, valitse oma haara → `main`, täytä otsikko ja kuvaus → luo PR.

7. **Odota CI:tä** (vihreä = ok). Korjaa mahdolliset virheet, commitoi ja pushaa samaan haaraan – PR päivittyy automaattisesti.

8. Kun PR on hyväksytty ja **merge** tehty, voit paikallisesti:

   ```bash
   git checkout main
   git pull origin main
   ```

### Mitä vältää

- Älä commitoi **salaisuuksia** (API-avaimia, `firebaseConfig`-sisältöä sellaisenaan jos se sisältää oikeita avaimia). Käytä paikallisia ympäristömuuttujia tai esimerkkitiedostoja, jos niitä projektiin lisätään.
- Älä työnnä suoraan `main`-haaraan ilman tiimin käytäntöä – käytä PR:ää, jotta CI ja katselmointi tulevat mukaan.

### Konfliktit (lyhyesti)

Jos `git pull` tai merge sanoo **conflict**: samaa tiedostoa on muutettu kahdessa haarassa. Avaa merkityt tiedostot, ratkaise `<<<<<<<` / `=======` / `>>>>>>>` -kohdat, tallenna, sitten `git add` ja `git commit`. Tarvittaessa pyydä apua tiimiltä ensimmäisillä kerroilla.

## CI (GitHub Actions)

Push **haaraan `main`** ja **pull requestit** käynnistävät workflow’n tiedostossa [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. Koodi checkoutataan palvelimelle.
2. Asennetaan riippuvuudet: `npm ci` (sama kuin `npm install`, mutta lukittu `package-lock.json`:n mukaan).
3. Ajetaan: `npm run lint`, `npm run typecheck`, `npm run test`.

Jokin näistä epäonnistuu → workflow näkyy **punaisena** PR:ssä; korjaa koodi ja pushaa uudelleen. **Deploya** tai sovelluksen buildia tämä workflow ei tee (vain laadun tarkistus).

## TODO / seuraavat vaiheet

- Oikea navigaattori (Stack/Tab); `StudyScreen` ja reitit (`ROUTES`) ovat valmiina mutta eivät käytössä `RootNavigator`-tasolla.
- Firebase: täyttää `src/firebase/firebaseConfig.ts` turvallisesti (ei avaimia repoon); toteuttaa `evaluationService` ja tarvittaessa `studyService` ilman pelkkiä `Not implemented` -heittoja.
- Korvata placeholder-tekstit ja -komponentit varsinaisella sisällöllä ja liiketoimintalogiikalla.
- CI: tarvittaessa natiivibuildit (Android), kun pipeline on suunniteltu (workflow-kommentti).
