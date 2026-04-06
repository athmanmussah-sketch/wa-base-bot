module.exports = {
    command: 'setgdesc',
    category: 'group',
    description: 'Change group description',
    admin: true,
    group: true,
    botAdmin: true,
    execute: async (sock, m, { text, reply }) => {
        if (!text) return reply("⚠️ Ingiza maelezo mapya ya kundi!");
        await sock.groupUpdateDescription(m.chat, text);
        reply(`📖 *SYSTEM UPDATE:* Group description has been updated.`);
    }
};
