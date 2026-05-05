import {
  CalendarDays,
  Clock3,
  Cloud,
  Droplets,
  Thermometer,
  Users,
  Volume2,
  Wind,
} from "lucide-react";

import KartuUmum from "../components/KartuUmum";
import LencanaStatus from "../components/LencanaStatus";
import { TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";

function angkaAman(nilai, digit = 1) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return "-";
  return angka.toFixed(digit);
}

function getKelasStatus(status) {
  if (status === "Nyaman" || status === "Normal" || status === "Baik") {
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "bg-emerald-100 text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
    };
  }

  if (status === "Kurang Nyaman") {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "bg-amber-100 text-amber-700",
      badge: "bg-amber-100 text-amber-700",
    };
  }

  if (status === "Belum Ada Data" || status === "Offline" || status === "-") {
    return {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-600",
      icon: "bg-slate-100 text-slate-500",
      badge: "bg-slate-100 text-slate-600",
    };
  }

  return {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "bg-red-100 text-red-700",
    badge: "bg-red-100 text-red-700",
  };
}

function formatTanggal(now) {
  const tanggal = now instanceof Date ? now : new Date();
  return tanggal.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(now) {
  const tanggal = now instanceof Date ? now : new Date();
  return tanggal.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function labelInput(parameter) {
  return parameter?.label || "-";
}

function kenyamanan(parameter) {
  return parameter?.kenyamanan || "-";
}

function KartuJam({ now }) {
  return (
    <KartuUmum className="flex h-full flex-col justify-between p-5">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="text-sm">Tanggal dan Waktu</div>
      </div>

      <div className="mt-8">
        <div className="text-2xl font-semibold text-slate-900">
          {formatJam(now)}
        </div>
        <div className="mt-2 text-base text-slate-500">
          {formatTanggal(now)}
        </div>
      </div>
    </KartuUmum>
  );
}

function KartuKenyamanan({ statusPerpustakaan }) {
  const kelas = getKelasStatus(statusPerpustakaan);

  return (
    <KartuUmum className={`h-full border p-5 ${kelas.bg} ${kelas.border}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-2xl p-3 ${kelas.icon}`}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-slate-500">
              Kenyamanan Perpustakaan
            </div>
            <div className={`mt-2 text-2xl font-semibold ${kelas.text}`}>
              {statusPerpustakaan}
            </div>
          </div>
        </div>

        <LencanaStatus status={statusPerpustakaan} />
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-600">
        Status ini diambil dari kenyamanan total seluruh bagian yang sedang
        online.
      </p>
    </KartuUmum>
  );
}

function KartuParameter({
  ikon: Ikon,
  judul,
  nilai,
  unit,
  labelKategori,
  outputKenyamanan,
  rentang,
}) {
  const kelas = getKelasStatus(outputKenyamanan);
  const tidakAdaData = nilai === "-";

  return (
    <div className={`rounded-3xl border p-5 ${kelas.bg} ${kelas.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{judul}</div>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-3xl font-semibold text-slate-900">
              {nilai}
            </span>
            {!tidakAdaData && unit ? (
              <span className="pb-1 text-sm text-slate-500">{unit}</span>
            ) : null}
          </div>
        </div>

        <div className={`rounded-2xl p-3 ${kelas.icon}`}>
          <Ikon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${kelas.badge}`}
        >
          {labelKategori}
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-600">
          Output: {outputKenyamanan}
        </span>
      </div>

      <div className="mt-4 text-xs text-slate-500">Rentang aman: {rentang}</div>
    </div>
  );
}

function PanelStatusArea({ rooms, ruangAktif, setRuangAktif }) {
  return (
    <KartuUmum className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Peta Bagian Perpustakaan
          </h2>
          <p className="text-sm text-slate-500">
            Pilih bagian untuk melihat data sensor dan hasil fuzzy terbaru.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {TATA_LETAK_BAGIAN.map((bagian) => {
            const data = rooms?.[bagian.id];
            const status = data?.online
              ? data?.fuzzy?.kenyamananTotal || "-"
              : "Offline";
            const kelas = getKelasStatus(status);
            const aktif = ruangAktif === bagian.id;

            return (
              <button
                key={bagian.id}
                type="button"
                onClick={() => setRuangAktif(bagian.id)}
                className={`rounded-2xl border p-4 text-left transition ${kelas.bg} ${kelas.border} ${
                  aktif
                    ? "ring-2 ring-blue-500"
                    : "hover:-translate-y-0.5 hover:shadow-sm"
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  {bagian.label}
                </div>
                <div className={`mt-2 text-xs font-medium ${kelas.text}`}>
                  {status}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </KartuUmum>
  );
}

export default function HalamanDashboard({
  rooms,
  ruangAktif,
  setRuangAktif,
  now,
  statusPerpustakaan,
}) {
  const ruang = rooms?.[ruangAktif] || {};
  const latest = ruang?.latest || {};
  const fuzzy = ruang?.fuzzy || {};

  const bagianAktif = TATA_LETAK_BAGIAN.find((item) => item.id === ruangAktif);

  const parameterCards = [
    {
      judul: "Suhu",
      ikon: Thermometer,
      nilai: angkaAman(latest.suhu),
      unit: "°C",
      labelKategori: labelInput(fuzzy?.suhu),
      outputKenyamanan: kenyamanan(fuzzy?.suhu),
      rentang: "23–26 °C",
    },
    {
      judul: "Kelembapan",
      ikon: Droplets,
      nilai: angkaAman(latest.kelembapan),
      unit: "%",
      labelKategori: labelInput(fuzzy?.kelembapan),
      outputKenyamanan: kenyamanan(fuzzy?.kelembapan),
      rentang: "40–60 %",
    },
    {
      judul: "Kebisingan",
      ikon: Volume2,
      nilai: angkaAman(latest.suara_db),
      unit: "dB",
      labelKategori: labelInput(fuzzy?.kebisingan),
      outputKenyamanan: kenyamanan(fuzzy?.kebisingan),
      rentang: "< 55 dB",
    },
    {
      judul: "Indeks Asap",
      ikon: Cloud,
      nilai: angkaAman(latest.asap_metric),
      unit: "indeks",
      labelKategori: labelInput(fuzzy?.asap),
      outputKenyamanan: kenyamanan(fuzzy?.asap),
      rentang: "< 10 indeks",
    },
    {
      judul: "Karbon Monoksida",
      ikon: Wind,
      nilai: angkaAman(latest.ppm_co),
      unit: "ppm",
      labelKategori: labelInput(fuzzy?.co),
      outputKenyamanan: kenyamanan(fuzzy?.co),
      rentang: "< 9 ppm",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <KartuKenyamanan statusPerpustakaan={statusPerpustakaan} />
        <KartuJam now={now} />
      </div>

      <PanelStatusArea
        rooms={rooms}
        ruangAktif={ruangAktif}
        setRuangAktif={setRuangAktif}
      />

      <KartuUmum className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Data Sensor {bagianAktif?.label || ruangAktif}
            </h2>
            <p className="text-sm text-slate-500">
              Teks pada kartu menunjukkan kategori input fuzzy. Warna kartu
              menunjukkan output kenyamanan fuzzy.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            <Clock3 className="h-4 w-4" />
            {latest?.waktu_text || "Belum ada waktu data"}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {parameterCards.map((item) => (
            <KartuParameter key={item.judul} {...item} />
          ))}
        </div>
      </KartuUmum>
    </div>
  );
}
