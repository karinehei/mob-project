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
