module.exports = {
    command: 'hidetag',
    category: 'group',
    description: 'Tag all members silently',
    admin: true,
    group: true,
    execute: async (sock, m, { text, participants }) => {
        if (!text) return m.reply("Weka meseji unayotaka kutuma!");
        sock.sendMessage(m.chat, { 
            text: text, 
            mentions: participants.map(a => a.id) 
        });
    }
};
