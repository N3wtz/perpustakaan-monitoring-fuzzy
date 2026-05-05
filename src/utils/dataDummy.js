import { TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";

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

function hashBagian(id) {
  return String(id)
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

function ambilProfilBagian(bagian) {
  const nomor = bagian?.nomor || 1;
  const lantai = bagian?.lantai || 2;
  const hash = hashBagian(bagian?.id || "bagian");

  return {
    suhu: 23.4 + (lantai - 2) * 0.4 + (nomor % 4) * 0.3 + (hash % 5) * 0.05,
    kelembapan: 48 + (nomor % 5) * 1.3 + (lantai - 2) * 0.8,
    suara: 35 + (nomor % 6) * 1.6 + (lantai - 2) * 1.0,
    asap: 1.4 + (nomor % 3) * 0.35,
    co: 3.0 + (nomor % 4) * 0.32,
  };
}

// ======================================================
// DATA DUMMY REALTIME
// Bentuk field dibuat semirip mungkin dengan kiriman ESP32:
// latest, history, node_info, timestamp, waktu_text, dan qos.
// ======================================================
export function buatDataDummyRealtime(
  bagian,
  seq = 1,
  sampleIntervalMs = 5000,
  date = new Date(),
) {
  const base = ambilProfilBagian(bagian);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const detikEpoch = Math.floor(date.getTime() / 1000);
  const waktuHarian = (hour * 60 + minute) / 1440;
  const jamRamai = hour >= 8 && hour <= 17;
  const gelombangPelan = Math.sin(
    (detikEpoch / 3600 + (bagian?.nomor || 1)) * 0.9,
  );

  const suhu =
    base.suhu +
    Math.sin(waktuHarian * Math.PI * 2 - 1.2) * 0.75 +
    gelombangPelan * 0.18 +
    noise(0.18);

  const kelembapan =
    base.kelembapan +
    Math.cos(waktuHarian * Math.PI * 2) * 2.8 +
    gelombangPelan * 0.9 +
    noise(0.7);

  const suara =
    base.suara +
    (jamRamai ? 5.5 : 1.2) +
    (hour >= 10 && hour <= 14 ? 2.2 : 0) +
    noise(1.5);

  // Spike dibuat jarang agar dummy tetap realistis, bukan selalu bermasalah.
  const asapSpike = Math.random() > 0.997 ? 9 + Math.random() * 8 : 0;
  const coSpike = Math.random() > 0.997 ? 3 + Math.random() * 5 : 0;

  const asapMetric = clamp(base.asap + asapSpike + noise(0.25), 0, 25);
  const ppmCO = clamp(base.co + coSpike + noise(0.2), 0, 18);
  const mq2Delta = Math.round(asapMetric * 10);
  const mq7Adc = Math.round(1650 + ppmCO * 38 + noise(20));

  return {
    bagian_id: bagian.id,
    ruang_id: bagian.id,
    node_id: `dummy_${bagian.id}`,
    sumber_data: "dummy_realtime",

    suhu: Number(clamp(suhu, 18, 32).toFixed(1)),
    kelembapan: Number(clamp(kelembapan, 30, 80).toFixed(1)),
    suara_db: Number(clamp(suara, 30, 75).toFixed(1)),

    mq2_adc: 1200 + mq2Delta,
    mq2_delta: mq2Delta,
    asap_flag: asapMetric >= 10 ? 1 : 0,
    asap_metric: Number(asapMetric.toFixed(1)),

    mq7_adc: mq7Adc,
    ppm_co: Number(ppmCO.toFixed(1)),

    timestamp: detikEpoch,
    waktu_text: formatWaktuText(date),
    wifi_rssi: -45 - ((bagian.nomor + bagian.lantai) % 18),

    kalibrasi_mq2_baseline: 1200,
    kalibrasi_mq7_r0: 1,
    kalibrasi_dht_temp_offset: 0,
    kalibrasi_dht_hum_offset: 0,
    status_node: "online",

    qos: {
      seq,
      sent_at_ms: String(date.getTime()),
      sample_interval_ms: sampleIntervalMs,
    },
  };
}

// ======================================================
// GENERATOR DATA LOKAL 1 TAHUN
// Hanya dipakai jika KONFIG_APP.gunakanDataDummy = true.
// ======================================================
function generate1YearData(bagian) {
  const hasil = {};
  const start = new Date("2026-01-01T00:00:00");
  const end = new Date("2026-12-31T23:59:59");
  const intervalMenit = 15;
  let id = 0;

  for (
    let date = new Date(start);
    date <= end;
    date.setMinutes(date.getMinutes() + intervalMenit)
  ) {
    const currentDate = new Date(date);
    const seq = id + 1;

    hasil[`id_${id++}`] = buatDataDummyRealtime(
      bagian,
      seq,
      intervalMenit * 60 * 1000,
      currentDate,
    );
  }

  return hasil;
}

function getLatest(history) {
  const keys = Object.keys(history);
  return history[keys[keys.length - 1]];
}

const perpustakaan = {};

TATA_LETAK_BAGIAN.forEach((bagian) => {
  const history = generate1YearData(bagian);
  const latest = getLatest(history);

  perpustakaan[bagian.id] = {
    latest,
    history,
    node_info: {
      bagian_id: bagian.id,
      ruang_id: bagian.id,
      node_id:
        bagian.sumber === "esp32" ? `esp32_${bagian.id}` : `dummy_${bagian.id}`,
      sumber_data: bagian.sumber === "esp32" ? "esp32" : "dummy_realtime",
      last_seen: latest.timestamp,
      last_seen_text: latest.waktu_text,
      wifi_rssi: latest.wifi_rssi,
      status_node: "online",
    },
  };
});

export const DATA_DUMMY = { perpustakaan };
