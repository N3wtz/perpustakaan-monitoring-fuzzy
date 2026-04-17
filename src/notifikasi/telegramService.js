import { KONFIG_NOTIFIKASI } from "./konfigNotifikasi";

export function formatPesanTelegram(alert) {
  return [
    "⚠️ PERINGATAN PERPUSTAKAAN",
    "",
    `Ruangan : ${alert.area}`,
    `Parameter : ${alert.parameter}`,
    `Nilai : ${alert.nilai}`,
    `Status : ${alert.status}`,
    `Waktu : ${alert.waktu}`,
  ].join("\n");
}

export async function kirimPesanTelegram(alert) {
  const { telegramBotToken, telegramChatId } = KONFIG_NOTIFIKASI;

  if (!telegramBotToken || telegramBotToken === "GANTI_DENGAN_BOT_TOKEN") {
    return { ok: false, error: "Bot token belum diisi." };
  }

  if (!telegramChatId || telegramChatId === "GANTI_DENGAN_CHAT_ID") {
    return { ok: false, error: "Chat ID belum diisi." };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: formatPesanTelegram(alert),
        }),
      },
    );

    const result = await response.json();
    console.log("HASIL TELEGRAM:", result);

    if (!response.ok || !result.ok) {
      return {
        ok: false,
        error: result?.description || "Gagal kirim Telegram",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("ERROR TELEGRAM:", error);
    return {
      ok: false,
      error: error?.message || "Terjadi kesalahan saat kirim Telegram",
    };
  }
}
