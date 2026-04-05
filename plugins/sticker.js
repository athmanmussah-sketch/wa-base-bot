const { videoToWebp, writeExifImg } = require('../library/exif');

module.exports = {
    command: 'sticker',
    category: 'convert',
    description: 'Convert image to sticker',
    execute: async (sock, m, { quoted, mime, reply }) => {
        if (!quoted) return reply("Reply kwenye picha mzee!");
        if (/image/.test(mime)) {
            let media = await quoted.download();
            // Hapa tunatumia jina la DarkX kwenye sticker metadata
            let sticker = await writeExifImg(media, { packname: "DarkX Bot", author: "Mussah" });
            await sock.sendMessage(m.chat, { sticker: sticker }, { quoted: m });
        } else {
            reply("Hii inafanya kazi kwenye picha tu kwa sasa!");
        }
    }
};
