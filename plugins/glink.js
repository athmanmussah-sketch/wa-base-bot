module.exports = {
    command: 'glink',
    category: 'group',
    description: 'Get group invite link',
    group: true,
    botAdmin: true,
    execute: async (sock, m, { reply }) => {
        const code = await sock.groupInviteCode(m.chat);
        reply(`🔗 *GROUP ACCESS LINK:*\nhttps://chat.whatsapp.com/${code}`);
    }
};
