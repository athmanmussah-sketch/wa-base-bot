const fs = require('fs');
const path = require('path');

module.exports = {
    command: 'autoreply',
    category: 'owner',
    description: 'Washa au Zima Auto Status Reply',
    owner: true, // Ni wewe tu (Mussah) unaweza kuitumia
    execute: async (sock, m, { args, reply }) => {
        // Tunatafuta njia ya kwenda kwenye config.js
        const configPath = path.join(__dirname, '../settings/config.js');
        
        if (!args[0]) return reply("⚠️ *DARKX SYSTEM:*\nTumia hivi:\n*.autoreply on* (Kuwasha)\n*.autoreply off* (Kuzima)");

        let status = args[0].toLowerCase();
        let configContent = fs.readFileSync(configPath, 'utf8');

        if (status === 'on') {
            // Kama ilikuwa false, tunaifanya iwe true
            if (configContent.includes('auto_reply_status: true')) return reply("✅ Mfumo tayari ulishawashwa!");
            
            configContent = configContent.replace('auto_reply_status: false', 'auto_reply_status: true');
            fs.writeFileSync(configPath, configContent);
            
            reply("🛡️ *SECURITY ALERT: ACTIVATED*\nAuto Status Reply imewashwa. Bot sasa itaanza kujibu status za watu. ☣️");
            
        } else if (status === 'off') {
            // Kama ilikuwa true, tunaifanya iwe false
            if (configContent.includes('auto_reply_status: false')) return reply("✅ Mfumo tayari ulishazimwa!");
            
            configContent = configContent.replace('auto_reply_status: true', 'auto_reply_status: false');
            fs.writeFileSync(configPath, configContent);
            
            reply("🛡️ *SECURITY ALERT: DEACTIVATED*\nAuto Status Reply imezimwa. Bot sasa iko kwenye 'Stealth Mode' (Ina-view tu bila kujibu). 🌑");
            
        } else {
            reply("❌ Amri haijulikani! Tumia *on* au *off*.");
        }
    }
};
