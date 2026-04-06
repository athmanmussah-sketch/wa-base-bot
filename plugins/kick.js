module.exports = {
    command: 'kick',
    category: 'group',
    description: 'Remove a member from group',
    admin: true,
    group: true,
    botAdmin: true, // Inahitaji bot iwe admin
    execute: async (sock, m, { reply }) => {
        let target = m.quoted ? m.quoted.sender : m.mentionedJid[0];
        if (!target) return reply("⚠️ Reply kwa mtu au m-tag unayetaka kum-kick!");
        await sock.groupParticipantsUpdate(m.chat, [target], 'remove');
        reply(`🚫 *TARGET ELIMINATED:* Member has been removed from the network.`);
    }
};
