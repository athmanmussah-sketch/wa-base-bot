const axios = require('axios');
module.exports = {
    command: 'define',
    category: 'search',
    description: 'Search for word definitions',
    execute: async (sock, m, { text, reply }) => {
        if (!text) return reply("Ingiza neno! Mfano: .define encryption");
        try {
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
            let data = res.data[0];
            let definition = data.meanings[0].definitions[0].definition;
            
            let resultText = `📖 *DARKX DATA CENTER*\n\n` +
                             `> 🔤 *Word:* ${data.word}\n` +
                             `> 🧠 *Meaning:* ${definition}`;
            
            reply(resultText);
        } catch (e) {
            reply("❌ _Data not found in the global database._");
        }
    }
};
