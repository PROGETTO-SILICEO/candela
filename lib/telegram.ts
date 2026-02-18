
import * as dotenv from 'dotenv';
dotenv.config();

export async function sendTelegramAlert(message: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('[TELEGRAM] Bot Token or Chat ID missing. Alert suppressed.');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            console.error('[TELEGRAM] Error sending message:', await response.text());
            return false;
        }

        console.log('[TELEGRAM] Alert sent successfully.');
        return true;
    } catch (error) {
        console.error('[TELEGRAM] Network error:', error);
        return false;
    }
}
