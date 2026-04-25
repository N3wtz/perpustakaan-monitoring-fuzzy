function formatWaktuText(date) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  const detik = String(date.getSeconds()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari} ${jam}:${menit}:${detik}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function noise(kecil = 1) {
  return (Math.random() - 0.5) * kecil;
}

// ======================================================
// GENERATOR DATA 1 TAHUN DETAIL
// Interval 15 menit
// ======================================================
function generate1YearData(base) {
  const hasil = {};
  const start = new Date("2025-01-01T00:00:00");
  const jumlahHari = 365;
  const intervalMenit = 15;
  const dataPerHari = 24 * (60 / intervalMenit);

  let id = 0;

  for (let day = 0; day < jumlahHari; day++) {
    for (let i = 0; i < dataPerHari; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + day);
      date.setMinutes(i * intervalMenit);

      const hour = date.getHours();
      const minute = date.getMinutes();
      const waktuHarian = (hour * 60 + minute) / 1440;

      const jamAktif = hour >= 8 && hour <= 17;

      const suhu =
        base.suhu +
        Math.sin(waktuHarian * Math.PI * 2 - 1.2) * 1.2 +
        Math.sin((day / 365) * Math.PI * 2) * 1.0 +
        noise(0.4);

      const kelembapan =
        base.kelembapan +
        Math.cos(waktuHarian * Math.PI * 2) * 4 +
        Math.sin((day / 365) * Math.PI * 2) * 5 +
        noise(1.5);

      const suara =
        base.suara +
        (jamAktif ? 8 : 2) +
        (hour >= 10 && hour <= 14 ? 3 : 0) +
        noise(2.5);

      const asapSpike = Math.random() > 0.995 ? 10 + Math.random() * 8 : 0;
      const coSpike = Math.random() > 0.992 ? 4 + Math.random() * 5 : 0;

      const asap = base.asap + asapSpike + noise(0.5);
      const co = base.co + coSpike + noise(0.4);

      hasil[`id_${id++}`] = {
        suhu: Number(clamp(suhu, 18, 32).toFixed(1)),
        kelembapan: Number(clamp(kelembapan, 30, 80).toFixed(1)),
        suara_db: Number(clamp(suara, 30, 75).toFixed(1)),
        asap_metric: Number(clamp(asap, 0, 25).toFixed(1)),
        ppm_co: Number(clamp(co, 0, 18).toFixed(1)),
        timestamp: Math.floor(date.getTime() / 1000),
        waktu_text: formatWaktuText(date),
      };
    }
  }

  return hasil;
}

const area1History = generate1YearData({
  suhu: 24,
  kelembapan: 50,
  suara: 39,
  asap: 2,
  co: 4,
});

const area2History = generate1YearData({
  suhu: 25,
  kelembapan: 52,
  suara: 43,
  asap: 2,
  co: 4.5,
});

const area3History = generate1YearData({
  suhu: 26,
  kelembapan: 55,
  suara: 41,
  asap: 3,
  co: 5,
});

const area4History = generate1YearData({
  suhu: 22,
  kelembapan: 45,
  suara: 37,
  asap: 2,
  co: 3.5,
});

function getLatest(history) {
  const keys = Object.keys(history);
  return history[keys[keys.length - 1]];
}

export const DATA_DUMMY = {
  perpustakaan: {
    ruang_1: {
      latest: getLatest(area1History),
      history: area1History,
    },
    ruang_2: {
      latest: getLatest(area2History),
      history: area2History,
    },
    ruang_3: {
      latest: getLatest(area3History),
      history: area3History,
    },
    ruang_4: {
      latest: getLatest(area4History),
      history: area4History,
    },
  },
};
