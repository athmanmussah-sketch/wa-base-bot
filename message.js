/* * ☠️ DARKX OFFICIAL BOT - CYBER CORE v1 ☠️
 * CORE MESSAGE HANDLER [STABILITY PATCH]
 */

const config = require('./settings/config'); // FIXED: No more ()
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
            'ai': '🤖 ᴄʏʙᴇʀ ᴀɪ', 'downloader': '📥 ᴅᴀᴛᴀ ᴇxᴘʟᴏɪᴛ', 'fun': '🎮 sʏsᴛᴇᴍ ɢᴀᴍᴇ', 'general': '⚡ ᴄᴏʀᴇ ᴀᴄᴄᴇss', 'group': '👥 ɴᴇᴛᴡᴏʀᴋ ʜᴜʙ', 'owner': '👑 ʀᴏᴏᴛ ᴀᴅᴍɪɴ', 'logo': '🎨 ɢʀᴀᴘʜɪᴄ ᴄᴏʀᴇ', 'search': '🔍 ᴅᴀᴛᴀʙᴀsᴇ sᴇᴀʀᴄʜ', 'tools': '🛠️ ᴜᴛɪʟɪᴛɪᴇs'
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
        if (plugin.owner && !pluginArgs.isCreator) return true;
        try {
            await plugin.execute(sock, m, pluginArgs);
            return true;
        } catch (e) { return true; }
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

module.exports = async (sock, m, chatUpdate) => {
    try {
        if (!m) return;
        const body = m.body || '';
        const prefix = config.prefix || '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const isCreator = config.owner.includes(m.sender.split('@')[0]) || m.key.fromMe;

        const reply = async (text) => {
            await sock.sendMessage(m.chat, { text }, { quoted: m });
        };

        const pluginArgs = { args, text, isCreator, reply, prefix, config };
        const executed = await loader.executePlugin(command, sock, m, pluginArgs);
        if (executed) return;

        switch (command) {
            case 'menu':
                let menuText = `╭───┈⊷ *ᴅᴀʀᴋx ᴄʏʙᴇʀ ᴄᴏʀᴇ*\n│ 👤 *ᴜsᴇʀ:* ${m.pushName || 'Guest'}\n╰──────────────┈⊷\n\n${loader.getMenuSections()}*☠️ ᴅᴀʀᴋx ᴏғғɪᴄɪᴀʟ*`;
                await sock.sendMessage(m.chat, { image: image, caption: menuText }, { quoted: m });
                break;
        }
    } catch (e) { console.log(e); }
};
