const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
    command: 'vv',
    category: 'owner',
    description: 'Download ViewOnce media',
    execute: async (sock, m, { reply }) => {
        if (!m.quoted || m.quoted.mtype !== 'viewOnceMessageV2') return reply("Reply kwenye picha ya ViewOnce!");
        
        const msg = m.quoted.message;
        const type = Object.keys(msg)[0];
        const media = await downloadContentFromMessage(msg[type], type.replace('Message', ''));
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        if (/image/.test(type)) {
            await sock.sendMessage(m.chat, { image: buffer, caption: '✅ *DARKX VV EXPLOIT*' }, { quoted: m });
        } else {
            await sock.sendMessage(m.chat, { video: buffer, caption: '✅ *DARKX VV EXPLOIT*' }, { quoted: m });
        }
    }
};
