import { useEffect, useMemo, useState } from "react";
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
import PetaPerpustakaan from "../components/PetaPerpustakaan";
import { TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";

function angkaAman(nilai, digit = 1) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return "-";
  return angka.toFixed(digit);
}

function normalisasiStatus(status) {
  if (status === "Belum Ada Data") return "Belum ada data";
  return status || "Belum ada data";
}

function getToneStatus(status) {
  const statusNormal = normalisasiStatus(status);

  if (statusNormal === "Nyaman") return "baik";
  if (statusNormal === "Kurang Nyaman") return "peringatan";
  if (statusNormal === "Tidak Nyaman") return "bahaya";
  if (statusNormal === "Offline") return "offline";

  return "kosong";
}

function getKelasStatus(status) {
  const tone = getToneStatus(status);

  if (tone === "baik") {
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "bg-emerald-100 text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (tone === "peringatan") {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "bg-amber-100 text-amber-700",
      badge: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    };
  }

  if (tone === "bahaya") {
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "bg-red-100 text-red-700",
      badge: "bg-red-100 text-red-700",
      dot: "bg-red-500",
    };
  }

  return {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-500",
    icon: "bg-slate-100 text-slate-500",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
}

function getStatusBagian(state) {
  if (!state?.latest) return "Offline";
  if (state?.online === false) return "Offline";
  if (!state?.fuzzy) return "Belum ada data";

  return state.fuzzy.kenyamananTotal || "Belum ada data";
}

function deskripsiStatus(status) {
  const statusNormal = normalisasiStatus(status);

  if (statusNormal === "Nyaman") return "Kondisi perpustakaan baik";
  if (statusNormal === "Kurang Nyaman") return "Kondisi perlu diperhatikan";
  if (statusNormal === "Tidak Nyaman") return "Kondisi perlu penanganan";
  if (statusNormal === "Offline") return "Data sensor belum diterima";

  return "Data kenyamanan belum tersedia";
}

function formatTanggalPendek(tanggal) {
  return tanggal.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatJam(tanggal) {
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

function KartuKenyamanan({ statusPerpustakaan }) {
  const status = normalisasiStatus(statusPerpustakaan);
  const kelas = getKelasStatus(status);

  return (
    <KartuUmum className="h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[16px] font-semibold leading-7 text-slate-900">
          Kenyamanan
          <br />
          Keseluruhan
          <br />
          Perpustakaan
        </div>

        <div className="rounded-[16px] bg-blue-500 p-3 text-white shadow-md shadow-blue-200">
          <Users className="h-7 w-7" />
        </div>
      </div>

      <div className={`mt-7 text-2xl font-semibold ${kelas.text}`}>
        {status}
      </div>

      <div className="mt-3 text-sm text-slate-500">
        {deskripsiStatus(status)}
      </div>
    </KartuUmum>
  );
}

function KartuWaktu() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <KartuUmum className="h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xl font-semibold text-slate-900">Waktu</div>

        <div className="rounded-[16px] bg-blue-500 p-3 text-white shadow-md shadow-blue-200">
          <Clock3 className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-slate-500" />
          <div className="text-2xl font-semibold text-slate-900">
            {formatTanggalPendek(now)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock3 className="h-6 w-6 text-slate-500" />
          <div className="text-2xl font-semibold text-slate-900">
            {formatJam(now)}
          </div>
        </div>
      </div>
    </KartuUmum>
  );
}

function DaftarBagianRingkas({ rooms, bagianAktif, setBagianAktif }) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {TATA_LETAK_BAGIAN.map((bagian) => {
          const status = getStatusBagian(rooms?.[bagian.id]);
          const aktif = bagian.id === bagianAktif;
          const kelas = getKelasStatus(status);

          return (
            <button
              key={bagian.id}
              type="button"
              onClick={() => setBagianAktif(bagian.id)}
              className={`flex items-start gap-3 rounded-[18px] p-2 text-left transition hover:bg-white hover:shadow-sm ${
                aktif ? "bg-white shadow-sm ring-2 ring-blue-100" : ""
              }`}
            >
              <div className={`mt-2 h-2.5 w-2.5 rounded-full ${kelas.dot}`} />

              <div>
                <div className="text-sm font-semibold text-slate-700">
                  {bagian.label}
                </div>
                <div className={`mt-1 text-xs font-semibold ${kelas.text}`}>
                  {normalisasiStatus(status)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PanelKondisiPerpustakaan({ rooms, bagianAktif, setBagianAktif }) {
  const daftarBagian = useMemo(() => TATA_LETAK_BAGIAN, []);

  return (
    <KartuUmum className="p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Kondisi Perpustakaan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pilih bagian untuk melihat kondisi area perpustakaan.
          </p>
        </div>

        <div className="inline-flex rounded-[18px] bg-slate-100 p-1">
          <button
            type="button"
            className="rounded-[14px] bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-blue-100"
          >
            Lantai 2
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.55fr_1fr]">
        <DaftarBagianRingkas
          rooms={rooms}
          bagianAktif={bagianAktif}
          setBagianAktif={setBagianAktif}
        />

        <PetaPerpustakaan
          daftarBagian={daftarBagian}
          rooms={rooms}
          bagianAktif={bagianAktif}
          setBagianAktif={setBagianAktif}
        />
      </div>
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
  onClick,
}) {
  const kelas = getKelasStatus(outputKenyamanan);
  const tidakAdaData = nilai === "-";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${kelas.bg} ${kelas.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base text-slate-500">{judul}</div>

          <div className="mt-4 flex items-end gap-1">
            <span className="text-4xl font-semibold text-slate-950">
              {nilai}
            </span>

            {!tidakAdaData && unit ? (
              <span className="pb-1 text-sm text-slate-500">{unit}</span>
            ) : null}
          </div>
        </div>

        <div className={`rounded-[20px] p-4 ${kelas.icon}`}>
          <Ikon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-7">
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${kelas.badge}`}
        >
          {labelKategori}
        </span>
      </div>
    </button>
  );
}

export default function HalamanDashboard({
  rooms,
  ruangAktif,
  setRuangAktif,
  setPage,
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
      onClick: () => setPage?.("suhu"),
    },
    {
      judul: "Kelembapan",
      ikon: Droplets,
      nilai: angkaAman(latest.kelembapan),
      unit: "%",
      labelKategori: labelInput(fuzzy?.kelembapan),
      outputKenyamanan: kenyamanan(fuzzy?.kelembapan),
      rentang: "40–60 %",
      onClick: () => setPage?.("kelembapan"),
    },
    {
      judul: "Kebisingan",
      ikon: Volume2,
      nilai: angkaAman(latest.suara_db),
      unit: "dB",
      labelKategori: labelInput(fuzzy?.kebisingan),
      outputKenyamanan: kenyamanan(fuzzy?.kebisingan),
      rentang: "< 55 dB",
      onClick: () => setPage?.("kebisingan"),
    },
    {
      judul: "Indeks Asap",
      ikon: Cloud,
      nilai: angkaAman(latest.asap_metric),
      unit: "indeks",
      labelKategori: labelInput(fuzzy?.asap),
      outputKenyamanan: kenyamanan(fuzzy?.asap),
      rentang: "< 10 indeks",
      onClick: () => setPage?.("asap"),
    },
    {
      judul: "Karbon Monoksida",
      ikon: Wind,
      nilai: angkaAman(latest.ppm_co),
      unit: "ppm",
      labelKategori: labelInput(fuzzy?.co),
      outputKenyamanan: kenyamanan(fuzzy?.co),
      rentang: "< 9 ppm",
      onClick: () => setPage?.("kualitasUdara"),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
        <div className="grid gap-5">
          <KartuKenyamanan statusPerpustakaan={statusPerpustakaan} />
          <KartuWaktu />
        </div>

        <PanelKondisiPerpustakaan
          rooms={rooms}
          bagianAktif={ruangAktif}
          setBagianAktif={setRuangAktif}
        />
      </div>

      <KartuUmum className="p-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Data Sensor{" "}
            {bagianAktif?.labelLengkap || bagianAktif?.label || ruangAktif}
          </h2>

          <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-500">
            Teks pada kartu menunjukkan kategori input fuzzy. Warna kartu
            menunjukkan hasil kenyamanan fuzzy. Klik kartu parameter untuk
            membuka halaman parameternya.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {parameterCards.map((item) => (
            <KartuParameter key={item.judul} {...item} />
          ))}
        </div>
      </KartuUmum>
    </div>
  );
}
