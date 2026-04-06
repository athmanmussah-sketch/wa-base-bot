// ☠️ DARKX OFFICIAL BOT - CYBER CORE CONFIGURATION ☠️
// Developed by: Mussah (DarkX)
// Version: 1.0.0 (2026)

const fs = require('fs');
const chalk = require('chalk');

const config = {
    owner: ["255753557930"], // FIXED: Imewekwa kwenye mabano [] ili iwe list/array
    botNumber: "255753557930", 
    setPair: "DARKX-V1",
    thumbUrl: "https://i.imgur.com/IkEv97P.jpeg", 
    session: "sessions",
    
    status: {
        public: true,        
        terminal: true,      
        reactsw: true,       
        auto_reply_status: false 
    },

    message: {
        owner: "⚠️ [ACCESS DENIED] - This protocol is for DarkX (Mussah) only.",
        group: "⚠️ [ERROR] - This command requires Group Network Access.",
        admin: "⚠️ [RESTRICTED] - Root privileges required (Admin only).",
        private: "⚠️ [SECURE LINE] - Private encrypted chat only.",
        wait: "⏳ [INITIALIZING] - Injecting packets, please wait..."
    },

    settings: {
        title: "DARKX OFFICIAL BOT",
        packname: 'DARKX-V1',
        author: 'Mussah-DarkX',
        description: "Advanced WA Bot System - Developed by DarkX",
        footer: "☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ : ᴛʜᴇ ᴇɴᴅ ᴏғ ᴛʜᴇ ʟɪɴᴇ"
    },

    newsletter: {
        name: "DARKX CYBER HUB",
        id: "120363294382834571@newsletter" 
    },

    api: {
        baseurl: "https://hector-api.vercel.app/",
        apikey: "hector"
    },

    sticker: {
        packname: "DARKX-BOT",
        author: "Mussah-Dev"
    }
}

module.exports = config;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.green.bold(`\n♻️  CONFIG UPDATED: ${file}`));
    delete require.cache[file];
    require(file);
});
