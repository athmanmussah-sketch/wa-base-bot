/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * [ ROOT ACCESS GRANTED - FULL REPAIR ]
 */

console.clear();
const config = () => require('./settings/config');
process.on("uncaughtException", console.error);

let makeWASocket, Browsers, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, downloadContentFromMessage, jidNormalizedUser, isPnUser, makeCacheableSignalKeyStore;

const loadBaileys = async () => {
  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  Browsers = baileys.Browsers;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  DisconnectReason = baileys.DisconnectReason;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  jidDecode = baileys.jidDecode;
  downloadContentFromMessage = baileys.downloadContentFromMessage;
  jidNormalizedUser = baileys.jidNormalizedUser;
  isPnUser = baileys.isPnUser;
  makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
};

const pino = require('pino');
const FileType = require('file-type');
const readline = require("readline");
const fs = require('fs');
const chalk = require("chalk");
const path = require("path");
const os = require('os'); 

const { Boom } = require('@hapi/boom');
const { smsg } = require('./library/serialize');
const messageHandler = require("./message");

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(chalk.red.bold('┌──『 DARKX-V1 』\n└─⚡ ') + chalk.white(text), (answer) => {
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
        syncFullHistory: true,
        generateHighQualityLinkPreview: true
    });
    
    if (config().status.terminal && !sock.authState.creds.registered) {
        console.log(chalk.yellow("📡 [SIGNAL] Initializing Pairing Protocol..."));
        const phoneNumber = await question('ENTER TARGET NUMBER (e.g. 255xxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(chalk.black.bgRed.bold(` 🛠️  YOUR CYBER CODE: ${code} `));
    }
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'connecting') {
            console.log(chalk.blue('💉 [INJECTING] Initializing Core...'));
        }
        
        if (connection === 'open') {
            console.log(chalk.green.bold('🛡️  [SUCCESS] DARKX SYSTEM FULLY INTEGRATED!'));
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            sock.sendMessage(botNumber, {
                text: `☠️ *ᴅᴀʀᴋx sʏsᴛᴇᴍ ᴄᴏɴɴᴇᴄᴛᴇᴅ* ☠️\n\n_Host: ${os.hostname()}_\n_Core: v1.0.0_\n_Owner: ${config().owner[0]}_`,
            }).catch(console.error);
        }
        
        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output.statusCode : 0;
            if (statusCode !== DisconnectReason.loggedOut) {
                console.log(chalk.red(`⚠️ [CRASH] Connection lost. Rebooting system...`));
                setTimeout(clientstart, 3000);
            }
        }
    });

    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            
            // Log incoming messages to Terminal
            const from = mek.key.remoteJid;
            console.log(chalk.cyan(`📩 [NEW MESSAGE] From: ${from}`));

            // --- [ AUTO STATUS VIEW/REACT ] ---
            if (from === 'status@broadcast') {
                await sock.readMessages([mek.key]);
                await sock.sendMessage(from, { react: { text: '❤️', key: mek.key } }, { statusJidList: [mek.key.participant] });
                return; // Usisome commands kwenye status
            }
            
            // Public/Private Switch
            if (!sock.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            
            // CRITICAL FIX: Serialize message before passing to handler
            const m = await smsg(sock, mek);
            
            // Pass to message.js
            await messageHandler(sock, m, chatUpdate);

        } catch (err) {
            console.log(chalk.red('⚠️ [UPSERT ERROR]:'), err.message);
        }
    });

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

// Hot Reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    delete require.cache[file];
    require(file);
});
