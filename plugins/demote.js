module.exports = {
    command: 'demote',
    category: 'group',
    description: 'Demote admin to member',
    admin: true,
    group: true,
    botAdmin: true,
    execute: async (sock, m, { reply }) => {
        let target = m.quoted ? m.quoted.sender : m.mentionedJid[0];
        if (!target) return reply("⚠️ Reply kwa admin unayetaka kumshusha cheo!");
        await sock.groupParticipantsUpdate(m.chat, [target], 'demote');
        reply(`📉 *ACCESS REVOKED:* Member has been demoted to standard unit.`);
    }
};
