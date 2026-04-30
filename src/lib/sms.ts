/**
 * Free Alert Utility using Telegram or ntfy.sh
 * Replaces unreliable CallMeBot WhatsApp API
 */

export async function sendSMS(to: string, message: string) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const ntfyTopic = process.env.NTFY_TOPIC;
  const phoneNumber = process.env.ALERT_PHONE || to;

  console.log(`[ALERT INITIATED] Target: ${phoneNumber}`);

  let success = false;
  let errors: string[] = [];

  // 1. Try Telegram (Most Reliable Free Messenger)
  if (telegramToken && telegramChatId) {
    try {
      const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (response.ok) {
        console.log("✅ Telegram Alert sent successfully.");
        success = true;
      } else {
        const err = await response.text();
        console.error("❌ Telegram Error:", err);
        errors.push(`Telegram: ${err}`);
      }
    } catch (error: any) {
      console.error("❌ Telegram Request Failed:", error);
      errors.push(`Telegram Request: ${error.message}`);
    }
  }

  // 2. Try ntfy.sh (Backup / Secondary Push Notification)
  if (ntfyTopic) {
    try {
      const response = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: "POST",
        body: message,
        headers: {
          "Title": "Security Alert",
          "Priority": "high",
          "Tags": "rotating_light,warning",
        },
      });

      if (response.ok) {
        console.log("✅ ntfy.sh Alert sent successfully.");
        success = true;
      } else {
        errors.push(`ntfy.sh: ${response.statusText}`);
      }
    } catch (error: any) {
      errors.push(`ntfy.sh Request: ${error.message}`);
    }
  }

  // Fallback / Warning if nothing is configured
  if (!telegramToken && !ntfyTopic) {
    console.warn("⚠️ No Alert Provider Configured (Telegram or ntfy.sh missing)");
    console.log(`[MOCK ALERT]: ${message}`);
    return { success: false, error: "No API configured" };
  }

  return { 
    success, 
    error: success ? undefined : errors.join("; ") 
  };
}

