# 🤖 WA-BASE-BOT v1.2

![Version](https://img.shields.io/badge/version-1.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**WA-BASE-BOT** ni bot rahisi ya WhatsApp iliyotengenezwa kwa kutumia Node.js na library ya `@whiskeysockets/baileys`. Ni msingi mzuri kwa wale wanaotaka kutengeneza bot zao wenyewe kwa urahisi.

---

## 🚀 Vipengele (Features)
* **Fast Response:** Inatumia Baileys toleo la hivi karibuni.
* **Media Support:** Inasaidia picha, video, na audio (kupitia FFmpeg).
* **Encryption:** Usalama wa data kwa kutumia `crypto-js`.
* **Easy Setup:** Rahisi kusanidi na kuanza kutumia.

## 🛠 Mahitaji (Prerequisites)
Kabla ya kuanza, hakikisha unavyo vifaa hivi:
* [Node.js](https://nodejs.org/) (Toleo la 16 au zaidi)
* [FFmpeg](https://ffmpeg.org/) (Inahitajika kwa ajili ya media conversion)
* Simu yenye WhatsApp ili ku-scan QR Code.

## 📥 Ufungaji (Installation)

1.  **Clone repository:**
    ```bash
    git clone [https://github.com/username/WA-BASE-BOT.git](https://github.com/username/WA-BASE-BOT.git)
    cd WA-BASE-BOT
    ```

2.  **Sakinisha dependencies:**
    ```bash
    npm install
    ```

3.  **Anzisha Bot:**
    ```bash
    npm start
    ```

## ⚙️ Configuration
Unaweza kurekebisha mipangilio ya bot kwenye file la `index.js`. Hakikisha una-scan QR code itakayotokea kwenye terminal yako ili kuunganisha bot na WhatsApp.

## 📦 Dependencies Kuu
Mradi huu unatumia:
* `@whiskeysockets/baileys` - Kwa ajili ya muunganisho wa WhatsApp.
* `pino` - Kwa ajili ya logging.
* `fluent-ffmpeg` - Kwa ajili ya usindikaji wa video na sauti.
* `axios` - Kwa ajili ya maombi ya API.

## 👨‍💻 Mwandishi (Author)
* **Debraj** - *Lead Developer*

## 📜 Leseni (License)
Mradi huu upo chini ya leseni ya **MIT**. Unaweza kuutumia na kuubadilisha upendavyo.
