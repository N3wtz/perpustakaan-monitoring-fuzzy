export const KONFIG_APP = {
  namaAplikasi: "Perpustakaan Udayana",
  namaAdmin: "Admin",

  gunakanDataDummy: false,

  dummyRealtimeFirebaseAktif: true,
  dummyLatestIntervalMs: 5000,
  dummyHistoryIntervalMs: 5000,

  esp32OfflineTimeoutMs: 15000,

  // QoS hanya dihitung dari sensor ESP32 asli, bukan dummy.
  qosHanyaSensorAsli: true,

  refreshJamMs: 1000,
};

export const LANTAI_YANG_DITAMPILKAN = 2;

export const DAFTAR_BAGIAN_ESP32_ASLI = [
  "bagian_l2_2",
  "bagian_l2_4",
  "bagian_l2_5",
  "bagian_l2_7",
];

export const DAFTAR_BAGIAN_DUMMY_REALTIME = [
  "bagian_l2_1",
  "bagian_l2_3",
  "bagian_l2_6",
  "bagian_l2_8",
];

export const TATA_LETAK_BAGIAN = [
  {
    id: "bagian_l2_1",
    label: "Bagian 1",
    labelLengkap: "Lantai 1 - Bagian 1",
    labelPendek: "B1",
    lantai: 2,
    nomor: 1,
    sumber: "dummy",
  },
  {
    id: "bagian_l2_2",
    label: "Bagian 2",
    labelLengkap: "Lantai 1 - Bagian 2",
    labelPendek: "B2",
    lantai: 2,
    nomor: 2,
    sumber: "esp32",
  },
  {
    id: "bagian_l2_3",
    label: "Bagian 3",
    labelLengkap: "Lantai 1 - Bagian 3",
    labelPendek: "B3",
    lantai: 2,
    nomor: 3,
    sumber: "dummy",
  },
  {
    id: "bagian_l2_4",
    label: "Bagian 4",
    labelLengkap: "Lantai 1 - Bagian 4",
    labelPendek: "B4",
    lantai: 2,
    nomor: 4,
    sumber: "esp32",
  },
  {
    id: "bagian_l2_5",
    label: "Bagian 5",
    labelLengkap: "Lantai 1 - Bagian 5",
    labelPendek: "B5",
    lantai: 2,
    nomor: 5,
    sumber: "esp32",
  },
  {
    id: "bagian_l2_6",
    label: "Bagian 6",
    labelLengkap: "Lantai 1 - Bagian 6",
    labelPendek: "B6",
    lantai: 2,
    nomor: 6,
    sumber: "dummy",
  },
  {
    id: "bagian_l2_7",
    label: "Bagian 7",
    labelLengkap: "Lantai 1 - Bagian 7",
    labelPendek: "B7",
    lantai: 2,
    nomor: 7,
    sumber: "esp32",
  },
  {
    id: "bagian_l2_8",
    label: "Bagian 8",
    labelLengkap: "Lantai 1 - Bagian 8",
    labelPendek: "B8",
    lantai: 2,
    nomor: 8,
    sumber: "dummy",
  },
];

export const TATA_LETAK_RUANG = TATA_LETAK_BAGIAN;

export const OPSI_PERIODE = [
  { value: "hari", label: "Hari" },
  { value: "bulan", label: "Bulan" },
  { value: "kustom", label: "Kustom" },
];

export const META_PARAMETER = {
  suhu: {
    key: "suhu",
    label: "Suhu",
    unit: "°C",
  },
  kelembapan: {
    key: "kelembapan",
    label: "Kelembapan",
    unit: "%",
  },
  kebisingan: {
    key: "suara_db",
    label: "Kebisingan",
    unit: "dB",
  },
};

// ======================================================
// FUNGSI KEANGGOTAAN INPUT
// ======================================================
export const ATURAN_MAMDANI = {
  suhu: {
    dingin: {
      type: "trap",
      points: [0, 0, 22.1, 22.5],
      label: "Dingin",
    },
    sejuk: {
      type: "tri",
      points: [22.1, 22.7, 23.5],
      label: "Sejuk",
    },
    nyaman: {
      type: "trap",
      points: [22.5, 23.5, 25.6, 26],
      label: "Nyaman",
    },
    hangat: {
      type: "tri",
      points: [25.6, 26.3, 27.1],
      label: "Hangat",
    },
    panas: {
      type: "trap",
      points: [26.9, 27.3, 40, 40],
      label: "Panas",
    },
  },

  kelembapan: {
    kering: {
      type: "trap",
      points: [0, 0, 55, 56],
      label: "Kering",
    },
    nyaman: {
      type: "trap",
      points: [44, 50, 70, 88],
      label: "Nyaman",
    },
    lembab: {
      type: "trap",
      points: [57, 75, 100, 100],
      label: "Lembab",
    },
  },

  kebisingan: {
    nyaman: {
      type: "trap",
      points: [0, 0, 40, 50],
      label: "Nyaman",
    },
    kebisinganRendah: {
      type: "tri",
      points: [39, 47, 54],
      label: "Kebisingan Rendah",
    },
    kebisinganTinggi: {
      type: "trap",
      points: [52, 55, 120, 120],
      label: "Kebisingan Tinggi",
    },
  },
};

// ======================================================
// OUTPUT FUZZY
// ======================================================
export const OUTPUT_KENYAMANAN = {
  tidakNyaman: {
    type: "trap",
    points: [0, 0, 25, 45],
    label: "Tidak Nyaman",
  },
  kurangNyaman: {
    type: "tri",
    points: [35, 55, 75],
    label: "Kurang Nyaman",
  },
  nyaman: {
    type: "trap",
    points: [65, 80, 100, 100],
    label: "Nyaman",
  },
};

// ======================================================
// RULE MAMDANI PARAMETER
// ======================================================
export const RULE_PARAMETER = {
  suhu: {
    dingin: "kurangNyaman",
    sejuk: "nyaman",
    nyaman: "nyaman",
    hangat: "kurangNyaman",
    panas: "tidakNyaman",
  },
  kelembapan: {
    kering: "kurangNyaman",
    nyaman: "nyaman",
    lembab: "kurangNyaman",
  },
  kebisingan: {
    nyaman: "nyaman",
    kebisinganRendah: "kurangNyaman",
    kebisinganTinggi: "tidakNyaman",
  },
};

// ======================================================
// RULE MAMDANI KESELURUHAN
// ======================================================
export const RULE_KESELURUHAN = [
  {
    suhu: "dingin",
    kelembapan: "kering",
    kebisingan: "nyaman",
    output: "kurangNyaman",
  },
  {
    suhu: "dingin",
    kelembapan: "nyaman",
    kebisingan: "kebisinganTinggi",
    output: "tidakNyaman",
  },
  {
    suhu: "dingin",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    output: "kurangNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "lembab",
    kebisingan: "kebisinganRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "lembab",
    kebisingan: "kebisinganTinggi",
    output: "tidakNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "lembab",
    kebisingan: "nyaman",
    output: "nyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "kebisinganTinggi",
    output: "tidakNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    output: "kurangNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "kebisinganTinggi",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    output: "nyaman",
  },
  {
    suhu: "panas",
    kelembapan: "lembab",
    kebisingan: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "panas",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    output: "tidakNyaman",
  },
  {
    suhu: "panas",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "lembab",
    kebisingan: "nyaman",
    output: "nyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    output: "nyaman",
  },
];
