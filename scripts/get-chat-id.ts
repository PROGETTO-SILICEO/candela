
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function getChatId() {
    if (!TOKEN) {
        console.error('❌ Token not found in .env.local');
        return;
    }

    try {
        console.log('🔍 Checking for messages on bot:', TOKEN.split(':')[0] + '...');
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
        const data = await response.json();

        if (!data.ok) {
            console.error('❌ API Error:', data.description);
            return;
        }

        if (data.result.length === 0) {
            console.log('⚠️ No messages found. Please send "Hello" to your bot on Telegram!');
            return;
        }

        // Get the last message
        const lastUpdate = data.result[data.result.length - 1];
        const chatId = lastUpdate.message?.chat?.id || lastUpdate.my_chat_member?.chat?.id;
        const user = lastUpdate.message?.from?.username || lastUpdate.my_chat_member?.from?.username || 'Unknown';

        console.log(`✅ FOUND CHAT ID: ${chatId}`);
        console.log(`👤 User: @${user}`);
        console.log(`📝 Message: ${lastUpdate.message?.text || '(System update)'}`);

    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

getChatId();
