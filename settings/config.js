// ☠️ DarkX Official Bot - 2026. All Rights Reserved.
// System Encrypted by DarkX. 
// Respect the work, don't just copy-paste.

const fs = require('fs')

const config = {
    owner: "255xxxxxxxxx", // Weka namba yako ya simu hapa (mfano: 255712345678)
    botNumber: "255xxxxxxxxx", // Weka namba ya bot hapa
    setPair: "DARKX-V1",
    thumbUrl: "https://i.imgur.com/IkEv97P.jpeg", // Badilisha link hii uweke picha yako ya DarkX
    session: "sessions",
    status: {
        public: true,
        terminal: true,
        reactsw: false
    },
    message: {
        owner: "⚠️ [ACCESS DENIED] - This protocol is for DarkX only.",
        group: "⚠️ [ERROR] - This command requires Group Network Access.",
        admin: "⚠️ [RESTRICTED] - Root privileges required (Admin only).",
        private: "⚠️ [SECURE LINE] - Private encrypted chat only."
    },
    mess: {
        owner: '❌ Root access required! Command restricted to DarkX.',
        done: '✅ System update successful!',
        error: '❗ [CRITICAL_ERROR] - Operation failed!',
        wait: '⏳ [INITIALIZING] - Please wait for data retrieval...'
    },
    settings: {
        title: "DARKX OFFICIAL BOT",
        packname: 'DARKX-V1',
        description: "Advanced WA Bot System - Developed by DarkX",
        author: 'https://github.com/DarkX-Official',
        footer: "☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ : ᴛʜᴇ ᴇɴᴅ ᴏғ ᴛʜᴇ ʟɪɴᴇ"
    },
    newsletter: {
        name: "DARKX CYBER HUB",
        id: "0@newsletter"
    },
    api: {
        baseurl: "https://hector-api.vercel.app/",
        apikey: "hector"
    },
    sticker: {
        packname: "DARKX OFFICIAL",
        author: "DARKX-BOT"
    }
}

module.exports = config;

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
