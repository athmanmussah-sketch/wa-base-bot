// ☠️ DARKX OFFICIAL BOT - CYBER CORE CONFIGURATION ☠️
// Developed by: Mussah (DarkX)
// Version: 1.0.0 (2026)

const fs = require('fs');
const chalk = require('chalk');

const config = {
    owner: "255753557930", // Weka namba yako hapa (Mussah)
    botNumber: "255753557930", // Namba ya bot yako
    setPair: "DARKX-V1",
    thumbUrl: "https://i.imgur.com/IkEv97P.jpeg", // Picha ya bot
    session: "sessions",
    
    // --- [ SYSTEM STATUS SWITCHES ] ---
    status: {
        public: true,        // Weka false kama unataka bot ikujibu wewe pekee
        terminal: true,      // QR au Pairing code ionekane kwenye Termux
        reactsw: true,       // Auto React Status (Kopa ❤️)
        auto_reply_status: false // FIXED: Hapa ndio unazima/kuwasha ile Auto Reply Status
    },

    // --- [ ENCRYPTED RESPONSES ] ---
    message: {
        owner: "⚠️ [ACCESS DENIED] - This protocol is for DarkX (Mussah) only.",
        group: "⚠️ [ERROR] - This command requires Group Network Access.",
        admin: "⚠️ [RESTRICTED] - Root privileges required (Admin only).",
        private: "⚠️ [SECURE LINE] - Private encrypted chat only.",
        wait: "⏳ [INITIALIZING] - Injecting packets, please wait..."
    },

    // --- [ METADATA & BRANDING ] ---
    settings: {
        title: "DARKX OFFICIAL BOT",
        packname: 'DARKX-V1',
        author: 'Mussah-DarkX',
        description: "Advanced WA Bot System - Developed by DarkX",
        footer: "☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ : ᴛʜᴇ ᴇɴᴅ ᴏғ ᴛʜᴇ ʟɪɴᴇ"
    },

    // --- [ CHANNEL & NEWSLETTER ] ---
    newsletter: {
        name: "DARKX CYBER HUB",
        id: "120363294382834571@newsletter" // Badilisha na ID yako kama unayo
    },

    // --- [ API SERVICES ] ---
    api: {
        baseurl: "https://hector-api.vercel.app/",
        apikey: "hector"
    },

    // --- [ STICKER METADATA ] ---
    sticker: {
        packname: "DARKX-BOT",
        author: "Mussah-Dev"
    }
}

module.exports = config;

// --- [ AUTO-RELOAD PROTOCOL ] ---
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.green.bold(`\n♻️  CONFIG UPDATED: ${file}`));
    delete require.cache[file];
    require(file);
});
