import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
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
import { TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";
import { hitungFuzzyRuang } from "../fuzzy/mesinFuzzy";
import {
  angkaAman,
  buatFilterDefault,
  filterRiwayatByPeriode,
} from "../utils/helper";

const PARAMETER_GABUNGAN = [
  {
    key: "suhu",
    field: "suhu",
    label: "Suhu",
    unit: "°C",
    warna: "#ef4444",
  },
  {
    key: "kelembapan",
    field: "kelembapan",
    label: "Kelembapan",
    unit: "%",
    warna: "#3b82f6",
  },
  {
    key: "kebisingan",
    field: "suara_db",
    label: "Kebisingan",
    unit: "dB",
    warna: "#f59e0b",
  },
  {
    key: "skorTotal",
    field: "skorTotal",
    label: "Kenyamanan Total",
    unit: "skor",
    warna: "#8b5cf6",
  },
];

const CLASS_INPUT_TANGGAL =
  "h-[42px] w-[170px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400";

function formatWaktu(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTanggal(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
  });
}

function hitungFuzzyAman(data) {
  try {
    return hitungFuzzyRuang(data || {});
  } catch (error) {
    return null;
  }
}

function ambilNilaiParameter(item, parameter) {
  if (parameter.key === "skorTotal") {
    const fuzzy = hitungFuzzyAman(item);
    return angkaAman(fuzzy?.skorTotal);
  }

  return angkaAman(item[parameter.field]);
}

function buatDataGrafikGabungan(riwayat, periode) {
  if (!riwayat?.length) return [];

  if (periode === "hari") {
    return riwayat.map((item) => {
      const hasil = {
        label: formatWaktu(item.timestamp),
      };

      PARAMETER_GABUNGAN.forEach((parameter) => {
        hasil[parameter.key] = ambilNilaiParameter(item, parameter);
      });

      return hasil;
    });
  }

  const map = new Map();

  riwayat.forEach((item) => {
    const d = new Date(item.timestamp * 1000);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    if (!map.has(key)) {
      const totalAwal = {};

      PARAMETER_GABUNGAN.forEach((parameter) => {
        totalAwal[parameter.key] = 0;
      });

      map.set(key, {
        timestamp: item.timestamp,
        tanggal: d,
        total: totalAwal,
        jumlah: 0,
      });
    }

    const data = map.get(key);

    PARAMETER_GABUNGAN.forEach((parameter) => {
      data.total[parameter.key] += ambilNilaiParameter(item, parameter);
    });

    data.jumlah += 1;
  });

  return Array.from(map.values())
    .sort((a, b) => a.tanggal - b.tanggal)
    .map((item) => {
      const hasil = {
        label: formatTanggal(item.timestamp),
      };

      PARAMETER_GABUNGAN.forEach((parameter) => {
        hasil[parameter.key] = item.jumlah
          ? item.total[parameter.key] / item.jumlah
          : 0;
      });

      return hasil;
    });
}

function TooltipGabungan({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="mb-3 text-sm font-semibold text-slate-800">{label}</p>

      <div className="space-y-2">
        {payload.map((item) => {
          const parameter = PARAMETER_GABUNGAN.find(
            (data) => data.key === item.dataKey,
          );

          return (
            <div
              key={item.dataKey}
              className="flex items-center justify-between gap-5 text-sm"
            >
              <div className="flex items-center gap-2 text-slate-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{parameter?.label || item.name}</span>
              </div>

              <div className="font-semibold text-slate-800">
                {Number(item.value || 0).toFixed(2)} {parameter?.unit || ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HalamanGrafikGabungan({
  rooms,
  ruangAktif,
  setRuangAktif,
}) {
  const [periode, setPeriode] = useState("hari");
  const [filterTanggal, setFilterTanggal] = useState(buatFilterDefault());

  const ruang = rooms?.[ruangAktif] || Object.values(rooms || {})[0] || {};

  const labelBagian =
    TATA_LETAK_BAGIAN.find((item) => item.id === ruangAktif)?.label || "Bagian";

  const riwayatTerfilter = useMemo(() => {
    if (!ruang?.history?.length) return [];

    return filterRiwayatByPeriode(ruang.history, periode, filterTanggal);
  }, [ruang, periode, filterTanggal]);

  const dataGrafik = useMemo(() => {
    return buatDataGrafikGabungan(riwayatTerfilter, periode);
  }, [riwayatTerfilter, periode]);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-4xl font-bold tracking-tight">
          Grafik Gabungan Parameter
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Menampilkan suhu, kelembapan, kebisingan, dan skor kenyamanan total
          dalam satu grafik.
        </p>
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
                  className={CLASS_INPUT_TANGGAL}
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
                  className={CLASS_INPUT_TANGGAL}
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
                    className={CLASS_INPUT_TANGGAL}
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
                    className={CLASS_INPUT_TANGGAL}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </KartuUmum>

      <KartuUmum className="p-6">
        {dataGrafik.length > 0 ? (
          <div className="h-[540px]">
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

                <Tooltip content={<TooltipGabungan />} />
                <Legend verticalAlign="top" height={40} />

                {PARAMETER_GABUNGAN.map((parameter) => (
                  <Line
                    key={parameter.key}
                    type="monotone"
                    dataKey={parameter.key}
                    name={`${parameter.label} (${parameter.unit})`}
                    stroke={parameter.warna}
                    strokeWidth={parameter.key === "skorTotal" ? 4 : 3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[540px] items-center justify-center text-sm text-slate-500">
            Tidak ada data pada bagian dan periode yang dipilih.
          </div>
        )}
      </KartuUmum>
    </>
  );
}
