export const KONFIG_NOTIFIKASI = {
  // saklar dari kode
  telegramAktifDariKode: true,

  // kirim tiap 5 kali tidak nyaman beruntun
  jumlahBurukBerturutTurut: 5,

  // path firebase
  pathAlerts: "alerts",
  pathMonitoringState: "monitoring_state",
  pathPengaturanTelegram: "pengaturan/telegramAktifWebsite",

  // telegram
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
  {
    key: "asap",
    label: "Asap",
    unit: "ppm",
    ambilStatus: (fuzzy) => fuzzy?.asap?.kenyamanan || "Nyaman",
    ambilDetail: (fuzzy) => fuzzy?.asap?.label || "-",
    ambilNilai: (latest) => latest?.asap_metric || 0,
  },
  {
    key: "co",
    label: "Kualitas Udara (CO)",
    unit: "ppm",
    ambilStatus: (fuzzy) => fuzzy?.co?.kenyamanan || "Nyaman",
    ambilDetail: (fuzzy) => fuzzy?.co?.label || "-",
    ambilNilai: (latest) => latest?.ppm_co || 0,
  },
];
