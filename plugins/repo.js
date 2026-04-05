/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * REPOSITORY ACCESS MODULE... 
 */

const chalk = require("chalk");

module.exports = {
    command: 'repo',
    category: 'general',
    description: 'Get the bot source code',
    execute: async (sock, m, { reply, config }) => {
        const repoUrl = "https://github.com/athmanmussah-sketch/wa-base-bot";
        
        let darkXRepo = `
☠️ *DARKX SYSTEM: REPOSITORY* ☠️
┌──『 *SOURCE DATA* 』──⊷
│ 📦 *Base:* WA-BASE-BOT
│ 🧬 *Owner:* Mussah (DarkX)
│ 🛠️ *Language:* JavaScript
│ 🛰️ *Status:* Open Source
└─────────────┈⊷

⚠️ *IMPORTANT PROTOCOL:*
Do not forget to **FORK** and **STAR** the repository to support the core development.

_Injecting redirect link..._
`;

        await sock.sendMessage(m.chat, {
            text: darkXRepo,
            contextInfo: {
                externalAdReply: {
                    title: "ROOT@DARKX_REPO:~$ GO TO GITHUB",
                    body: "Click here to fork & star the core source.",
                    mediaType: 1,
                    thumbnailUrl: "https://i.ibb.co/L5r6f2R/IMG-20240103-100222-772.jpg", 
                    sourceUrl: repoUrl, // Hii ndio inafanya iwe kama button ya "Go"
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        console.log(chalk.green.bold(`[SYSTEM] Repository data sent to ${m.sender.split('@')[0]}`));
    }
};
