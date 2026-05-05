// ======================================================
// KONFIGURASI APLIKASI
// ======================================================
export const KONFIG_APP = {
  namaAplikasi: "Perpustakaan Udayana",
  namaAdmin: "Admin",

  // false = baca Firebase asli.
  // true = pakai DATA_DUMMY lokal dari src/utils/dataDummy.js.
  gunakanDataDummy: false,

  // Dummy realtime Firebase hanya menulis bagian dummy lantai 2.
  // Bagian ESP32 asli tidak akan pernah ditimpa dummy.
  dummyRealtimeFirebaseAktif: true,
  dummyLatestIntervalMs: 5000,
  dummyHistoryIntervalMs: 60000,

  // Jika ESP32 tidak mengirim latest lebih dari nilai ini, UI menampilkan Offline.
  esp32OfflineTimeoutMs: 15000,

  // QoS hanya dihitung dari sensor ESP32 asli, bukan dummy.
  qosHanyaSensorAsli: true,
  refreshJamMs: 1000,
};

// ======================================================
// KONFIGURASI AREA YANG DITAMPILKAN
// ======================================================
// Struktur Firebase tidak diubah. Path lama /perpustakaan/bagian_l1_x
// tetap boleh ada, tetapi website hanya membaca dan menampilkan lantai 2.
export const LANTAI_YANG_DITAMPILKAN = 2;

// ESP32 asli berada di lantai 2 bagian 1, 3, 6, dan 8.
export const DAFTAR_BAGIAN_ESP32_ASLI = [
  "bagian_l2_1",
  "bagian_l2_3",
  "bagian_l2_6",
  "bagian_l2_8",
];

// Bagian dummy realtime berada di lantai 2 bagian 2, 4, 5, dan 7.
export const DAFTAR_BAGIAN_DUMMY_REALTIME = [
  "bagian_l2_2",
  "bagian_l2_4",
  "bagian_l2_5",
  "bagian_l2_7",
];

export const TATA_LETAK_BAGIAN = [
  {
    id: "bagian_l2_1",
    label: "Bagian 1",
    labelLengkap: "Lantai 2 - Bagian 1",
    labelPendek: "B1",
    lantai: 2,
    nomor: 1,
    sumber: "esp32",
  },
  {
    id: "bagian_l2_2",
    label: "Bagian 2",
    labelLengkap: "Lantai 2 - Bagian 2",
    labelPendek: "B2",
    lantai: 2,
    nomor: 2,
    sumber: "dummy",
  },
  {
    id: "bagian_l2_3",
    label: "Bagian 3",
    labelLengkap: "Lantai 2 - Bagian 3",
    labelPendek: "B3",
    lantai: 2,
    nomor: 3,
    sumber: "esp32",
  },
  {
    id: "bagian_l2_4",
    label: "Bagian 4",
    labelLengkap: "Lantai 2 - Bagian 4",
    labelPendek: "B4",
    lantai: 2,
    nomor: 4,
    sumber: "dummy",
  },
  {
    id: "bagian_l2_5",
    label: "Bagian 5",
    labelLengkap: "Lantai 2 - Bagian 5",
    labelPendek: "B5",
    lantai: 2,
    nomor: 5,
    sumber: "dummy",
  },
  {
    id: "bagian_l2_6",
    label: "Bagian 6",
    labelLengkap: "Lantai 2 - Bagian 6",
    labelPendek: "B6",
    lantai: 2,
    nomor: 6,
    sumber: "esp32",
  },
  {
    id: "bagian_l2_7",
    label: "Bagian 7",
    labelLengkap: "Lantai 2 - Bagian 7",
    labelPendek: "B7",
    lantai: 2,
    nomor: 7,
    sumber: "dummy",
  },
  {
    id: "bagian_l2_8",
    label: "Bagian 8",
    labelLengkap: "Lantai 2 - Bagian 8",
    labelPendek: "B8",
    lantai: 2,
    nomor: 8,
    sumber: "esp32",
  },
];

// Alias agar file lama yang masih import TATA_LETAK_RUANG tetap aman.
export const TATA_LETAK_RUANG = TATA_LETAK_BAGIAN;

export const OPSI_PERIODE = [
  { value: "hari", label: "Hari" },
  { value: "bulan", label: "Bulan" },
  { value: "kustom", label: "Kustom" },
];

export const META_PARAMETER = {
  suhu: { key: "suhu", label: "Suhu", unit: "°C" },
  kelembapan: { key: "kelembapan", label: "Kelembapan", unit: "%" },
  kebisingan: { key: "suara_db", label: "Kebisingan", unit: "dB" },
  asap: { key: "asap_metric", label: "Indeks Asap", unit: "indeks" },
  kualitasUdara: { key: "ppm_co", label: "Kualitas Udara (CO)", unit: "ppm" },
};

// ======================================================
// FUNGSI KEANGGOTAAN INPUT
// ======================================================
export const ATURAN_MAMDANI = {
  suhu: {
    dingin: { type: "trap", points: [0, 0, 20.0, 20.5], label: "Dingin" },
    sejuk: { type: "tri", points: [20.5, 21.6, 22.7], label: "Sejuk" },
    nyaman: { type: "tri", points: [22.8, 24.3, 25.8], label: "Nyaman" },
    hangat: { type: "tri", points: [25.9, 26.55, 27.2], label: "Hangat" },
    panas: { type: "trap", points: [27.2, 27.7, 40, 40], label: "Panas" },
  },

  kelembapan: {
    terlaluKering: {
      type: "trap",
      points: [0, 0, 35, 40],
      label: "Terlalu Kering",
    },
    nyaman: { type: "tri", points: [40, 50, 60], label: "Nyaman" },
    terlaluLembab: {
      type: "trap",
      points: [60, 65, 100, 100],
      label: "Terlalu Lembab",
    },
  },

  kebisingan: {
    nyaman: { type: "trap", points: [0, 0, 40, 45], label: "Nyaman" },
    kebisinganRendah: {
      type: "tri",
      points: [45, 50, 55],
      label: "Kebisingan Rendah",
    },
    kebisinganTinggi: {
      type: "trap",
      points: [55, 60, 120, 120],
      label: "Kebisingan Tinggi",
    },
  },

  asap: {
    nyaman: { type: "trap", points: [0, 0, 8, 10], label: "Nyaman" },
    terdeteksiAsap: {
      type: "trap",
      points: [10, 12, 100, 100],
      label: "Terdeteksi Asap",
    },
  },

  co: {
    nyaman: { type: "trap", points: [0, 0, 5, 6], label: "Nyaman" },
    coRendah: { type: "tri", points: [6, 7.5, 9], label: "CO Rendah" },
    coTinggi: { type: "trap", points: [9, 10, 100, 100], label: "CO Tinggi" },
  },
};

// ======================================================
// OUTPUT FUZZY
// ======================================================
export const OUTPUT_KENYAMANAN = {
  tidakNyaman: { type: "trap", points: [0, 0, 25, 45], label: "Tidak Nyaman" },
  kurangNyaman: { type: "tri", points: [35, 55, 75], label: "Kurang Nyaman" },
  nyaman: { type: "trap", points: [65, 80, 100, 100], label: "Nyaman" },
};

// ======================================================
// RULE MAMDANI PARAMETER
// ======================================================
export const RULE_PARAMETER = {
  suhu: {
    dingin: "tidakNyaman",
    sejuk: "nyaman",
    nyaman: "nyaman",
    hangat: "kurangNyaman",
    panas: "tidakNyaman",
  },

  kelembapan: {
    terlaluKering: "kurangNyaman",
    nyaman: "nyaman",
    terlaluLembab: "kurangNyaman",
  },

  kebisingan: {
    nyaman: "nyaman",
    kebisinganRendah: "kurangNyaman",
    kebisinganTinggi: "tidakNyaman",
  },

  asap: {
    nyaman: "nyaman",
    terdeteksiAsap: "tidakNyaman",
  },

  co: {
    nyaman: "nyaman",
    coRendah: "kurangNyaman",
    coTinggi: "tidakNyaman",
  },
};

// ======================================================
// RULE MAMDANI KESELURUHAN
// ======================================================
export const RULE_KESELURUHAN = [
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "nyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "nyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "kurangNyaman",
  },
  {
    suhu: "dingin",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "panas",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "terlaluKering",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "terlaluLembab",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    asap: "nyaman",
    co: "nyaman",
    output: "kurangNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "kebisinganTinggi",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "terdeteksiAsap",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "coRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "coTinggi",
    output: "tidakNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "terlaluKering",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "terlaluLembab",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "terlaluKering",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "terlaluLembab",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    asap: "nyaman",
    co: "nyaman",
    output: "kurangNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    asap: "nyaman",
    co: "nyaman",
    output: "kurangNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "nyaman",
    kebisingan: "kebisinganTinggi",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "kebisinganTinggi",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "terlaluKering",
    kebisingan: "kebisinganRendah",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "terlaluLembab",
    kebisingan: "kebisinganRendah",
    asap: "nyaman",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    asap: "nyaman",
    co: "coRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    asap: "nyaman",
    co: "coTinggi",
    output: "tidakNyaman",
  },
  {
    suhu: "nyaman",
    kelembapan: "nyaman",
    kebisingan: "kebisinganRendah",
    asap: "terdeteksiAsap",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "coRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "nyaman",
    co: "coRendah",
    output: "kurangNyaman",
  },
  {
    suhu: "sejuk",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "terdeteksiAsap",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "hangat",
    kelembapan: "nyaman",
    kebisingan: "nyaman",
    asap: "terdeteksiAsap",
    co: "nyaman",
    output: "tidakNyaman",
  },
  {
    suhu: "panas",
    kelembapan: "terlaluKering",
    kebisingan: "kebisinganTinggi",
    asap: "terdeteksiAsap",
    co: "coTinggi",
    output: "tidakNyaman",
  },
];
