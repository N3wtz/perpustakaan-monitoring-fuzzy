export const KONFIG_APP = {
  namaAplikasi: "Perpustakaan Udayana",
  namaAdmin: "Admin",
  gunakanDataDummy: true,
  refreshJamMs: 1000,
};

export const TATA_LETAK_RUANG = [
  { id: "ruang_1", label: "Area 1" },
  { id: "ruang_2", label: "Area 2" },
  { id: "ruang_3", label: "Area 3" },
  { id: "ruang_4", label: "Area 4" },
];

export const OPSI_PERIODE = [
  { value: "hari", label: "Hari" },
  { value: "minggu", label: "Minggu" },
  { value: "bulan", label: "Bulan" },
];

export const META_PARAMETER = {
  suhu: { key: "suhu", label: "Suhu", unit: "°C" },
  kelembapan: { key: "kelembapan", label: "Kelembapan", unit: "%" },
  kebisingan: { key: "suara_db", label: "Kebisingan", unit: "dB" },
  asap: { key: "asap_metric", label: "Asap", unit: "ppm" },
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
