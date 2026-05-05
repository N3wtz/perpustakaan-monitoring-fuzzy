export const DAFTAR_QOS_SENSOR = [
  { key: "suhu", label: "Suhu", unit: "°C" },
  { key: "kelembapan", label: "Kelembapan", unit: "%" },
  { key: "kebisingan", label: "Kebisingan", unit: "dB" },
  { key: "asap", label: "Indeks Asap", unit: "indeks" },
  { key: "kualitasUdara", label: "Kualitas Udara (CO)", unit: "ppm" },
];

export function formatMs(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(0)} ms`;
}

export function formatLoss(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(2)} %`;
}
