module.exports = {
    command: 'setgname',
    category: 'group',
    description: 'Change group subject',
    admin: true,
    group: true,
    botAdmin: true,
    execute: async (sock, m, { text, reply }) => {
        if (!text) return reply("⚠️ Ingiza jina jipya la kundi!");
        await sock.groupUpdateSubject(m.chat, text);
        reply(`📝 *SYSTEM UPDATE:* Group name changed to: ${text}`);
    }
};
