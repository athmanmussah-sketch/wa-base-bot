/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * GROUP TAGGING MODULE... 
 */

module.exports = {
    command: 'tagall',
    category: 'group',
    description: 'Tag all group members',
    admin: true,  // Admin pekee
    group: true,  // Inafanya kazi kwenye kundi tu
    execute: async (sock, m, { text, participants, reply }) => {
        try {
            // Ujumbe wa kuanzia kama hakuna text iliyoandikwa
            let message = text ? text : "Attention all units! 📢";
            
            let darkXTag = `☠️ *DARKX GROUP EXPLOIT: TAGALL* ☠️\n\n`;
            darkXTag += `📢 *Message:* ${message}\n\n`;
            
            // Tunatengeneza list ya ma-mention (JID)
            let mentions = [];
            for (let mem of participants) {
                darkXTag += `> ☢️ @${mem.id.split('@')[0]}\n`;
                mentions.push(mem.id);
            }
            
            darkXTag += `\n*SYSTEM MONITOR: TOTAL UNITS [${participants.length}]*`;

            // Kutuma meseji yenye mentions zote
            await sock.sendMessage(m.chat, { 
                text: darkXTag, 
                mentions: mentions 
            }, { quoted: m });

        } catch (err) {
            console.log(err);
            reply("❌ _Protocol failed to broadcast mentions._");
        }
    }
};
