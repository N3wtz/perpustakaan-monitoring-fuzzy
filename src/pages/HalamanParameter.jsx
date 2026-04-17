import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import KartuUmum from "../components/KartuUmum";
import PemilihPeriode from "../components/PemilihPeriode";
import PemilihRuang from "../components/PemilihRuang";
import LencanaStatus from "../components/LencanaStatus";
import KartuStatistik from "../components/KartuStatistik";
import {
  KONFIG_APP,
  META_PARAMETER,
  TATA_LETAK_RUANG,
} from "../fuzzy/aturanFuzzy";
import {
  filterRiwayatByPeriode,
  kelompokkanGrafik,
  hitungStatistik,
  angkaAman,
} from "../utils/helper";

export default function HalamanParameter({
  page,
  rooms,
  ruangAktif,
  setRuangAktif,
}) {
  const [periode, setPeriode] = useState("hari");
  const ruang = rooms?.[ruangAktif] || Object.values(rooms)[0];
  const meta = META_PARAMETER[page];
  const labelRuang =
    TATA_LETAK_RUANG.find((item) => item.id === ruangAktif)?.label || "Area 1";

  const dataGrafik = useMemo(() => {
    if (!ruang?.history?.length || !meta) return [];
    const terfilter = filterRiwayatByPeriode(ruang.history, periode);
    return kelompokkanGrafik(terfilter, meta.key, periode);
  }, [ruang, meta, periode]);

  const statistik = useMemo(() => hitungStatistik(dataGrafik), [dataGrafik]);
  const terkini = ruang?.latest || {};
  const status = ruang?.kartuParameter?.[page]?.status || "-";
  const detail = ruang?.kartuParameter?.[page]?.detail || "-";

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {meta?.label || "Parameter"}
        </h1>

        <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div>
            <div className="text-lg font-semibold">Perpustakaan</div>
            <div className="text-xs text-slate-600">{KONFIG_APP.namaAdmin}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">Ruangan yang ditampilkan</div>
          <div className="text-xl font-semibold text-slate-800">
            {labelRuang}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PemilihRuang value={ruangAktif} onChange={setRuangAktif} />
          <PemilihPeriode value={periode} onChange={setPeriode} />
        </div>
      </div>

      <KartuUmum className="p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[18px] font-semibold text-slate-700">
              Detail {meta?.label} - {labelRuang}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <LencanaStatus status={status} />
              <span className="text-sm text-slate-500">{detail}</span>
            </div>
          </div>
        </div>

        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataGrafik}>
              <CartesianGrid stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94A3B8", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </KartuUmum>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <KartuStatistik
          judul="Rata-rata"
          nilai={statistik.rataRata}
          unit={meta?.unit || ""}
        />
        <KartuStatistik
          judul="Tertinggi"
          nilai={statistik.tertinggi}
          unit={meta?.unit || ""}
        />
        <KartuStatistik
          judul="Terendah"
          nilai={statistik.terendah}
          unit={meta?.unit || ""}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <KartuUmum className="p-5">
          <div className="text-lg font-semibold">Nilai Terkini</div>
          <div className="mt-5 text-[48px] font-bold tracking-tight">
            {meta?.key === "asap_metric"
              ? `${angkaAman(terkini.asap_metric).toFixed(0)} ${meta?.unit}`
              : `${angkaAman(terkini[meta?.key]).toFixed(0)} ${meta?.unit}`}
          </div>
        </KartuUmum>

        <KartuUmum className="p-5">
          <div className="text-lg font-semibold">Ringkasan Grafik</div>
          <div className="mt-4 h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGrafik}>
                <CartesianGrid stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="label" hide />
                <YAxis hide />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </KartuUmum>
      </div>
    </>
  );
}
