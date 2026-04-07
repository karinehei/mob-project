# Kehitys WSL:stä, kun repo on Windows-levyllä (`D:\…` → `/mnt/d/…`)

Npm:n `EACCES` ja `rm: Permission denied` johtuvat siitä, että **drvfs** (`/mnt/d`) ei käytä oletuksena Linux-oikeuksia. Alla korjaus + miten ajat Android-buildin.

## 1. Ota käyttöön `metadata`-mount (kerran per WSL-jakelu)

Linux-puolella (WSL):

```bash
sudo nano /etc/wsl.conf
```

Lisää tai täydennä:

```ini
[automount]
enabled = true
root = /mnt/
options = "metadata,umask=22,fmask=11"
```

Tallenna. **Windows PowerShell (Admin)**:

```powershell
wsl --shutdown
```

Avaa WSL uudestaan (tämä lukee `wsl.conf` uudelleen).

## 2. Siivoa `node_modules` kerran Windowsista

Sulje Cursor/terminaalit, jotka käyttävät projektia. **PowerShell**:

```powershell
Remove-Item -Recurse -Force "D:\amk\mob-project\node_modules" -ErrorAction SilentlyContinue
```

## 3. Omistajuus ja asennus WSL:ssä

```bash
cd /mnt/d/amk/mob-project
sudo chown -R "$(whoami):$(whoami)" .
chmod -R u+rwX .
npm install
```

Jatkossa: **älä aja `sudo npm install`** (se sotkee omistajuuden).

## 4. Metro ja JS

```bash
cd /mnt/d/amk/mob-project
npm start
```

**Jos rivi jää tyhjäksi heti `npm start` / `pkill` jälkeen:** usein **ei ole jumi**, vaan Metro indeksoi `node_modules`-puuta **drvfs**-levyllä (**5–15 min** ilman yhtään riviä on tavallista). Varmistus: **`npm run start:wsl`** (käyttää `node scripts/metro-start-wsl.cjs` — tulostaa heti, ohittaa hitaan `npm run` + bash -ketjun) tai **`npm run start:verbose`**.

**Jos `npm run start:wsl` ei tulosta mitään edes minuutteihin:** `npm` itse voi olla jumissa drvfs:llä. Aja suoraan (ei `npm run`):
```bash
cd /mnt/d/amk/mob-project
node scripts/metro-start-wsl.cjs
```

**Jos se “roikkuu” yhä pitkään (esim. 20+ min ilman yhtään verbose-riviä):** käytä käytännössä aina **Metron Windowsissa** (PowerShell, sama repo `D:\amk\mob-project` → `npm start`) ja **WSL vain** `npm run android:wsl`. Tämä on luotettavin yhdistelmä `/mnt/d`-polulla.

**Paras pysyvä korjaus WSL-kehiin:** kopioi repo **ext4**:ään, esim. `cp -a /mnt/d/amk/mob-project ~/mob-project && cd ~/mob-project && npm install && npm start` — Metro on silloin normaalin nopea.

### Metro “roikkuu” / ei tulosta mitään pitkään aikaan (repo Windows-levyllä)

Kun projekti on polussa tyyliin `/mnt/d/...`, WSL käyttää **drvfs**-tiedostojärjestelmää. **Node + Metro** lukee `node_modules`-puusta valtavan määrän tiedostoja — ensimmäinen käynnistys voi kestää **useita minuutteja** ilman näkyvää tulostetta. Tämä ei ole välttämättä jumi, vaan hidasta levyä.

**Mitä tehdä:**

1. **Odota** 5–15 min tai aja verbose-tilassa, jotta näet edistymisen:
   ```bash
   cd /mnt/d/amk/mob-project
   npm run start:verbose
   ```
   (Sama kuin `npx react-native start --verbose`.)
2. **Nopein käytännön ratkaisu:** käynnistä Metro **Windowsissa** (PowerShell `D:\amk\mob-project`):
   ```powershell
   npm start
   ```
   ja pidä WSL vain Android-buildille (`npm run android:wsl`). Tarvittaessa emulaattorille: `adb reverse tcp:8081 tcp:8081` (Windows-ADB, jos Metro Windowsissa — usein ei tarvita samalla koneella).
3. **Paras suorituskyky WSL-kehiin:** kloonaa tai kopioi repo **Linuxin kotihakemistoon** (ext4), esim. `~/src/mob-project`, ja aja `npm install` + `npm start` sieltä — Metro ja file watch ovat silloin normaalin nopeisia.

### Metro ei reagoi — jopa Ctrl+C ei pysäytä (WSL + `/mnt/d/...`)

Joskus Node/Metro jää **kernel-tason odotukseen** Windows-levyn yli (drvfs). Silloin prosessi ei välttämättä vastaa **Ctrl+C**:lle heti tai ollenkaan — terminaali näyttää jumissa.

**Pysäytys:**

1. **Turvallisin:** sulje se WSL-välilehti/ikkuna, jossa `npm start` pyörii (tai paina terminaalin roskakoria). Joskus riittää.

2. **Tapa vain omat Node-prosessisi** — älä käytä sokkona `pkill -9 node`: se yrittää tappaa myös muiden käyttäjien / järjestelmän prosesseja ja saat `Operation not permitted`.
   ```bash
   ps -u "$(whoami)" -o pid,args | grep -E 'node|metro|react-native' | grep -v grep
   kill -9 <PID>    # korvaa <PID> riviltä, joka on sinun Metron / npm start -prosessisi
   ```
   Vaihtoehtoisesti (vain omaan käyttäjään rajautuen):
   ```bash
   pkill -9 -u "$(whoami)" -f 'react-native start' || true
   pkill -9 -u "$(whoami)" -f metro || true
   ```

3. **Windows (aina toimii, jos WSL jumittaa):** PowerShell: `wsl --shutdown` (sulkee kaikki WSL-jakelut — varo jos muu työ WSL:ssä kesken). Tai Tehtävienhallinta → **VmmemWSL**.

**Kestävä ratkaisu:** **älä aja Metron `npm start` WSL:ssä** reposta, joka on `D:\…` → `/mnt/d/…`. Käynnistä Metro **Windows PowerShellissa** `D:\amk\mob-project` tai siirrä repo WSL:n **ext4**-levylle (`~`). Tämä välttää useimmat “ei reagoi” -tilanteet.

Jos Metro kaatuu virheeseen `Cannot read properties of undefined (reading 'handle')` (`connect`-middleware), syy on RN 0.76.x / `cli-server-api` -yhdistelmässä: `indexPageMiddleware` puuttuu exporteista. Tässä repossa korjaus tehdään **`patch-package`**:lla (`postinstall` + `patches/@react-native+community-cli-plugin+0.76.5.patch`). Varmista että `npm install` on ajettu loppuun, jotta patch tulee voimaan.

## 5. Android SDK ja Gradle (`SDK location not found`)

Jos saat virheen **SDK location not found** / `ANDROID_HOME` / `local.properties`:

1. Asenna **Android Studio** Windowsissa ja **SDK Manager** → varmista että SDK on asennettu (yleensä `C:\Users\<käyttäjä>\AppData\Local\Android\Sdk`).
2. WSL:ssä luo tiedosto **`android/local.properties`** (kopioi mallista):

   ```bash
   cp android/local.properties.example android/local.properties
   ```

   Muokkaa `YOUR_USER` oikeaksi ja tarkista että `sdk.dir` osoittaa **WSL-polkuun** Windows-levylle, esim.:

   ```properties
   sdk.dir=/mnt/c/Users/karin/AppData/Local/Android/Sdk
   ```

   (Kirjain `c` = Windowsin C-asema WSL:ssä; käyttäjänimi kuten Windowsissa.)

3. Vaihtoehto: aseta ympäristömuuttuja sessiolle (**tärkeää:** `platform-tools` PATHin **alkuun**, jotta `apt`-asennettu `/usr/bin/adb` ei jää ensin):

   ```bash
   export ANDROID_HOME=/mnt/c/Users/karin/AppData/Local/Android/Sdk
   export ANDROID_SDK_ROOT="$ANDROID_HOME"
   export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
   ```

Lisää sama `export`-rivi `~/.bashrc`- tai `~/.zshrc`-tiedostoon, jos haluat pysyvän asetuksen.

### `:app:installDebug` — `No connected devices!` (emulaattori päällä Windowsissa)

Gradle ei näe emulaattoria, vaikka Android Studio näyttää AVD:n käynnissä. Tyypilliset syyt WSL:ssä:

1. **`ANDROID_HOME` / PATH puuttuu Gradlen daemonilta** — vanha Gradle-prosessi käynnistyi ilman SDK-polkuja.
2. **Väärä `adb` järjestyksessä** — `PATH`issa ensin `/usr/bin/adb` (Linux), Windows-emulaattori ei näy oikein.

**Nopea korjaus reposta (WSL):**

```bash
cd /mnt/d/amk/mob-project
npm run android:wsl
```

Skripti lukee `android/local.properties` → `sdk.dir`, asettaa `ANDROID_HOME` / `ANDROID_SDK_ROOT`, laittaa SDK:n `platform-tools` PATHin alkuun, ajaa `./gradlew --stop`, käynnistää `adb`-palvelimen uudelleen ja kutsuu `react-native run-android`.

Vain ympäristön voi myös ladata samaan sessioon:

```bash
. ./scripts/wsl-android-env.sh
cd android && ./gradlew --stop && cd ..
adb kill-server && adb start-server && adb devices
npx react-native run-android
```

Jos **`adb devices`** näyttää `emulator-…  device` **mutta** Gradle silti: **`No connected devices!`**, syy on lähes aina tämä: **Gradle (Java) WSL:ssä** kysyy laitteita osoitteesta **Linuxin `127.0.0.1:5037`**. **Windowsin adb-palvelin** kuuntelee **Windowsin** silmukassa — ne eivät ole sama portti WSL2:n oletusverkossa. Komento `adb` WSL-terminaalissa käyttää usein Windowsin `adb.exe`:ää, joka puhuu Windowsin kanssa; siksi lista näyttää oikealta, mutta `:app:installDebug` epäonnistuu.

**Korjaus 1 (suositeltava, Windows 11):** ota **mirrored networking** käyttöön, jolloin localhost yhdistyy Windowsin ja WSL:n välillä (Gradle löytää adb-palvelimen):

1. Luo tai muokkaa **tiedostoa** (ei kansiota — älä käytä `cd`-komentoa) **`C:\Users\<käyttäjä>\.wslconfig`** Windowsissa. Tiedosto ei välttämättä ole olemassa vielä; luo se esim. PowerShellissa: `notepad $env:USERPROFILE\.wslconfig` (Notepad: “luodaanko uusi tiedosto?” → Kyllä).

   ```ini
   [wsl2]
   networkingMode=mirrored
   ```

2. **PowerShell:** `wsl --shutdown`
3. Avaa WSL uudelleen ja aja esim. `npm run android:wsl`.

Lisätietoa: [WSL — Mirrored mode networking](https://learn.microsoft.com/en-us/windows/wsl/networking#mirrored-mode-networking).

**Korjaus 2:** aja **`npx react-native run-android`** **PowerShellissa** hakemistossa `D:\amk\mob-project` (Node asennettuna Windowsiin). Metro voi pyöriä WSL:ssä erikseen; tarvittaessa Windows-puolelta `adb reverse tcp:8081 tcp:8081` jotta emulaattori tavoittaa Metron WSL:ssä.

Katso myös alla *Gradle / DeviceMonitor*.

**JDK:** asenna Linux-puolelle JDK 17 (esim. `sudo apt install openjdk-17-jdk`) ja tarvittaessa `export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64`.

### Virhe: `Directory does not exist` (`sdk.dir` / `local.properties`)

Gradle löytää tiedoston, mutta polku on väärä tai SDK:ta ei ole siellä.

1. **Oikea polku Android Studiosta (luotettavin):** *Settings* → *Languages & Frameworks* → *Android SDK* → kenttä **Android SDK Location**. Kopioi se (esim. `C:\Users\karin\AppData\Local\Android\Sdk` tai jokin muu, jos olet valinnut custom-sijainnin).

2. **Muunna WSL-muotoon:** korvaa `C:\` → `/mnt/c/`, kauttaviivat → `/`, isot kirjaimet kuten Windowsissa (usein `Users`, `AppData`…).  
   Esimerkki: `C:\Users\karin\AppData\Local\Android\Sdk` → `/mnt/c/Users/karin/AppData/Local/Android/Sdk`.

3. **Tarkista WSL:ssä** (jos `ls` epäonnistuu, polku on väärä tai SDK puuttuu):

   ```bash
   ls /mnt/c/Users/karin/AppData/Local/Android/Sdk/platform-tools
   ```

4. **`local.properties`:** vain **yksi** aktiivinen `sdk.dir=`-rivi (ei Windows-muotoista polkua WSL-Gradleen). Ei lainausmerkkejä polun ympärillä. Tallenna UTF-8 ilman BOM:ia.

5. Jos SDK on **D:-levyllä** tms.: käytä `/mnt/d/...` vastaavasti.

### `run-android`: `adb: not found` ja `No emulators found`, mutta Gradle jatkaa

Jos `npx react-native run-android` tulostaa `/bin/sh: 1: adb: not found` ja **Failed to launch emulator** / **No emulators found**, mutta heti perään tulee **Installing the app...** ja Gradle etenee (NDK, configure), **`sdk.dir` on oikein**. Varoitukset koskevat vain laitteen/emulaattorin löytämistä:

1. Lisää **`platform-tools`** (ja tarvittaessa **`emulator`**) PATHiin — katso alla.
2. Luo/käynnistä **AVD** Android Studio → *Device Manager*, tai yhdistä **fyysinen laite** (USB WSL:ssä vaatii erikseen; katso kohta 6).

Esimerkki yhdestä sessiosta (`korvaa SDK-polku tarvittaessa`):

```bash
export ANDROID_HOME=/mnt/c/Users/karin/AppData/Local/Android/Sdk
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

### Virhe: `adb: not found`

WSL:ssä ei ole `adb`:tä PATHissa. Kun ajat `adb devices`, Ubuntu voi ehdottaa esim. `sudo apt install adb` — se on **oikea ratkaisu** (tai alla oleva vanhempi pakettinimi).

**Vaihtoehto A — apt (nopea):**

```bash
sudo apt update && sudo apt install -y adb
```

Jos `adb`-pakettia ei löydy, kokeile: `sudo apt install -y android-tools-adb`.

**Vaihtoehto B — sama `adb` kuin Android Studiossa** (versio pysyy linjassa SDK:n kanssa): lisää SDK:n `platform-tools` PATHiin (kun `sdk.dir` on oikein):

```bash
export PATH="$PATH:/mnt/c/Users/karin/AppData/Local/Android/Sdk/platform-tools"
```

### Gradle / DeviceMonitor: `Can't find adb server on port 5037` (WSL)

Jos lokissa toistuu: `Unable to open connection to ADB server` / `Can't find adb server on port 5037` vaikka `adb start-server` näyttää onnistuvan, syy on usein tämä: **Gradle ja Android-työkalut pyörivät Linuxissa (WSL)** ja yrittävät yhteyttä osoitteeseen `127.0.0.1:5037` **WSL:n** puolella. **`/mnt/c/.../platform-tools/adb`** käynnistää puolestaan **Windowsin** adb-palvelimen, joka kuuntelee Windowsissa — ei WSL:n localhostissa. Siksi yhteys evätään.

**Käytännön ratkaisu:** aja **`npx react-native run-android` Windows PowerShellissa** (`D:\amk\mob-project`), emulaattori käynnissä Windowsissa. Vaihtoehtoisesti WSL:ssä vain **Linuxin** `adb` (`apt install adb`) ja emulaattorin yhdistäminen Windows-isäntään (monimutkaisempaa).

Jos `adb devices` tulostaa vain **List of devices attached** ja alla ei ole rivejä, `adb` toimii mutta **ei yhtään laitetta** (ei käynnissä olevaa emulaattoria; WSL2:ssa USB-puhelin ei näy ilman usbipd:tä / langatonta adb:tä). Käynnistä AVD Android Studiossa tai katso kohta 6.

Helpoin tapa välttää WSL + USB -ongelmat: aja **`npx react-native run-android` Windows PowerShellissa** (`D:\amk\mob-project`), Metro voi pyöriä erikseen.

## 6. Android: WSL2 ja USB-puhelin

WSL2 **ei näe USB-laitetta oletuksena**. Vaihtoehdot:

| Tapaa | Kuvaus |
|--------|--------|
| **A) PowerShell** | Sama repo: `cd D:\amk\mob-project` → `npx react-native run-android` (Metro voi pyöriä WSL:ssä tai Windowsissa; tarvittaessa sama verkko / `adb reverse`) |
| **B) usbipd-win** | Asenna [usbipd-win](https://github.com/dorssel/usbipd-win), liitä puhelin WSL:ään ohjeen mukaan, sitten WSL:ssä `adb devices` ja `npx react-native run-android` |
| **C) Langaton adb** | `adb tcpip 5555` Windowsissa, sitten WSL:ssä `adb connect <puhelimen-ip>:5555` |

Gradle-build `/mnt/d/`:lla on myös **hitaampi** kuin Linux-levyllä (`~/projektit/...`). Jos tuntuu tahmealta, kloonaa repo WSL:n sisäiseen polkuun (esim. `~/code/mob-project`) ja työskentele sieltä.

### CMake / NDK: `Hard link ... failed. Doing a slower copy instead`

Näet tämän usein, kun **Gradle-cache** on Linuxin kotihakemistossa (`~/.gradle/...`) mutta **`android/app/build`** on Windows-levyllä (`/mnt/d/...`). Eri tiedostojärjestelmien välillä **hard link ei onnistu**; CMake kopioi tiedoston normaalisti. Viesti on odotettu, ei virhe — build vain käyttää hieman enemmän aikaa ja levyä.

### `:app:installDebug` jää pitkäksi aikaa 98 % / `EXECUTING`

Tässä vaiheessa `adb` työntää APK:n laitteeseen tai emulaattoriin. **Ensimmäinen asennus** ja isot APK:t voivat kestää useita minuuteja; rivit `IDLE` ovat Gradlen tilanäyttöä, ei välttämättä jumi. Jos epäilet jumitusta: toisessa terminaalissa `adb devices` (laitteen pitää näkyä `device`, ei `unauthorized`), ja varmista että puhelin hyväksyy USB-debuggingin.

## 7. Tarkistus

```bash
touch /mnt/d/amk/mob-project/.wsl_write_test && rm /mnt/d/amk/mob-project/.wsl_write_test && echo "OK"
```

Jos `touch` epäonnistuu, `wsl.conf` + `wsl --shutdown` puuttuu tai polku on väärä.
