import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Timer } from "lucide-react";

import KartuUmum from "../components/KartuUmum";
import {
  DAFTAR_BAGIAN_ESP32_ASLI,
  TATA_LETAK_BAGIAN,
} from "../fuzzy/aturanFuzzy";

const MAX_DELAY_MS = 10000;
const MIN_VALID_SEQ = 1;

function parseAngka(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMs(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(0)} ms`;
}

function formatDetik(valueMs) {
  if (!Number.isFinite(valueMs)) return "-";
  return `${(valueMs / 1000).toFixed(2)} detik`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(2)} %`;
}

function formatWaktuDetik(totalDetik) {
  const menit = Math.floor(totalDetik / 60);
  const detik = totalDetik % 60;
  return `${String(menit).padStart(2, "0")}:${String(detik).padStart(2, "0")}`;
}

function rataRata(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  if (!arr.length) return 0;

  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function kategoriDelay(delayMs) {
  if (!Number.isFinite(delayMs)) return "-";

  const detik = delayMs / 1000;
  if (detik < 2) return "Sangat Baik";
  if (detik <= 4) return "Baik";
  return "Kurang";
}

function kategoriPacketLoss(loss) {
  if (!Number.isFinite(loss)) return "-";
  if (loss === 0) return "Sangat Baik";
  if (loss <= 1) return "Baik";
  if (loss <= 3) return "Cukup";
  return "Buruk";
}

function kelasKategori(kategori) {
  switch (kategori) {
    case "Sangat Baik":
      return "text-green-600";
    case "Baik":
      return "text-blue-600";
    case "Cukup":
    case "Kurang":
      return "text-amber-500";
    case "Buruk":
      return "text-red-600";
    default:
      return "text-slate-500";
  }
}

function statusSinyalRssi(rssi) {
  if (!Number.isFinite(rssi)) return "-";
  if (rssi >= -60) return "Sangat Baik";
  if (rssi >= -70) return "Baik";
  if (rssi >= -80) return "Sedang";
  return "Lemah";
}

function KartuKontrol({
  durasiMenit,
  setDurasiMenit,
  statusSesi,
  sisaDetik,
  mulaiPengukuran,
  resetPengukuran,
}) {
  const labelStatus =
    statusSesi === "idle"
      ? "Belum Mulai"
      : statusSesi === "running"
        ? "Sedang Mengukur"
        : "Selesai";

  return (
    <KartuUmum className="p-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_380px] xl:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            QoS
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
            Pengukuran hanya menghitung 4 sensor ESP32 asli di lantai 2, yaitu
            Bagian 1, Bagian 3, Bagian 6, dan Bagian 8. Data dummy realtime
            tidak ikut dihitung.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
              Status: {labelStatus}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <Timer className="h-4 w-4" />
              Sisa Waktu: {formatWaktuDetik(sisaDetik)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Durasi pengukuran (menit)
              </label>
              <input
                type="number"
                min="1"
                value={durasiMenit}
                onChange={(e) => setDurasiMenit(e.target.value)}
                className="h-[42px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400"
                placeholder="1"
              />
            </div>

            <button
              type="button"
              onClick={mulaiPengukuran}
              disabled={statusSesi === "running"}
              className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Play className="h-4 w-4" />
              {statusSesi === "running" ? "Mengukur" : "Mulai"}
            </button>

            <button
              type="button"
              onClick={resetPengukuran}
              className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </KartuUmum>
  );
}

function BarisMetrik({
  label,
  realtime,
  rataRata: avg,
  medianValue,
  kategori,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-700">{label}</div>

      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <div className="text-xs text-slate-400">Realtime</div>
          <div className="mt-1 font-semibold text-slate-800">{realtime}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Rata-rata</div>
          <div className="mt-1 font-semibold text-slate-800">{avg}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Median</div>
          <div className="mt-1 font-semibold text-slate-800">{medianValue}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Kategori</div>
          <div className={`mt-1 font-semibold ${kelasKategori(kategori)}`}>
            {kategori}
          </div>
        </div>
      </div>
    </div>
  );
}

function KartuQosBagian({ bagian, metrics, statusSesi, room }) {
  const wifiRssi = parseAngka(room?.latest?.wifi_rssi, NaN);
  const kategoriDelayText = kategoriDelay(metrics?.avgDelayMs);
  const kategoriLossText = kategoriPacketLoss(metrics?.packetLossPct);
  const online = room?.online;

  return (
    <KartuUmum className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {bagian.labelLengkap}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            RSSI: {Number.isFinite(wifiRssi) ? `${wifiRssi} dBm` : "-"} •{" "}
            {statusSinyalRssi(wifiRssi)}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            online
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {online ? "Online" : "Offline"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs text-slate-400">Paket valid</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {metrics?.receivedCount || 0}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs text-slate-400">Paket hilang</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {metrics?.lostCount || 0}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs text-slate-400">Paket diabaikan</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {metrics?.ignoredCount || 0}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs text-slate-400">Seq terakhir</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {metrics?.lastSeq || 0}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <BarisMetrik
          label="Delay end-to-end"
          realtime={formatMs(metrics?.latestDelayMs)}
          rataRata={formatDetik(metrics?.avgDelayMs)}
          medianValue={formatDetik(metrics?.medianDelayMs)}
          kategori={kategoriDelayText}
        />

        <BarisMetrik
          label="Packet loss"
          realtime={formatPercent(metrics?.packetLossPct)}
          rataRata={formatPercent(metrics?.packetLossPct)}
          medianValue="-"
          kategori={kategoriLossText}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {statusSesi === "idle" && "Belum ada sesi pengukuran."}
        {statusSesi === "running" && "Sesi pengukuran sedang berjalan."}
        {statusSesi === "finished" &&
          "Hasil sesi siap digunakan untuk evaluasi TA."}
      </p>
    </KartuUmum>
  );
}

export default function HalamanQoS({ rooms }) {
  const [durasiMenit, setDurasiMenit] = useState("1");
  const [statusSesi, setStatusSesi] = useState("idle");
  const [startedAtMs, setStartedAtMs] = useState(null);
  const [endsAtMs, setEndsAtMs] = useState(null);
  const [sisaDetik, setSisaDetik] = useState(0);
  const [metricsByRoom, setMetricsByRoom] = useState({});
  const trackerRef = useRef({});

  const daftarSensorQos = useMemo(
    () =>
      TATA_LETAK_BAGIAN.filter((bagian) =>
        DAFTAR_BAGIAN_ESP32_ASLI.includes(bagian.id),
      ),
    [],
  );

  const durasiMs = useMemo(() => {
    const menit = parseAngka(durasiMenit, 1);
    return Math.max(1, menit) * 60 * 1000;
  }, [durasiMenit]);

  function resetPengukuran() {
    trackerRef.current = {};
    setMetricsByRoom({});
    setStartedAtMs(null);
    setEndsAtMs(null);
    setSisaDetik(0);
    setStatusSesi("idle");
  }

  function mulaiPengukuran() {
    const sekarang = Date.now();

    trackerRef.current = {};
    setMetricsByRoom({});
    setStartedAtMs(sekarang);
    setEndsAtMs(sekarang + durasiMs);
    setSisaDetik(Math.floor(durasiMs / 1000));
    setStatusSesi("running");
  }

  useEffect(() => {
    if (statusSesi !== "running" || !endsAtMs) return undefined;

    const timer = setInterval(() => {
      const sekarang = Date.now();
      const sisa = Math.max(0, Math.ceil((endsAtMs - sekarang) / 1000));

      setSisaDetik(sisa);

      if (sekarang >= endsAtMs) {
        setStatusSesi("finished");
        clearInterval(timer);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [statusSesi, endsAtMs]);

  useEffect(() => {
    if (statusSesi !== "running" || !startedAtMs) return;

    daftarSensorQos.forEach((bagian) => {
      const roomId = bagian.id;
      const room = rooms?.[roomId];
      const latest = room?.latest || {};

      if (!DAFTAR_BAGIAN_ESP32_ASLI.includes(roomId)) return;
      if (latest?.sumber_data && latest.sumber_data !== "esp32") return;

      const qos = latest?.qos || {};
      const seq = parseAngka(qos?.seq, 0);
      const sentAtMs = parseAngka(qos?.sent_at_ms, 0);

      if (seq < MIN_VALID_SEQ || !sentAtMs) return;
      if (sentAtMs < startedAtMs) return;

      const prev = trackerRef.current[roomId];
      if (prev?.lastSeq === seq) return;

      const nowMs = Date.now();
      const delayMs = nowMs - sentAtMs;

      if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > MAX_DELAY_MS) {
        const nextIgnored = {
          ...(prev || {}),
          ignoredCount: (prev?.ignoredCount || 0) + 1,
          lastSeq: seq,
        };

        trackerRef.current[roomId] = nextIgnored;

        setMetricsByRoom((prevState) => ({
          ...prevState,
          [roomId]: {
            ...prevState[roomId],
            ignoredCount: nextIgnored.ignoredCount,
            lastSeq: nextIgnored.lastSeq,
          },
        }));

        return;
      }

      const lostNow =
        prev && seq > prev.lastSeq + 1 ? seq - prev.lastSeq - 1 : 0;

      const delaySamples = [...(prev?.delaySamples || []), delayMs];
      const receivedCount = (prev?.receivedCount || 0) + 1;
      const lostCount = (prev?.lostCount || 0) + lostNow;
      const ignoredCount = prev?.ignoredCount || 0;
      const avgDelayMs = rataRata(delaySamples);
      const medianDelayMs = median(delaySamples);
      const totalPaket = receivedCount + lostCount;
      const packetLossPct = totalPaket > 0 ? (lostCount / totalPaket) * 100 : 0;

      const nextState = {
        lastSeq: seq,
        receivedCount,
        lostCount,
        ignoredCount,
        latestDelayMs: delayMs,
        delaySamples,
        avgDelayMs,
        medianDelayMs,
        packetLossPct,
      };

      trackerRef.current[roomId] = nextState;
      setMetricsByRoom((prevState) => ({
        ...prevState,
        [roomId]: nextState,
      }));
    });
  }, [rooms, statusSesi, startedAtMs, daftarSensorQos]);

  return (
    <div className="space-y-5">
      <KartuKontrol
        durasiMenit={durasiMenit}
        setDurasiMenit={setDurasiMenit}
        statusSesi={statusSesi}
        sisaDetik={sisaDetik}
        mulaiPengukuran={mulaiPengukuran}
        resetPengukuran={resetPengukuran}
      />

      <KartuUmum className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Catatan Pengukuran
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Delay dihitung dari selisih waktu antara data dikirim oleh ESP32
          hingga data diterima atau ditampilkan pada website. Packet loss
          dihitung berdasarkan loncatan nomor sequence pada paket data latest
          yang dikirim oleh ESP32. Data dummy realtime tidak dihitung agar hasil
          QoS hanya mewakili perangkat ESP32 asli.
        </p>
      </KartuUmum>

      <div className="grid gap-5 xl:grid-cols-2">
        {daftarSensorQos.map((bagian) => (
          <KartuQosBagian
            key={bagian.id}
            bagian={bagian}
            metrics={metricsByRoom[bagian.id] || {}}
            statusSesi={statusSesi}
            room={rooms?.[bagian.id]}
          />
        ))}
      </div>
    </div>
  );
}
