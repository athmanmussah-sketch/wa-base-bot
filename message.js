/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * CORE MESSAGE HANDLER... 
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

// Mafaili ya picha
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
            'ai': '🤖 CYBER AI',
            'downloader': '📥 DATA EXPLOIT',
            'fun': '🎮 SYSTEM GAME',
            'general': '⚡ CORE ACCESS',
            'group': '👥 NETWORK HUB',
            'owner': '👑 ROOT ADMIN',
            'logo': '🎨 GRAPHIC CORE',
            'search': '🔍 DATABASE SEARCH',
            'tools': '🛠️ UTILITIES'
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

        async function reply(text) {
            sock.sendMessage(m.chat, {
                text: text,
                contextInfo: {
                    externalAdReply: {
                        title: "DARKX OFFICIAL BOT v1",
                        body: "ROOT_ACCESS: GRANTED",
                        thumbnailUrl: config.thumbUrl,
                        renderLargerThumbnail: true,
                        mediaType: 1
                    }
                }
            }, { quoted: m });
        }

        const pluginExecuted = await pluginLoader.executePlugin(command, sock, m, args, text, q, m.quoted || m, '', '', false, {}, '', [], '', [], false, false, false, isCreator, prefix, reply, sender);
        if (pluginExecuted) return;

        switch (command) {
            case 'menu': {
                // 1. Play Audio Menu kwanza
                const audioPath = './media/audio_menu.mp3';
                if (fs.existsSync(audioPath)) {
                    await sock.sendMessage(m.chat, { 
                        audio: fs.readFileSync(audioPath), 
                        mimetype: 'audio/mpeg', 
                        ptt: true 
                    }, { quoted: m });
                }

                // 2. Maandalizi ya Menu Text
                const uptimeSec = process.uptime();
                const hours = Math.floor(uptimeSec / 3600);
                const minutes = Math.floor((uptimeSec % 3600) / 60);
                const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

                let menuText = `
╭───┈⊷ *DARKX SYSTEM* │ 👤 *User:* ${m.pushName || 'Guest'}
│ 🛠️ *Core:* Baileys-MD
│ ⏳ *Runtime:* ${hours}h ${minutes}m
│ 🛰️ *Status:* Online
│ 📅 *Date:* ${date}
╰──────────────┈⊷

${pluginLoader.getMenuSections()}

*☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ : ᴛʜᴇ ᴇɴᴅ ᴏғ ᴛʜᴇ ʟɪɴᴇ*
`;
                // 3. Tuma Menu yenye Picha
                await sock.sendMessage(m.chat, {
                    image: image,
                    caption: menuText,
                    contextInfo: {
                        externalAdReply: {
                            title: "ROOT@DARKX_SYSTEM:~$",
                            body: "Cyber Operations Active",
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
                if (!isCreator) return reply(config.message.owner);
                pluginLoader.reloadPlugins();
                reply("♻️ *SYSTEM RELOADED:* All modules re-injected successfully.");
                break;
            }

            default:
                if (isCmd && command) {
                    // console.log(chalk.yellow(`[UNKNOWN] Command: ${command}`));
                }
        }
    } catch (err) {
        console.log(chalk.red('Error in message.js:'), err);
    }
};
