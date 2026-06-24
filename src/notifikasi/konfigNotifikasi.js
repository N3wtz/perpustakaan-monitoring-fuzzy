export const KONFIG_NOTIFIKASI = {
  // Saklar dari kode.
  // Jika false, Telegram tidak akan dikirim walaupun saklar website aktif.
  telegramAktifDariKode: true,

  // Kirim Telegram jika status Tidak Nyaman terjadi 3 kali beruntun.
  jumlahBurukBerturutTurut: 3,

  // Path Firebase
  pathAlerts: "alerts",
  pathMonitoringState: "monitoring_state",
  pathPengaturanTelegram: "pengaturan/telegramAktifWebsite",

  // Telegram
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  telegramChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID,
};

export const DAFTAR_PARAMETER_ALERT = [
  {
    key: "suhu",
    label: "Suhu",
    unit: "°C",
    ambilStatus: (fuzzy) => fuzzy?.suhu?.kenyamanan || "Nyaman",
    ambilDetail: (fuzzy) => fuzzy?.suhu?.label || "-",
    ambilNilai: (latest) => latest?.suhu || 0,
  },
  {
    key: "kelembapan",
    label: "Kelembapan",
    unit: "%",
    ambilStatus: (fuzzy) => fuzzy?.kelembapan?.kenyamanan || "Nyaman",
    ambilDetail: (fuzzy) => fuzzy?.kelembapan?.label || "-",
    ambilNilai: (latest) => latest?.kelembapan || 0,
  },
  {
    key: "kebisingan",
    label: "Kebisingan",
    unit: "dB",
    ambilStatus: (fuzzy) => fuzzy?.kebisingan?.kenyamanan || "Nyaman",
    ambilDetail: (fuzzy) => fuzzy?.kebisingan?.label || "-",
    ambilNilai: (latest) => latest?.suara_db || 0,
  },
];
