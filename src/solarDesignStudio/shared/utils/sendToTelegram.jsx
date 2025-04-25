// utils/sendToTelegram.js
export const sendToTelegram = async (payload) => {
      // 1) pretty-print with 2-space indent
  const pretty = JSON.stringify(payload, null, 2);

  // 2) collapse any multi-line [...] into one line
  //    - match “[ ... ]” and replace internal newlines+spaces with single space
  const text = pretty.replace(
    /\[\s*([^\]]*?)\s*\]/gs,
    (_, inner) => `[${inner.replace(/\s*\n\s*/g, ' ')}]`
  );

  
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
  