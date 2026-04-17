import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import KartuUmum from "../components/KartuUmum";
import { KONFIG_APP, TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";

function formatMs(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(0)} ms`;
}

function formatLoss(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(2)} %`;
}

function KartuQosRuangan({ namaRuang, delayMs, jitterMs, packetLossPct }) {
  return (
    <KartuUmum className="p-5">
      <div className="mb-4 text-lg font-semibold text-slate-800">
        {namaRuang}
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-slate-500">Delay</div>
          <div className="text-2xl font-semibold">{formatMs(delayMs)}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Jitter</div>
          <div className="text-2xl font-semibold">{formatMs(jitterMs)}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Packet Loss</div>
          <div className="text-2xl font-semibold">
            {formatLoss(packetLossPct)}
          </div>
        </div>
      </div>
    </KartuUmum>
  );
}

export default function HalamanQoS({ rooms }) {
  const [metricsByRoom, setMetricsByRoom] = useState({});
  const trackerRef = useRef({});

  useEffect(() => {
    Object.entries(rooms || {}).forEach(([roomId, room]) => {
      const qos = room?.latest?.qos;
      if (!qos?.seq || !qos?.sent_at_ms) return;

      const prev = trackerRef.current[roomId];
      if (prev?.seq === qos.seq) return;

      const nowMs = Date.now();
      const delayMs = Math.max(0, nowMs - qos.sent_at_ms);
      const jitterNow = prev ? Math.abs(delayMs - prev.lastDelayMs) : 0;
      const lostNow =
        prev && qos.seq > prev.seq + 1 ? qos.seq - prev.seq - 1 : 0;

      const receivedTotal = (prev?.receivedTotal || 0) + 1;
      const lostTotal = (prev?.lostTotal || 0) + lostNow;

      const packetLossPct =
        receivedTotal + lostTotal > 0
          ? (lostTotal / (receivedTotal + lostTotal)) * 100
          : 0;

      const avgJitterMs = prev
        ? ((prev.avgJitterMs || 0) * (receivedTotal - 1) + jitterNow) /
          receivedTotal
        : jitterNow;

      trackerRef.current[roomId] = {
        seq: qos.seq,
        lastDelayMs: delayMs,
        receivedTotal,
        lostTotal,
        avgJitterMs,
      };

      setMetricsByRoom((prevState) => ({
        ...prevState,
        [roomId]: {
          delayMs,
          jitterMs: avgJitterMs,
          packetLossPct,
        },
      }));
    });
  }, [rooms]);

  return (
    <>
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

      <KartuUmum className="mb-4 p-5">
        <div className="text-sm text-slate-600">
          Halaman ini menampilkan QoS per ruangan berdasarkan paket data yang
          dikirim oleh tiap node ESP32.
        </div>
      </KartuUmum>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        {TATA_LETAK_RUANG.map((ruang) => {
          const metrics = metricsByRoom?.[ruang.id] || {};

          return (
            <KartuQosRuangan
              key={ruang.id}
              namaRuang={ruang.label}
              delayMs={metrics.delayMs}
              jitterMs={metrics.jitterMs}
              packetLossPct={metrics.packetLossPct}
            />
          );
        })}
      </div>
    </>
  );
}
