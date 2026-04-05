console.clear();

const pino = require("pino");
const fs = require("fs");
const chalk = require("chalk");
const readline = require("readline");

let makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason;

const loadBaileys = async () => {
    const baileys = await import("@whiskeysockets/baileys");

    makeWASocket = baileys.default;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
    fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
    DisconnectReason = baileys.DisconnectReason;
};

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
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

        // ✅ FIXED BROWSER (NO ERROR)
        browser: ["Android", "Chrome", "1.0.0"],
        version,
    });

    // 🔥 Pairing Code System
    if (!sock.authState.creds.registered) {
        const phone = await question("Enter WhatsApp number (2557XXXXXXXX): ");
        const code = await sock.requestPairingCode(phone.trim());

        console.log("\n======================");
        console.log("PAIRING CODE:", code);
        console.log("======================\n");
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log(chalk.green("✅ Bot Connected Successfully"));
        }

        if (connection === "close") {
            const statusCode =
                lastDisconnect?.error?.output?.statusCode;

            const shouldReconnect =
                statusCode !== DisconnectReason.loggedOut;

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
}

startBot();
