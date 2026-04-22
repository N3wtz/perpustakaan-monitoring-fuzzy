import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Play, RotateCcw, Timer } from "lucide-react";
import KartuUmum from "../components/KartuUmum";
import { KONFIG_APP, TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";

// ======================================================
// KONFIGURASI
// ======================================================
const MAX_DELAY_MS = 10000; // delay > 10 detik diabaikan
const MIN_VALID_SEQ = 1;

// ======================================================
// HELPER FORMAT
// ======================================================
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

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

// ======================================================
// KATEGORI QOS SESUAI RULE KAMU
// ======================================================
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

// ======================================================
// UI
// ======================================================
function HeaderUser() {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-4xl font-bold tracking-tight">QoS</h1>

      <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-slate-200" />
        <div>
          <div className="text-lg font-semibold">Perpustakaan</div>
          <div className="text-xs text-slate-600">{KONFIG_APP.namaAdmin}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </div>
    </div>
  );
}

function KartuKontrol({
  durasiMenit,
  setDurasiMenit,
  statusSesi,
  sisaDetik,
  mulaiPengukuran,
  resetPengukuran,
}) {
  return (
    <KartuUmum className="p-5">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-end">
        <div>
          <div className="text-sm font-medium text-slate-600">
            Durasi pengukuran (menit)
          </div>
          <input
            type="number"
            min="1"
            step="1"
            value={durasiMenit}
            onChange={(e) => setDurasiMenit(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition focus:border-blue-400"
            placeholder="Contoh: 1"
          />
        </div>

        <button
          type="button"
          onClick={mulaiPengukuran}
          disabled={statusSesi === "running"}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {statusSesi === "running" ? "Sedang Mengukur" : "Mulai Pengukuran"}
        </button>

        <button
          type="button"
          onClick={resetPengukuran}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
          Status:{" "}
          <span className="font-semibold">
            {statusSesi === "idle"
              ? "Belum Mulai"
              : statusSesi === "running"
                ? "Sedang Mengukur"
                : "Selesai"}
          </span>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
          <span className="inline-flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Sisa Waktu:{" "}
            <span className="font-semibold">{formatWaktuDetik(sisaDetik)}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        QoS hanya dihitung selama sesi pengukuran aktif. Paket lama, paket
        duplikat, dan delay yang tidak masuk akal tidak ikut dihitung.
      </div>
    </KartuUmum>
  );
}

function BarisMetrik({ label, realtime, rataRata, medianValue, kategori }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="text-sm text-slate-500">{label}</div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
        <div>
          <div className="text-xs text-slate-400">Realtime</div>
          <div className="text-xl font-semibold text-slate-900">{realtime}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Rata-rata</div>
          <div className="text-xl font-semibold text-slate-900">{rataRata}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Median</div>
          <div className="text-xl font-semibold text-slate-900">
            {medianValue}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Kategori</div>
          <div className={`text-lg font-bold ${kelasKategori(kategori)}`}>
            {kategori}
          </div>
        </div>
      </div>
    </div>
  );
}

function KartuQosArea({ label, metrics, statusSesi, wifiRssi }) {
  const kategoriDelayText = kategoriDelay(metrics?.avgDelayMs);
  const kategoriLossText = kategoriPacketLoss(metrics?.packetLossPct);

  return (
    <KartuUmum className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">{label}</div>
          <div className="mt-1 text-sm text-slate-500">
            RSSI: {Number.isFinite(wifiRssi) ? `${wifiRssi} dBm` : "-"} •{" "}
            {statusSinyalRssi(wifiRssi)}
          </div>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Paket valid: {metrics?.receivedCount || 0}
        </div>
      </div>

      <div className="space-y-3">
        <BarisMetrik
          label="Delay End-to-End"
          realtime={formatDetik(metrics?.latestDelayMs)}
          rataRata={formatDetik(metrics?.avgDelayMs)}
          medianValue={formatDetik(metrics?.medianDelayMs)}
          kategori={kategoriDelayText}
        />

        <BarisMetrik
          label="Packet Loss"
          realtime={formatPercent(metrics?.packetLossPct)}
          rataRata={formatPercent(metrics?.packetLossPct)}
          medianValue={metrics?.lostCount ?? 0}
          kategori={kategoriLossText}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500 md:grid-cols-4">
        <div>
          Paket valid:{" "}
          <span className="font-semibold text-slate-700">
            {metrics?.receivedCount || 0}
          </span>
        </div>
        <div>
          Paket hilang:{" "}
          <span className="font-semibold text-slate-700">
            {metrics?.lostCount || 0}
          </span>
        </div>
        <div>
          Paket diabaikan:{" "}
          <span className="font-semibold text-slate-700">
            {metrics?.ignoredCount || 0}
          </span>
        </div>
        <div>
          Seq terakhir:{" "}
          <span className="font-semibold text-slate-700">
            {metrics?.lastSeq || 0}
          </span>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {statusSesi === "idle" && "Belum ada sesi pengukuran."}
        {statusSesi === "running" && "Sesi pengukuran sedang berjalan."}
        {statusSesi === "finished" &&
          "Hasil sesi siap digunakan untuk evaluasi TA."}
      </div>
    </KartuUmum>
  );
}

// ======================================================
// HALAMAN QOS
// ======================================================
export default function HalamanQoS({ rooms }) {
  const [durasiMenit, setDurasiMenit] = useState("1");
  const [statusSesi, setStatusSesi] = useState("idle"); // idle | running | finished
  const [startedAtMs, setStartedAtMs] = useState(null);
  const [endsAtMs, setEndsAtMs] = useState(null);
  const [sisaDetik, setSisaDetik] = useState(0);
  const [metricsByRoom, setMetricsByRoom] = useState({});

  const trackerRef = useRef({});

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
    if (statusSesi !== "running" || !endsAtMs) return;

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

    Object.entries(rooms || {}).forEach(([roomId, room]) => {
      const qos = room?.latest?.qos || {};
      const seq = parseAngka(qos?.seq, 0);
      const sentAtMs = parseAngka(qos?.sent_at_ms, 0);

      if (seq < MIN_VALID_SEQ || !sentAtMs) return;
      if (sentAtMs < startedAtMs) return;

      const prev = trackerRef.current[roomId];

      // duplikat
      if (prev?.lastSeq === seq) return;

      const nowMs = Date.now();
      const delayMs = nowMs - sentAtMs;

      // delay tidak valid / terlalu besar
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
  }, [rooms, statusSesi, startedAtMs]);

  return (
    <>
      <HeaderUser />

      <KartuKontrol
        durasiMenit={durasiMenit}
        setDurasiMenit={setDurasiMenit}
        statusSesi={statusSesi}
        sisaDetik={sisaDetik}
        mulaiPengukuran={mulaiPengukuran}
        resetPengukuran={resetPengukuran}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {TATA_LETAK_RUANG.map((ruang) => (
          <KartuQosArea
            key={ruang.id}
            label={ruang.label}
            metrics={metricsByRoom?.[ruang.id] || {}}
            statusSesi={statusSesi}
            wifiRssi={rooms?.[ruang.id]?.latest?.wifi_rssi}
          />
        ))}
      </div>
    </>
  );
}
