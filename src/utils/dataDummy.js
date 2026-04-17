function formatWaktuText(date) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  const detik = String(date.getSeconds()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari} ${jam}:${menit}:${detik}`;
}

function buatRiwayat(baseTime, dataArray) {
  return Object.fromEntries(
    dataArray.map((item, index) => {
      const date = new Date(baseTime);
      date.setMinutes(date.getMinutes() + index * 5);

      return [
        `id_${index + 1}`,
        {
          suhu: item.suhu,
          kelembapan: item.kelembapan,
          suara_db: item.suara_db,
          asap_metric: item.asap_metric,
          ppm_co: item.ppm_co,
          timestamp: Math.floor(date.getTime() / 1000),
          waktu_text: formatWaktuText(date),
        },
      ];
    }),
  );
}

const waktuAwal = new Date("2026-05-16T08:00:00");

// ======================================================
// AREA 1
// Fokus masalah: ASAP
// 3 data terakhir buruk -> harus bisa trigger alert/telegram
// ======================================================
const dataArea1 = [
  { suhu: 24.1, kelembapan: 45, suara_db: 40, asap_metric: 2, ppm_co: 4.0 },
  { suhu: 24.2, kelembapan: 46, suara_db: 41, asap_metric: 2, ppm_co: 4.1 },
  { suhu: 24.0, kelembapan: 45, suara_db: 40, asap_metric: 3, ppm_co: 4.0 },
  { suhu: 24.3, kelembapan: 46, suara_db: 41, asap_metric: 4, ppm_co: 4.1 },
  { suhu: 24.2, kelembapan: 45, suara_db: 40, asap_metric: 5, ppm_co: 4.0 },
  { suhu: 24.1, kelembapan: 45, suara_db: 40, asap_metric: 7, ppm_co: 4.1 },
  { suhu: 24.2, kelembapan: 46, suara_db: 41, asap_metric: 8, ppm_co: 4.2 },
  { suhu: 24.3, kelembapan: 46, suara_db: 40, asap_metric: 9, ppm_co: 4.2 },
  { suhu: 24.1, kelembapan: 45, suara_db: 41, asap_metric: 11.5, ppm_co: 4.3 },
  { suhu: 24.0, kelembapan: 45, suara_db: 40, asap_metric: 12.2, ppm_co: 4.2 },
  { suhu: 24.2, kelembapan: 46, suara_db: 41, asap_metric: 13.0, ppm_co: 4.1 },
  { suhu: 24.1, kelembapan: 45, suara_db: 40, asap_metric: 14.0, ppm_co: 4.1 },
];

// ======================================================
// AREA 2
// Fokus masalah: KEBISINGAN
// 3 data terakhir buruk -> harus bisa trigger alert/telegram
// ======================================================
const dataArea2 = [
  { suhu: 24.8, kelembapan: 50, suara_db: 42, asap_metric: 2, ppm_co: 4.5 },
  { suhu: 24.9, kelembapan: 50, suara_db: 43, asap_metric: 2, ppm_co: 4.5 },
  { suhu: 25.0, kelembapan: 51, suara_db: 44, asap_metric: 2, ppm_co: 4.6 },
  { suhu: 25.1, kelembapan: 51, suara_db: 46, asap_metric: 2, ppm_co: 4.6 },
  { suhu: 25.0, kelembapan: 50, suara_db: 48, asap_metric: 2, ppm_co: 4.7 },
  { suhu: 24.9, kelembapan: 50, suara_db: 49, asap_metric: 2, ppm_co: 4.6 },
  { suhu: 25.0, kelembapan: 51, suara_db: 50, asap_metric: 2, ppm_co: 4.7 },
  { suhu: 25.1, kelembapan: 51, suara_db: 53, asap_metric: 2, ppm_co: 4.8 },
  { suhu: 25.0, kelembapan: 50, suara_db: 57, asap_metric: 2, ppm_co: 4.7 },
  { suhu: 24.9, kelembapan: 50, suara_db: 59, asap_metric: 2, ppm_co: 4.6 },
  { suhu: 24.8, kelembapan: 49, suara_db: 60, asap_metric: 2, ppm_co: 4.5 },
  { suhu: 24.9, kelembapan: 50, suara_db: 61, asap_metric: 2, ppm_co: 4.6 },
];

// ======================================================
// AREA 3
// Fokus masalah: CO meningkat, ada kurang nyaman dan tidak nyaman
// 3 data terakhir buruk -> bisa trigger telegram juga
// ======================================================
const dataArea3 = [
  { suhu: 25.0, kelembapan: 54, suara_db: 42, asap_metric: 3, ppm_co: 4.8 },
  { suhu: 25.1, kelembapan: 54, suara_db: 42, asap_metric: 3, ppm_co: 5.2 },
  { suhu: 25.2, kelembapan: 55, suara_db: 43, asap_metric: 4, ppm_co: 5.8 },
  { suhu: 25.3, kelembapan: 55, suara_db: 42, asap_metric: 4, ppm_co: 6.3 },
  { suhu: 25.2, kelembapan: 55, suara_db: 43, asap_metric: 4, ppm_co: 7.0 },
  { suhu: 25.3, kelembapan: 56, suara_db: 42, asap_metric: 5, ppm_co: 8.0 },
  { suhu: 25.4, kelembapan: 56, suara_db: 43, asap_metric: 5, ppm_co: 8.8 },
  { suhu: 25.3, kelembapan: 55, suara_db: 42, asap_metric: 5, ppm_co: 9.2 },
  { suhu: 25.2, kelembapan: 55, suara_db: 41, asap_metric: 5, ppm_co: 10.1 },
  { suhu: 25.1, kelembapan: 54, suara_db: 41, asap_metric: 4, ppm_co: 10.5 },
  { suhu: 25.0, kelembapan: 54, suara_db: 40, asap_metric: 4, ppm_co: 10.8 },
  { suhu: 24.9, kelembapan: 53, suara_db: 40, asap_metric: 4, ppm_co: 11.0 },
];

// ======================================================
// AREA 4
// Fokus masalah: dingin + terlalu kering
// Banyak masalah ringan untuk isi notifikasi
// ======================================================
const dataArea4 = [
  { suhu: 20.8, kelembapan: 39, suara_db: 38, asap_metric: 2, ppm_co: 3.8 },
  { suhu: 20.6, kelembapan: 38, suara_db: 38, asap_metric: 2, ppm_co: 3.8 },
  { suhu: 20.5, kelembapan: 37, suara_db: 39, asap_metric: 2, ppm_co: 3.9 },
  { suhu: 20.4, kelembapan: 36, suara_db: 38, asap_metric: 2, ppm_co: 3.8 },
  { suhu: 20.3, kelembapan: 36, suara_db: 38, asap_metric: 2, ppm_co: 3.9 },
  { suhu: 20.2, kelembapan: 35, suara_db: 39, asap_metric: 2, ppm_co: 3.8 },
  { suhu: 20.1, kelembapan: 35, suara_db: 38, asap_metric: 2, ppm_co: 3.8 },
  { suhu: 20.0, kelembapan: 36, suara_db: 38, asap_metric: 2, ppm_co: 3.9 },
  { suhu: 20.2, kelembapan: 37, suara_db: 38, asap_metric: 2, ppm_co: 3.8 },
  { suhu: 20.5, kelembapan: 38, suara_db: 37, asap_metric: 2, ppm_co: 3.8 },
  { suhu: 20.7, kelembapan: 39, suara_db: 38, asap_metric: 2, ppm_co: 3.9 },
  { suhu: 21.0, kelembapan: 40, suara_db: 38, asap_metric: 2, ppm_co: 3.8 },
];

export const DATA_DUMMY = {
  perpustakaan: {
    ruang_1: {
      latest: {
        ...dataArea1[dataArea1.length - 1],
        timestamp: Math.floor(
          new Date(
            waktuAwal.getTime() + (dataArea1.length - 1) * 5 * 60000,
          ).getTime() / 1000,
        ),
        waktu_text: formatWaktuText(
          new Date(waktuAwal.getTime() + (dataArea1.length - 1) * 5 * 60000),
        ),
      },
      history: buatRiwayat(waktuAwal, dataArea1),
    },
    ruang_2: {
      latest: {
        ...dataArea2[dataArea2.length - 1],
        timestamp: Math.floor(
          new Date(
            waktuAwal.getTime() + (dataArea2.length - 1) * 5 * 60000,
          ).getTime() / 1000,
        ),
        waktu_text: formatWaktuText(
          new Date(waktuAwal.getTime() + (dataArea2.length - 1) * 5 * 60000),
        ),
      },
      history: buatRiwayat(waktuAwal, dataArea2),
    },
    ruang_3: {
      latest: {
        ...dataArea3[dataArea3.length - 1],
        timestamp: Math.floor(
          new Date(
            waktuAwal.getTime() + (dataArea3.length - 1) * 5 * 60000,
          ).getTime() / 1000,
        ),
        waktu_text: formatWaktuText(
          new Date(waktuAwal.getTime() + (dataArea3.length - 1) * 5 * 60000),
        ),
      },
      history: buatRiwayat(waktuAwal, dataArea3),
    },
    ruang_4: {
      latest: {
        ...dataArea4[dataArea4.length - 1],
        timestamp: Math.floor(
          new Date(
            waktuAwal.getTime() + (dataArea4.length - 1) * 5 * 60000,
          ).getTime() / 1000,
        ),
        waktu_text: formatWaktuText(
          new Date(waktuAwal.getTime() + (dataArea4.length - 1) * 5 * 60000),
        ),
      },
      history: buatRiwayat(waktuAwal, dataArea4),
    },
  },
};
