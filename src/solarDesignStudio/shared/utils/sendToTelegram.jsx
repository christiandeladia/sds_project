// utils/sendToTelegram.js
export const sendToTelegram = async (payload) => {
    // wrap whatever payload you pass in a code-block
    const text = JSON.stringify(payload, null, 2);

  
    try {
      const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const chatId   = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return true;
    } catch (err) {
      console.error("Telegram error:", err);
      return false;
    }
  };
  