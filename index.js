/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * [ FINAL EMERGENCY OVERRIDE - BY G-3 ]
 */

console.clear();
const config = () => require('./settings/config');
const { smsg } = require('./library/serialize'); // Tunaiweka kama backup
const messageHandler = require("./message");
const fs = require('fs');
const chalk = require("chalk");
const pino = require('pino');
const os = require('os');
const { Boom } = require('@hapi/boom');

let makeWASocket, Browsers, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore;

const loadBaileys = async () => {
    const baileys = await import('@whiskeysockets/baileys');
    makeWASocket = baileys.default;
    Browsers = baileys.Browsers;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
    DisconnectReason = baileys.DisconnectReason;
    fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
    makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
};

async function startBot() {
    await loadBaileys();
    const { state, saveCreds } = await useMultiFileAuthState(`./${config().session}`);
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS('Desktop')
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(chalk.green.bold('\n✅ [CORE] SYSTEM ONLINE - DARKX V1 ACTIVATED!'));
            sock.sendMessage(sock.user.id, { text: '☠️ DARKX IS NOW ACTIVE AND LISTENING...' });
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) startBot();
        }
    });

    // TESTER: Hii ndio itatuambia kama meseji zinafika
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            // 1. FORCE LOG: Kama hii haitokei, tatizo ni Session/WhatsApp connection
            console.log(chalk.bgCyan.black(` 📩 MSG DETECTED: from [${mek.key.remoteJid}] `));

            // 2. INTERNAL SERIALIZATION (Bypass serialize.js if it fails)
            let m = await smsg(sock, mek); 
            if (!m || !m.body) {
                // Kama smsg imefeli, tunatengeneza m.body yetu hapa hapa
                m.body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
            }

            // 3. SEND TO HANDLER
            await messageHandler(sock, m, chatUpdate);

        } catch (err) {
            console.log(chalk.red("FATAL ERROR:"), err);
        }
    });

    sock.public = true; 
    return sock;
}

startBot();
