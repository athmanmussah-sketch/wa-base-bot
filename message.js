/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * CORE MESSAGE HANDLER [FINAL STABILITY FIX]
 */

const config = require('./settings/config')(); // Added () if config is a function
const fs = require('fs');
const path = require("path");
const chalk = require("chalk");

// Assets
const image = fs.existsSync('./thumbnail/image.jpg') ? fs.readFileSync('./thumbnail/image.jpg') : Buffer.alloc(0);

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
            if (!fs.existsSync(this.pluginsDir)) fs.mkdirSync(this.pluginsDir);
            const pluginFiles = fs.readdirSync(this.pluginsDir).filter(file => file.endsWith('.js'));
            this.plugins.clear();
            this.categories.clear();
            Object.keys(this.defaultCategories).forEach(cat => this.categories.set(cat, []));

            for (const file of pluginFiles) {
                const pluginPath = path.join(this.pluginsDir, file);
                delete require.cache[require.resolve(pluginPath)];
                const plugin = require(pluginPath);
                if (plugin.command) {
                    this.plugins.set(plugin.command, plugin);
                    const cat = plugin.category || 'general';
                    if (!this.categories.has(cat)) this.categories.set(cat, []);
                    this.categories.get(cat).push(plugin.command);
                }
            }
            console.log(chalk.green(`Successfully loaded ${this.plugins.size} plugins.`));
        } catch (e) { console.log(chalk.red("Plugin Load Error:"), e); }
    }

    async executePlugin(command, sock, m, pluginArgs) {
        const plugin = this.plugins.get(command);
        if (!plugin) return false;
        
        if (plugin.owner && !pluginArgs.isCreator) return true;
        if (plugin.group && !m.isGroup) return true;
        if (plugin.admin && m.isGroup && !pluginArgs.isAdmins && !pluginArgs.isCreator) return true;
        
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
        const sortedCats = Object.keys(this.defaultCategories);
        for (const category of sortedCats) {
            const commands = this.categories.get(category);
            if (commands && commands.length > 0) {
                sections += `╭───┈⊷ *${this.defaultCategories[category]}*\n${commands.sort().map(cmd => `│ ☢️ ${cmd}`).join('\n')}\n╰──────────────┈⊷\n\n`;
            }
        }
        return sections;
    }
}

const loader = new PluginLoader();

module.exports = async (sock, m, chatUpdate) => {
    try {
        if (!m) return;

        // 1. IMPROVED BODY DETECTION (SMSG Compatible)
        const body = m.body || (m.mtype === 'conversation' ? m.message.conversation : m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : m.mtype === 'imageMessage' ? m.message.imageMessage.caption : m.mtype === 'videoMessage' ? m.message.videoMessage.caption : '') || '';
        
        // 2. PREFIX & COMMAND LOGIC
        const prefix = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤Ω Φ_&><`™©®Δ^βα~¦|/\\©^]/.test(body) ? body.match(/^[°zZ#$@*+,.?=''():√%!¢£¥€π¤Ω Φ_&><`™©®Δ^βα~¦|/\\©^]/)[0] : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const isCreator = config.owner.includes(m.sender.split('@')[0]) || m.key.fromMe;

        if (isCmd) console.log(chalk.yellow(`[COMMAND] Executing: ${command} from ${m.pushName || 'User'}`));

        // 3. GROUP INTELLIGENCE
        const groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat).catch(e => ({})) : {};
        const participants = m.isGroup ? (groupMetadata.participants || []) : [];
        const groupAdmins = m.isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : [];
        const isBotAdmins = m.isGroup ? groupAdmins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net') : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

        const reply = async (text) => {
            await sock.sendMessage(m.chat, { text, contextInfo: { externalAdReply: { title: "ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ", body: "sʏsᴛᴇᴍ ᴀᴄᴛɪᴠᴇ", thumbnailUrl: config.thumbUrl, mediaType: 1, renderLargerThumbnail: true }}}, { quoted: m });
        };

        const pluginArgs = { args, text, isCreator, isAdmins, isBotAdmins, participants, groupMetadata, reply, prefix, config };
        
        // 4. EXECUTE PLUGINS
        const executed = await loader.executePlugin(command, sock, m, pluginArgs);
        if (executed) return;

        // 5. INTERNAL COMMANDS
        switch (command) {
            case 'menu':
            case 'help':
                const audioPath = './media/audio_menu.mp3';
                if (fs.existsSync(audioPath)) {
                    await sock.sendMessage(m.chat, { audio: fs.readFileSync(audioPath), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
                }
                
                let menuText = `╭───┈⊷ *ᴅᴀʀᴋx ᴄʏʙᴇʀ ᴄᴏʀᴇ*\n│ 👤 *ᴜsᴇʀ:* ${m.pushName || 'Guest'}\n│ 🛰️ *ʟᴀᴛᴇɴᴄʏ:* ${Math.abs(Date.now() - (m.messageTimestamp * 1000))}ms\n╰──────────────┈⊷\n\n${loader.getMenuSections()}*☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ*`;
                
                await sock.sendMessage(m.chat, { 
                    image: image, 
                    caption: menuText, 
                    contextInfo: { 
                        externalAdReply: { 
                            title: "ʀᴏᴏᴛ@ᴅᴀʀᴋx_ᴠɪ:~", 
                            body: "ᴅᴀʀᴋ ᴡᴇʙ ɪɴᴛᴇɢʀᴀᴛɪᴏɴ", 
                            mediaType: 1, 
                            thumbnailUrl: config.thumbUrl, 
                            renderLargerThumbnail: true, 
                            sourceUrl: "https://github.com/athmanmussah-sketch" 
                        }
                    }
                }, { quoted: m });
                break;

            case 'reload':
                if (!isCreator) return reply("⚠️ [ACCESS DENIED]");
                loader.loadPlugins();
                reply("♻️ *sʏsᴛᴇᴍ ʀᴇʙᴏᴏᴛᴇᴅ*");
                break;
        }
    } catch (e) { 
        console.log(chalk.red("Critical Error in message.js:"), e); 
    }
};
