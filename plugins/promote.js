module.exports = {
    command: 'promote',
    category: 'group',
    description: 'Promote member to admin',
    admin: true,
    group: true,
    botAdmin: true,
    execute: async (sock, m, { reply }) => {
        let target = m.quoted ? m.quoted.sender : m.mentionedJid[0];
        if (!target) return reply("⚠️ Reply kwa mtu unayetaka kumpandisha cheo!");
        await sock.groupParticipantsUpdate(m.chat, [target], 'promote');
        reply(`🎖️ *ACCESS GRANTED:* Member is now a System Administrator.`);
    }
};
