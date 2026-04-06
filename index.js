/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * [ ROOT ACCESS GRANTED - EMERGENCY FIX ]
 */

console.clear();
const config = () => require('./settings/config');
process.on("uncaughtException", console.error);

let makeWASocket, Browsers, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, jidNormalizedUser, makeCacheableSignalKeyStore;

const loadBaileys = async () => {
  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  Browsers = baileys.Browsers;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  DisconnectReason = baileys.DisconnectReason;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  jidDecode = baileys.jidDecode;
  jidNormalizedUser = baileys.jidNormalizedUser;
  makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
};

const pino = require('pino');
const readline = require("readline");
const fs = require('fs');
const chalk = require("chalk");
const os = require('os'); 

const { Boom } = require('@hapi/boom');
const { smsg } = require('./library/serialize');
const messageHandler = require("./message");

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(chalk.red.bold('root@darkx:~# ') + chalk.white(text), (answer) => {
            resolve(answer);
            rl.close();
        });
    });
};

const clientstart = async() => {
    await loadBaileys();
    
    console.log(chalk.red.bold(`
    ██████╗  █████╗ ██████╗ ██╗  ██╗██╗  ██╗
    ██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝╚██╗██╔╝
    ██║  ██║███████║██████╔╝█████╔╝  ╚███╔╝ 
    ██║  ██║██╔══██║██╔══██╗██╔═██╗  ██╔██╗ 
    ██████╔╝██║  ██║██║  ██║██║  ██╗██╔╝ ██╗
    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
    [ ᴠᴇʀsɪᴏɴ: 1.0.0 | sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ | ᴅᴇᴠ: ᴍᴜssᴀʜ ]
    `));

    const { state, saveCreds } = await useMultiFileAuthState(`./${config().session}`);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !config().status.terminal,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        version: version,
        browser: Browsers.macOS('Desktop'),
        // Hizi mbili ni muhimu kwa utulivu wa connection
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true
    });
    
    if (config().status.terminal && !sock.authState.creds.registered) {
        const phoneNumber = await question('ENTER NUMBER (e.g. 255xxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(chalk.black.bgRed.bold(` 🛠️  YOUR CODE: ${code} `));
    }
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'connecting') console.log(chalk.blue('💉 Initializing Core...'));
        if (connection === 'open') {
            console.log(chalk.green.bold('🛡️  [SUCCESS] DARKX SYSTEM FULLY INTEGRATED!'));
            sock.sendMessage(sock.user.id, { text: `☠️ *DARKX ONLINE*` });
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) clientstart();
        }
    });

    // --- HAPA NDIO PA KUREREKEBISHA ---
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            if (chatUpdate.type !== 'notify') return;
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            // Debugger: Lazima uone hii kwenye Termux sasa!
            console.log(chalk.magenta(`📩 [INCOMING] From: ${mek.key.remoteJid.split('@')[0]}`));

            // Serialize message
            const m = smsg(sock, mek);
            
            // Call the handler
            await messageHandler(sock, m, chatUpdate);

        } catch (err) {
            console.log(chalk.red('⚠️ UPSERT ERROR:'), err);
        }
    });

    // Decode JID logic
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    sock.public = config().status.public;
    return sock;
};

clientstart();
