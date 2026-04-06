/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * CORE MESSAGE HANDLER [ENHANCED EDITION]
 */

const config = require('./settings/config');
const fs = require('fs');
const crypto = require("crypto");
const path = require("path");
const os = require('os');
const chalk = require("chalk");
const axios = require('axios');
const { exec } = require('child_process');
const { dechtml, fetchWithTimeout } = require('./library/function');       
const { tempfiles } = require("./library/uploader");
const { fquoted } = require('./library/quoted');     
const Api = require('./library/Api');

// Thumbnail Assets
const image = fs.existsSync('./thumbnail/image.jpg') ? fs.readFileSync('./thumbnail/image.jpg') : Buffer.alloc(0);
const docu = fs.existsSync('./thumbnail/document.jpg') ? fs.readFileSync('./thumbnail/document.jpg') : Buffer.alloc(0);

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
            if (!fs.existsSync(this.pluginsDir)) {
                fs.mkdirSync(this.pluginsDir, { recursive: true });
                return;
            }
            const pluginFiles = fs.readdirSync(this.pluginsDir).filter(file => 
                file.endsWith('.js') && !file.startsWith('_')
            );
            this.plugins.clear();
            this.categories.clear();
            Object.keys(this.defaultCategories).forEach(cat => {
                this.categories.set(cat, []);
            });

            for (const file of pluginFiles) {
                try {
                    const pluginPath = path.join(this.pluginsDir, file);
                    const plugin = require(pluginPath);
                    if (plugin.command && typeof plugin.execute === 'function') {
                        if (!plugin.category) plugin.category = 'general';
                        if (!this.categories.has(plugin.category)) this.categories.set(plugin.category, []);
                        this.plugins.set(plugin.command, plugin);
                        this.categories.get(plugin.category).push(plugin.command);
                    }
                } catch (error) {
                    console.log(chalk.red(`❌ Plugin Error ${file}:`, error.message));
                }
            }
        } catch (error) {
            console.log(chalk.red('❌ Error loading plugins:', error.message));
        }
    }

    async executePlugin(command, sock, m, args, text, q, quoted, mime, qmsg, isMedia, groupMetadata, groupName, participants, groupOwner, groupAdmins, isBotAdmins, isAdmins, isGroupOwner, isCreator, prefix, reply, sender) {
        const plugin = this.plugins.get(command);
        if (!plugin) return false;
        try {
            if (plugin.owner && !isCreator) return true;
            if (plugin.group && !m.isGroup) return true;
            if (plugin.admin && m.isGroup && !isAdmins && !isCreator) return true;
            await plugin.execute(sock, m, { args, text, q, quoted, mime, qmsg, isMedia, groupMetadata, groupName, participants, groupOwner, groupAdmins, isBotAdmins, isAdmins, isGroupOwner, isCreator, prefix, reply, config, sender });
            return true;
        } catch (error) {
            return true;
        }
    }

    getMenuSections() {
        const sections = [];
        const sortedCategories = Array.from(this.categories.entries())
            .filter(([category, commands]) => commands.length > 0 && this.defaultCategories[category]);
        
        for (const [category, commands] of sortedCategories) {
            const categoryName = this.defaultCategories[category];
            const commandList = commands.sort().map(cmd => `│ ☢️ ${cmd}`).join('\n');
            sections.push(`╭───┈⊷ *${categoryName}*\n${commandList}\n╰──────────────┈⊷`);
        }
        return sections.join('\n\n');
    }

    reloadPlugins() {
        this.loadPlugins();
    }
}

const pluginLoader = new PluginLoader();

module.exports = async (sock, m, chatUpdate, store) => {
    try {
        if (!jidNormalizedUser || !getContentType || !isPnUser) await loadBaileysUtils();

        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : 
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId : ""
        ) || "";
        
        const sender = m.key.fromMe ? sock.user.id.split(":")[0] + "@s.whatsapp.net" : m.key.participant || m.key.remoteJid;
        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤Ω Φ_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = q = args.join(" ");
        const isCreator = config.owner.includes(m.sender.split('@')[0]) || m.key.fromMe;

        // Group Intelligence
        const groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat) : {};
        const groupName = m.isGroup ? groupMetadata.subject : '';
        const participants = m.isGroup ? groupMetadata.participants : [];
        const groupAdmins = m.isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : [];
        const isBotAdmins = m.isGroup ? groupAdmins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net') : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

        async function reply(text) {
            sock.sendMessage(m.chat, {
                text: text,
                contextInfo: {
                    externalAdReply: {
                        title: "ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ sʏsᴛᴇᴍ v1",
                        body: "ᴜsᴇʀ_sᴛᴀᴛᴜs: ᴀᴜᴛʜᴏʀɪᴢᴇᴅ",
                        thumbnailUrl: config.thumbUrl,
                        renderLargerThumbnail: true,
                        mediaType: 1
                    }
                }
            }, { quoted: m });
        }

        const pluginExecuted = await pluginLoader.executePlugin(command, sock, m, args, text, q, m.quoted || m, '', '', false, groupMetadata, groupName, participants, '', groupAdmins, isBotAdmins, isAdmins, false, isCreator, prefix, reply, sender);
        if (pluginExecuted) return;

        switch (command) {
            case 'menu': {
                // 1. Audio Protocol
                const audioPath = './media/audio_menu.mp3';
                if (fs.existsSync(audioPath)) {
                    await sock.sendMessage(m.chat, { 
                        audio: fs.readFileSync(audioPath), 
                        mimetype: 'audio/mpeg', 
                        ptt: true 
                    }, { quoted: m });
                }

                // 2. System Diagnostics
                const uptimeSec = process.uptime();
                const hours = Math.floor(uptimeSec / 3600);
                const minutes = Math.floor((uptimeSec % 3600) / 60);
                const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

                let menuText = `
╭───┈⊷ *ᴅᴀʀᴋx ᴄʏʙᴇʀ ᴄᴏʀᴇ*
│ 👤 *ᴜsᴇʀ:* ${m.pushName || 'ᴜɴᴋɴᴏᴡɴ'}
│ ⏳ *ᴜᴘᴛɪᴍᴇ:* ${hours}ʜ ${minutes}ᴍ
│ 🛰️ *ʟᴀᴛᴇɴᴄʏ:* ${new Date() - m.messageTimestamp * 1000}ᴍs
│ 📅 *ᴅᴀᴛᴇ:* ${date}
╰──────────────┈⊷

${pluginLoader.getMenuSections()}

*☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ : ᴛʜᴇ ᴇɴᴅ ᴏғ ᴛʜᴇ ʟɪɴᴇ*
`;
                // 3. UI/UX Broadcast
                await sock.sendMessage(m.chat, {
                    image: image,
                    caption: menuText,
                    contextInfo: {
                        externalAdReply: {
                            title: "ʀᴏᴏᴛ@ᴅᴀʀᴋx_ᴠɪ:~ sʏsᴛᴇᴍ ᴏɴʟɪɴᴇ",
                            body: "ᴅᴀʀᴋ ᴡᴇʙ ɪɴᴛᴇɢʀᴀᴛɪᴏɴ ᴀᴄᴛɪᴠᴇ",
                            mediaType: 1,
                            thumbnailUrl: config.thumbUrl,
                            renderLargerThumbnail: true,
                            sourceUrl: "https://github.com/athmanmussah-sketch"
                        }
                    }
                }, { quoted: m });
                break;
            }

            case 'reload': {
                if (!isCreator) return reply("⚠️ [ACCESS DENIED] - ROOT ONLY");
                pluginLoader.reloadPlugins();
                reply("♻️ *sʏsᴛᴇᴍ ʀᴇʙᴏᴏᴛ:* Modules re-encrypted and re-injected.");
                break;
            }

            default:
                if (isCmd && command) {
                    // Hidden logging can go here
                }
        }
    } catch (err) {
        console.log(chalk.red('Error in message.js:'), err);
    }
};
