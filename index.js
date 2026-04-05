console.clear();

const config = () => require('./settings/config');
process.on("uncaughtException", console.error);

const pino = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const readline = require('readline');
const path = require('path');
const { Boom } = require('@hapi/boom');
const FileType = require('file-type');

let makeWASocket, Browsers, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, downloadContentFromMessage;

const loadBaileys = async () => {
    const baileys = await import('@whiskeysockets/baileys');

    makeWASocket = baileys.default;
    Browsers = baileys.Browsers;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
    DisconnectReason = baileys.DisconnectReason;
    fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
    jidDecode = baileys.jidDecode;
    downloadContentFromMessage = baileys.downloadContentFromMessage;
};

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(text, (ans) => {
            rl.close();
            resolve(ans);
        });
    });
};

async function startBot() {
    await loadBaileys();

    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version,
        browser: Browsers.android("Chrome")
    });

    // 🔥 PAIRING CODE FIXED
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question("\nEnter WhatsApp number (2557XXXXXXXX): ");
        const code = await sock.requestPairingCode(phoneNumber.trim());

        console.log("\n========================");
        console.log("PAIRING CODE:", code);
        console.log("========================\n");
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log(chalk.green("✅ Bot Connected Successfully"));
        }

        if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(chalk.red("❌ Connection closed"));

            if (shouldReconnect) {
                console.log(chalk.yellow("🔄 Reconnecting..."));
                startBot();
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        console.log("📩 New message received");
    });

    return sock;
}

startBot();
