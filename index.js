/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * ROOT ACCESS GRANTED... 
 */

console.clear();
const config = () => require('./settings/config');
process.on("uncaughtException", console.error);

let makeWASocket, Browsers, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, downloadContentFromMessage, jidNormalizedUser, isPnUser;

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
};

const pino = require('pino');
const FileType = require('file-type');
const readline = require("readline");
const fs = require('fs');
const chalk = require("chalk");
const path = require("path");

const { Boom } = require('@hapi/boom');
const { getBuffer } = require('./library/function');
const { smsg } = require('./library/serialize');
const { videoToWebp, writeExifImg, writeExifVid, addExif, toPTT, toAudio } = require('./library/exif');

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(chalk.cyan.bold('root@darkx:~# ') + chalk.white(text), (answer) => {
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
    [ SYSTEM INITIALIZING... DARKX v1.0.0 ]
    `));

    const randomBrowser = Browsers.appropriate('Chrome');
    
    const store = {
        messages: new Map(),
        contacts: new Map(),
        groupMetadata: new Map(),
        loadMessage: async (jid, id) => store.messages.get(`${jid}:${id}`) || null,
        bind: (ev) => {
            ev.on('messages.upsert', ({ messages }) => {
                for (const msg of messages) {
                    if (msg.key?.remoteJid && msg.key?.id) {
                        store.messages.set(`${msg.key.remoteJid}:${msg.key.id}`, msg);
                    }
                }
            });
        }
    };
    
    const { state, saveCreds } = await useMultiFileAuthState(`./${config().session}`);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !config().status.terminal,
        auth: state,
        version: version,
        browser: randomBrowser
    });
    
    if (config().status.terminal && !sock.authState.creds.registered) {
        console.log(chalk.yellow("📡 Pairing protocol requested..."));
        const phoneNumber = await question('Enter WhatsApp number (e.g. 255xxx):\n');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(chalk.black.bgGreen.bold(` 🔑 YOUR DARKX PAIRING CODE: ${code} `));
    }
    
    store.bind(sock.ev);
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (connection === 'connecting') {
            console.log(chalk.cyan('💉 Injecting connection packets...'));
        }
        
        if (connection === 'open') {
            console.log(chalk.green.bold('✅ SERVER STATUS: ONLINE [DARKX-V1]'));
            
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            sock.sendMessage(botNumber, {
                text:
                    `☠️ *DARKX SYSTEM CONNECTED* ☠️\n\n` +
                    `> 👤 *Owner:* DarkX\n` +
                    `> 🛰️ *Host:* Server_Terminal\n` +
                    `> ⚡ *Speed:* Optimized\n` +
                    `> ⚙️ *Mode:* ${sock.public ? 'Public' : 'Self'}\n\n` +
                    `_System successfully integrated._`,
            }).catch(console.error);
        }
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(chalk.red('❗ CONNECTION SEVERED:'), lastDisconnect?.error?.message);
            
            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Rebooting system in 5s...'));
                setTimeout(clientstart, 5000);
            } else {
                console.log(chalk.red.bold('🚫 UNAUTHORIZED LOGOUT: ACCESS REVOKED.'));
            }
        }
        
        if (qr) {
            console.log(chalk.magenta('📱 SCAN THE SECURE GATEWAY (QR CODE):'));
        }
        
        const { konek } = require('./library/connection/connection');
        konek({ sock, update, clientstart, DisconnectReason, Boom });
    });

    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            
            mek.message = Object.keys(mek.message)[0] === 'ephemeralMessage' 
                ? mek.message.ephemeralMessage.message 
                : mek.message;
            
            if (config().status.reactsw && mek.key && mek.key.remoteJid === 'status@broadcast') {
                let emoji = ['💀', '🔥', '🧬', '🛡️', '🛰️', '☣️', '🌑'];
                let sigma = emoji[Math.floor(Math.random() * emoji.length)];
                await sock.readMessages([mek.key]);
                await sock.sendMessage('status@broadcast', { react: { text: sigma, key: mek.key } }, { statusJidList: [mek.key.participant] });
            }
            
            if (!sock.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            
            const m = await smsg(sock, mek, store);
            require("./message")(sock, m, chatUpdate, store);
        } catch (err) {
            console.log(chalk.red('Error in Upsert:'), err);
        }
    });

    // Custom Helpers for DarkX
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    sock.public = config().status.public;

    sock.sendText = async (jid, text, quoted = '', options) => {
        return sock.sendMessage(jid, { text: text, ...options }, { quoted });
    };

    return sock;
};

clientstart();

// Anti-Error Handler
const ignoredErrors = ['Socket connection timeout', 'EKEYTYPE', 'item-not-found', 'rate-overlimit', 'Connection Closed'];
process.on('unhandledRejection', reason => {
    if (ignoredErrors.some(e => String(reason).includes(e))) return;
    console.log(chalk.red('Unhandled Matrix Error:'), reason);
});

// Auto Reload Protocol
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    delete require.cache[file];
    console.log(chalk.green.bold(`♻️ SYSTEM RELOADED: ${path.basename(file)}`));
    require(file);
});
