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
  buatFilterDefault,
} from "../utils/helper";

export default function HalamanParameter({
  page,
  rooms,
  ruangAktif,
  setRuangAktif,
}) {
  const [periode, setPeriode] = useState("hari");
  const [filterTanggal, setFilterTanggal] = useState(buatFilterDefault());

  const ruang = rooms?.[ruangAktif] || Object.values(rooms)[0];
  const meta = META_PARAMETER[page];

  const labelRuang =
    TATA_LETAK_RUANG.find((item) => item.id === ruangAktif)?.label || "Area 1";

  const dataGrafik = useMemo(() => {
    if (!ruang?.history?.length || !meta) return [];

    const terfilter = filterRiwayatByPeriode(
      ruang.history,
      periode,
      filterTanggal,
    );

    return kelompokkanGrafik(terfilter, meta.key, periode);
  }, [ruang, meta, periode, filterTanggal]);

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

        <div className="flex items-center gap-3 rounded-full bg-transparent px-4 py-2 opacity-0 pointer-events-none">
          <div className="h-12 w-12 rounded-full bg-slate-200" />

          <div>
            <div className="text-lg font-semibold">Perpustakaan</div>
            <div className="text-xs text-slate-600">{KONFIG_APP.namaAdmin}</div>
          </div>

          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>

      <KartuUmum className="mb-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">
              Ruangan yang ditampilkan
            </div>
            <div className="text-xl font-semibold text-slate-800">
              {labelRuang}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Area</p>
              <PemilihRuang value={ruangAktif} onChange={setRuangAktif} />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Periode</p>
              <PemilihPeriode value={periode} onChange={setPeriode} />
            </div>

            {periode === "hari" && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Pilih Tanggal
                </p>
                <input
                  type="date"
                  value={filterTanggal.tanggal}
                  onChange={(e) =>
                    setFilterTanggal((prev) => ({
                      ...prev,
                      tanggal: e.target.value,
                    }))
                  }
                  className="h-[42px] w-[170px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400"
                />
              </div>
            )}

            {periode === "bulan" && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Pilih Bulan
                </p>
                <input
                  type="month"
                  value={filterTanggal.bulan}
                  onChange={(e) =>
                    setFilterTanggal((prev) => ({
                      ...prev,
                      bulan: e.target.value,
                    }))
                  }
                  className="h-[42px] w-[170px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400"
                />
              </div>
            )}

            {periode === "kustom" && (
              <>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    Tanggal Mulai
                  </p>
                  <input
                    type="date"
                    value={filterTanggal.tanggalMulai}
                    onChange={(e) =>
                      setFilterTanggal((prev) => ({
                        ...prev,
                        tanggalMulai: e.target.value,
                      }))
                    }
                    className="h-[42px] w-[170px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    Tanggal Selesai
                  </p>
                  <input
                    type="date"
                    value={filterTanggal.tanggalSelesai}
                    onChange={(e) =>
                      setFilterTanggal((prev) => ({
                        ...prev,
                        tanggalSelesai: e.target.value,
                      }))
                    }
                    className="h-[42px] w-[170px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </KartuUmum>

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

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-stretch">
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

        <KartuUmum className="p-5 h-full">
          <div className="text-[18px] text-slate-600">Nilai Terkini</div>

          <div className="mt-7 flex items-end gap-3">
            <div className="h-3 w-3 rounded-full bg-blue-500" />

            <div className="text-[56px] font-semibold leading-none tracking-tight">
              {meta?.key === "asap_metric"
                ? `${angkaAman(terkini.asap_metric).toFixed(0)}${meta?.unit}`
                : `${angkaAman(terkini[meta?.key]).toFixed(0)}${meta?.unit}`}
            </div>
          </div>
        </KartuUmum>
      </div>
    </>
  );
}
