import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
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

import { META_PARAMETER, TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";
import { hitungFuzzyRuang } from "../fuzzy/mesinFuzzy";
import {
  filterRiwayatByPeriode,
  kelompokkanGrafik,
  hitungStatistik,
  angkaAman,
  buatFilterDefault,
} from "../utils/helper";
import { downloadCsvExcel } from "../utils/exportExcel";

const META_KENYAMANAN_TOTAL = {
  key: "skorTotal",
  label: "Kenyamanan Total",
  unit: "",
};

const KEY_FUZZY_PARAMETER = {
  suhu: "suhu",
  kelembapan: "kelembapan",
  kebisingan: "kebisingan",
  asap: "asap",
  kualitasUdara: "co",
};

function metaHalaman(page) {
  if (page === "kenyamananTotal") {
    return META_KENYAMANAN_TOTAL;
  }

  if (page === "asap") {
    return {
      ...(META_PARAMETER.asap || {}),
      label: "Indeks Asap",
      unit: "indeks",
    };
  }

  return META_PARAMETER[page] || META_KENYAMANAN_TOTAL;
}

function formatTanggal(timestamp) {
  if (!timestamp) return "-";

  return new Date(timestamp * 1000).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatWaktu(timestamp, waktuText) {
  if (waktuText && waktuText !== "-") return waktuText;
  if (!timestamp) return "-";

  return new Date(timestamp * 1000).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAngka(nilai, digit = 2) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return "-";
  return Number(angka.toFixed(digit));
}

function formatNilaiTampil(nilai, digit = 0) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return "-";
  return angka.toFixed(digit);
}

function hitungFuzzyAman(data) {
  try {
    return hitungFuzzyRuang(data || {});
  } catch (error) {
    return null;
  }
}

function skorTotalDariRecord(record) {
  const fuzzy = hitungFuzzyAman(record);
  return angkaAman(fuzzy?.skorTotal);
}

function kelompokkanGrafikKenyamananTotal(riwayat, periode) {
  if (!riwayat?.length) return [];

  if (periode === "hari") {
    return riwayat.map((item) => ({
      label: new Date(item.timestamp * 1000).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: skorTotalDariRecord(item),
    }));
  }

  const map = new Map();

  for (const item of riwayat) {
    const d = new Date(item.timestamp * 1000);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    if (!map.has(key)) {
      map.set(key, {
        tanggal: d,
        total: 0,
        jumlah: 0,
      });
    }

    const data = map.get(key);
    data.total += skorTotalDariRecord(item);
    data.jumlah += 1;
  }

  return Array.from(map.values())
    .sort((a, b) => a.tanggal - b.tanggal)
    .map((item) => ({
      label: item.tanggal.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: item.jumlah ? item.total / item.jumlah : 0,
    }));
}

function buatRingkasanFilter(periode, filterTanggal) {
  if (periode === "hari") return `Tanggal ${filterTanggal.tanggal}`;
  if (periode === "bulan") return `Bulan ${filterTanggal.bulan}`;
  return `${filterTanggal.tanggalMulai} sampai ${filterTanggal.tanggalSelesai}`;
}

function buatNamaFile(labelBagian, periode, filterTanggal) {
  const bagian = labelBagian.toLowerCase().replace(/\s+/g, "_");
  const rentang = buatRingkasanFilter(periode, filterTanggal)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\-]/g, "");

  return `export_${bagian}_${rentang}.csv`;
}

function dataFuzzyAktif(fuzzy, page) {
  if (!fuzzy) return null;
  if (page === "kenyamananTotal") return null;

  const key = KEY_FUZZY_PARAMETER[page];
  return fuzzy?.[key] || null;
}

function buatBarisExport(riwayat, labelBagian, periode, filterTanggal) {
  return (riwayat || []).map((item, index) => {
    const fuzzy = hitungFuzzyAman(item) || {};
    return {
      No: index + 1,
      Tanggal: formatTanggal(item.timestamp),
      Waktu: formatWaktu(item.timestamp, item.waktu_text),
      Bagian: labelBagian,
      Periode: periode,
      Filter: buatRingkasanFilter(periode, filterTanggal),

      "Suhu (C)": formatAngka(item.suhu),
      "Kategori Suhu": fuzzy?.suhu?.label || "-",
      "Kenyamanan Suhu": fuzzy?.suhu?.kenyamanan || "-",
      "Skor Fuzzy Suhu": formatAngka(fuzzy?.suhu?.skor),

      "Kelembapan (%)": formatAngka(item.kelembapan),
      "Kategori Kelembapan": fuzzy?.kelembapan?.label || "-",
      "Kenyamanan Kelembapan": fuzzy?.kelembapan?.kenyamanan || "-",
      "Skor Fuzzy Kelembapan": formatAngka(fuzzy?.kelembapan?.skor),

      "Kebisingan (dB)": formatAngka(item.suara_db),
      "Kategori Kebisingan": fuzzy?.kebisingan?.label || "-",
      "Kenyamanan Kebisingan": fuzzy?.kebisingan?.kenyamanan || "-",
      "Skor Fuzzy Kebisingan": formatAngka(fuzzy?.kebisingan?.skor),

      "Indeks Asap": formatAngka(item.asap_metric),
      "Kategori Asap": fuzzy?.asap?.label || "-",
      "Kenyamanan Asap": fuzzy?.asap?.kenyamanan || "-",
      "Skor Fuzzy Asap": formatAngka(fuzzy?.asap?.skor),

      "CO (ppm)": formatAngka(item.ppm_co),
      "Kategori CO": fuzzy?.co?.label || "-",
      "Kenyamanan CO": fuzzy?.co?.kenyamanan || "-",
      "Skor Fuzzy CO": formatAngka(fuzzy?.co?.skor),

      "Kenyamanan Total": fuzzy?.kenyamananTotal || "-",
      "Skor Fuzzy Total": formatAngka(fuzzy?.skorTotal),
    };
  });
}

function KartuNilaiTerkini({ judul, nilai, unit, sub }) {
  return (
    <KartuUmum className="h-full p-5">
      <div className="text-[18px] text-slate-600">{judul}</div>
      <div className="mt-7 flex items-end gap-3">
        <div className="h-3 w-3 rounded-full bg-blue-500" />
        <div className="text-[48px] font-semibold leading-none tracking-tight">
          {nilai}
          {unit ? (
            <span className="ml-1 text-2xl text-slate-500">{unit}</span>
          ) : null}
        </div>
      </div>
      {sub ? <div className="mt-4 text-sm text-slate-500">{sub}</div> : null}
    </KartuUmum>
  );
}

export default function HalamanParameter({
  page,
  rooms,
  ruangAktif,
  setRuangAktif,
}) {
  const [periode, setPeriode] = useState("hari");
  const [filterTanggal, setFilterTanggal] = useState(buatFilterDefault());

  const ruang = rooms?.[ruangAktif] || Object.values(rooms || {})[0];
  const meta = metaHalaman(page);

  const labelBagian =
    TATA_LETAK_BAGIAN.find((item) => item.id === ruangAktif)?.label || "Bagian";

  const riwayatTerfilter = useMemo(() => {
    if (!ruang?.history?.length) return [];
    return filterRiwayatByPeriode(ruang.history, periode, filterTanggal);
  }, [ruang, periode, filterTanggal]);

  const dataGrafik = useMemo(() => {
    if (!riwayatTerfilter.length) return [];

    if (page === "kenyamananTotal") {
      return kelompokkanGrafikKenyamananTotal(riwayatTerfilter, periode);
    }

    return kelompokkanGrafik(riwayatTerfilter, meta.key, periode);
  }, [riwayatTerfilter, meta, page, periode]);

  const statistik = useMemo(() => hitungStatistik(dataGrafik), [dataGrafik]);

  const terkini = ruang?.latest || {};
  const fuzzyTerkini = ruang?.fuzzy || hitungFuzzyAman(terkini) || {};
  const fuzzyAktif = dataFuzzyAktif(fuzzyTerkini, page);

  const status =
    page === "kenyamananTotal"
      ? fuzzyTerkini?.kenyamananTotal || "-"
      : fuzzyAktif?.kenyamanan || ruang?.kartuParameter?.[page]?.status || "-";

  const detail =
    page === "kenyamananTotal"
      ? `Skor fuzzy total: ${formatNilaiTampil(fuzzyTerkini?.skorTotal, 2)}`
      : `${fuzzyAktif?.label || "-"} • Skor fuzzy: ${formatNilaiTampil(
          fuzzyAktif?.skor,
          2,
        )}`;

  const nilaiTerkini =
    page === "kenyamananTotal"
      ? formatNilaiTampil(fuzzyTerkini?.skorTotal, 2)
      : formatNilaiTampil(terkini?.[meta.key], 0);

  const unitTerkini = page === "kenyamananTotal" ? "" : meta?.unit || "";

  function handleExportExcel() {
    const rows = buatBarisExport(
      riwayatTerfilter,
      labelBagian,
      periode,
      filterTanggal,
    );

    downloadCsvExcel(rows, buatNamaFile(labelBagian, periode, filterTanggal));
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {meta?.label || "Parameter"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Data grafik dan export mengikuti bagian, periode, serta tanggal yang
            sedang dipilih. Export selalu berisi seluruh parameter dan hasil
            fuzzy lengkap.
          </p>
        </div>
      </div>

      <KartuUmum className="mb-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">
              Bagian yang ditampilkan
            </div>
            <div className="text-xl font-semibold text-slate-800">
              {labelBagian}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {riwayatTerfilter.length} data sesuai filter
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Bagian</p>
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

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!riwayatTerfilter.length}
              className="flex h-[42px] items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>
      </KartuUmum>

      <KartuUmum className="p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[18px] font-semibold text-slate-700">
              Detail {meta?.label} - {labelBagian}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <LencanaStatus status={status} />
              <span className="text-sm text-slate-500">{detail}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs text-slate-600">
            Export selalu berisi seluruh data sensor, kategori input fuzzy,
            output kenyamanan, dan skor fuzzy lengkap untuk semua parameter.
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

      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-5">
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
        <KartuNilaiTerkini
          judul={
            page === "kenyamananTotal" ? "Skor Total Terkini" : "Nilai Terkini"
          }
          nilai={nilaiTerkini}
          unit={unitTerkini}
          sub={page === "kenyamananTotal" ? status : fuzzyAktif?.label || "-"}
        />
        <KartuNilaiTerkini
          judul={
            page === "kenyamananTotal" ? "Status Terkini" : "Skor Fuzzy Terkini"
          }
          nilai={
            page === "kenyamananTotal"
              ? status
              : formatNilaiTampil(fuzzyAktif?.skor, 2)
          }
          unit=""
          sub={
            page === "kenyamananTotal" ? detail : fuzzyAktif?.kenyamanan || "-"
          }
        />
      </div>
    </>
  );
}
