/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * CORE MESSAGE HANDLER [STABILITY FIX]
 */

const config = require('./settings/config');
const fs = require('fs');
const path = require("path");
const chalk = require("chalk");

// Thumbnail Assets
const image = fs.existsSync('./thumbnail/image.jpg') ? fs.readFileSync('./thumbnail/image.jpg') : Buffer.alloc(0);

let jidNormalizedUser, getContentType, isPnUser;

const loadBaileysUtils = async () => {
    const baileys = await import('@whiskeysockets/baileys');
    jidNormalizedUser = baileys.jidNormalizedUser;
    getContentType = baileys.getContentType;
    isPnUser = baileys.isPnUser;
};

class PluginLoader {
    constructor() {
        this.plugins = new Map();
        this.categories = new Map();
        this.pluginsDir = path.join(__dirname, 'plugins');
        this.defaultCategories = {
            'ai': '🤖 ᴄʏʙᴇʀ ᴀɪ',
            'downloader': '📥 ᴅᴀᴛᴀ ᴇxᴘʟᴏɪᴛ',
            'fun': '🎮 sʏsᴛᴇᴍ ɢᴀᴍᴇ',
            'general': '⚡ ᴄᴏʀᴇ ᴀᴄᴄᴇss',
            'group': '👥 ɴᴇᴛᴡᴏʀᴋ ʜᴜʙ',
            'owner': '👑 ʀᴏᴏᴛ ᴀᴅᴍɪɴ',
            'logo': '🎨 ɢʀᴀᴘʜɪᴄ ᴄᴏʀᴇ',
            'search': '🔍 ᴅᴀᴛᴀʙᴀsᴇ sᴇᴀʀᴄʜ',
            'tools': '🛠️ ᴜᴛɪʟɪᴛɪᴇs'
        };
        this.loadPlugins();
    }

    loadPlugins() {
        try {
            const pluginFiles = fs.readdirSync(this.pluginsDir).filter(file => file.endsWith('.js'));
            this.plugins.clear();
            this.categories.clear();
            Object.keys(this.defaultCategories).forEach(cat => this.categories.set(cat, []));

            for (const file of pluginFiles) {
                const plugin = require(path.join(this.pluginsDir, file));
                if (plugin.command) {
                    this.plugins.set(plugin.command, plugin);
                    const cat = plugin.category || 'general';
                    if (!this.categories.has(cat)) this.categories.set(cat, []);
                    this.categories.get(cat).push(plugin.command);
                }
            }
        } catch (e) { console.log(e); }
    }

    async executePlugin(command, sock, m, pluginArgs) {
        const plugin = this.plugins.get(command);
        if (!plugin) return false;
        
        // Security Checks
        if (plugin.owner && !pluginArgs.isCreator) return true;
        if (plugin.group && !m.isGroup) return true;
        if (plugin.admin && m.isGroup && !pluginArgs.isAdmins && !pluginArgs.isCreator) return true;
        if (plugin.botAdmin && m.isGroup && !pluginArgs.isBotAdmins) {
            pluginArgs.reply("⚠️ Bot must be Admin to execute this.");
            return true;
        }

        try {
            await plugin.execute(sock, m, pluginArgs);
            return true;
        } catch (e) {
            console.error(chalk.red(`Error in plugin ${command}:`), e);
            return true;
        }
    }

    getMenuSections() {
        let sections = "";
        for (const [category, commands] of this.categories.entries()) {
            if (commands.length > 0 && this.defaultCategories[category]) {
                sections += `╭───┈⊷ *${this.defaultCategories[category]}*\n${commands.sort().map(cmd => `│ ☢️ ${cmd}`).join('\n')}\n╰──────────────┈⊷\n\n`;
            }
        }
        return sections;
    }
}

const loader = new PluginLoader();

module.exports = async (sock, m) => {
    try {
        if (!jidNormalizedUser) await loadBaileysUtils();

        const body = (m.mtype === 'conversation' ? m.message.conversation : m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : m.mtype === 'imageMessage' ? m.message.imageMessage.caption : m.mtype === 'videoMessage' ? m.message.videoMessage.caption : '') || '';
        const prefix = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤Ω Φ_&><`™©®Δ^βα~¦|/\\©^]/.test(body) ? body.match(/^[°zZ#$@*+,.?=''():√%!¢£¥€π¤Ω Φ_&><`™©®Δ^βα~¦|/\\©^]/)[0] : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const isCreator = config.owner.includes(m.sender.split('@')[0]) || m.key.fromMe;

        // Group Intelligence
        const groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat) : {};
        const participants = m.isGroup ? groupMetadata.participants : [];
        const groupAdmins = m.isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : [];
        const isBotAdmins = m.isGroup ? groupAdmins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net') : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

        const reply = async (text) => {
            await sock.sendMessage(m.chat, { text, contextInfo: { externalAdReply: { title: "ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ", body: "sʏsᴛᴇᴍ ᴀᴄᴛɪᴠᴇ", thumbnailUrl: config.thumbUrl, mediaType: 1, renderLargerThumbnail: true }}}, { quoted: m });
        };

        // Inject variables to plugins
        const pluginArgs = { args, text, isCreator, isAdmins, isBotAdmins, participants, groupMetadata, reply, prefix, config };
        
        const executed = await loader.executePlugin(command, sock, m, pluginArgs);
        if (executed) return;

        switch (command) {
            case 'menu':
                const audioPath = './media/audio_menu.mp3';
                if (fs.existsSync(audioPath)) await sock.sendMessage(m.chat, { audio: fs.readFileSync(audioPath), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
                
                let menuText = `╭───┈⊷ *ᴅᴀʀᴋx ᴄʏʙᴇʀ ᴄᴏʀᴇ*\n│ 👤 *ᴜsᴇʀ:* ${m.pushName || 'Guest'}\n│ 🛰️ *ʟᴀᴛᴇɴᴄʏ:* ${new Date() - m.messageTimestamp * 1000}ᴍs\n╰──────────────┈⊷\n\n${loader.getMenuSections()}*☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ*`;
                
                await sock.sendMessage(m.chat, { image: image, caption: menuText, contextInfo: { externalAdReply: { title: "ʀᴏᴏᴛ@ᴅᴀʀᴋx_ᴠɪ:~", body: "ᴅᴀʀᴋ ᴡᴇʙ ɪɴᴛᴇɢʀᴀᴛɪᴏɴ", mediaType: 1, thumbnailUrl: config.thumbUrl, renderLargerThumbnail: true, sourceUrl: "https://github.com/athmanmussah-sketch" }}}, { quoted: m });
                break;

            case 'reload':
                if (!isCreator) return reply("⚠️ [ACCESS DENIED]");
                loader.loadPlugins();
                reply("♻️ *sʏsᴛᴇᴍ ʀᴇʙᴏᴏᴛᴇᴅ*");
                break;
        }
    } catch (e) { console.log(chalk.red("Error:"), e); }
};
