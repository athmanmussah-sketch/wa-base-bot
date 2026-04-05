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

const image = fs.readFileSync('./thumbnail/image.jpg');
const docu = fs.readFileSync('./thumbnail/document.jpg');

let jidNormalizedUser, getContentType, isPnUser;

const loadBaileysUtils = async () => {
    const baileys = await import('@whiskeysockets/baileys');
    jidNormalizedUser = baileys.jidNormalizedUser;
    getContentType = baileys.getContentType;
    isPnUser = baileys.isPnUser;
};

// Plugin Loader System with Menu Categorization
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
            'other': '📦 EXTRA DATA',
            'tools': '🛠️ UTILITIES',
            'video': '🎬 VISUAL STREAM'
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

    getPluginCount() {
        return this.plugins.size;
    }

    getMenuSections() {
        const sections = [];
        const sortedCategories = Array.from(this.categories.entries())
            .filter(([category, commands]) => commands.length > 0 && this.defaultCategories[category]);
        
        for (const [category, commands] of sortedCategories) {
            const categoryName = this.defaultCategories[category];
            const commandList = commands.sort().map(cmd => `  │ ☢️ ${cmd}`).join('\n');
            sections.push(`┌──『 *${categoryName}* 』\n${commandList}\n└──────────────┈⊷`);
        }
        return sections.join('\n\n');
    }

    reloadPlugins() {
        this.loadPlugins();
    }
}

const pluginLoader = new PluginLoader();

module.exports = sock = async (sock, m, chatUpdate, store) => {
    try {
        if (!jidNormalizedUser || !getContentType || !isPnUser) await loadBaileysUtils();

        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : ""
        );
        
        const sender = m.key.fromMe ? sock.user.id.split(":")[0] + "@s.whatsapp.net" : m.key.participant || m.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤Ω Φ_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = q = args.join(" ");
        const isCreator = jidNormalizedUser(m.sender) === jidNormalizedUser(sock.user.id);

        async function reply(text) {
            sock.sendMessage(m.chat, {
                text: text,
                contextInfo: {
                    externalAdReply: {
                        title: "DARKX OFFICIAL BOT v1",
                        body: "Access Denied - System Encrypted",
                        thumbnailUrl: config.thumbUrl,
                        renderLargerThumbnail: false,
                    }
                }
            }, { quoted: m });
        }

        const pluginExecuted = await pluginLoader.executePlugin(command, sock, m, args, text, q, m.quoted || m, '', '', false, {}, '', [], '', [], false, false, false, isCreator, prefix, reply, sender);
        if (pluginExecuted) return;

        switch (command) {
            case 'menu': {
                const uptimeSec = process.uptime();
                const uptime = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m`;
                const ping = Date.now() - m.messageTimestamp * 1000;
                
                const DarkXHeader = `
☠️ *DARKX OFFICIAL BOT* ☠️
『 *SYSTEM INFORMATION* 』
👤 *Owner:* DarkX
🛰️ *Status:* Connected
🛠️ *Mode:* ${sock.public ? 'Public' : 'Self'}
⏱️ *Uptime:* ${uptime}
📡 *Latency:* ${ping}ms
🧠 *Total Commands:* ${pluginLoader.getPluginCount()}

${pluginLoader.getMenuSections()}

📌 _Note: Use commands wisely. System monitored._
`;

                await sock.sendMessage(m.chat, {
                    image: image,
                    caption: DarkXHeader,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: "ROOT@DARKX_OFFICIAL:~$",
                            body: "Hacking in progress...",
                            mediaType: 1,
                            thumbnailUrl: config.thumbUrl,
                            sourceUrl: "https://whatsapp.com/channel/darkx",
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
                break;
            }
            
            case 'reload': {
                if (!isCreator) return;
                pluginLoader.reloadPlugins();
                await reply(`[!] SYSTEM REBOOT: Plugins re-injected successfully.`);
                break;
            }
        }
    } catch (err) {
        console.log(err);
    }
};
