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

import PanelStatusArea from "../components/PanelStatusArea";
import { formatTanggalJam } from "../utils/helper";
import { KONFIG_APP, TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";

function getToneStatus(status) {
  if (!status || status === "-") return "kosong";
  if (status === "Nyaman" || status === "Normal" || status === "Baik") {
    return "baik";
  }
  if (status === "Kurang Nyaman") return "peringatan";
  return "bahaya";
}

function getKelasStatus(status) {
  const tone = getToneStatus(status);

  if (tone === "baik") {
    return {
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    };
  }

  if (tone === "peringatan") {
    return {
      text: "text-amber-600",
      dot: "bg-amber-500",
    };
  }

  if (tone === "bahaya") {
    return {
      text: "text-red-600",
      dot: "bg-red-500",
    };
  }

  return {
    text: "text-slate-400",
    dot: "bg-slate-300",
  };
}

function ambilLantai(bagian) {
  if (bagian?.lantai) return Number(bagian.lantai);

  const dariId = String(bagian?.id || "").match(/l(\d+)/i);
  if (dariId) return Number(dariId[1]);

  return 1;
}

function ambilInfoBagian(id) {
  const bagian = TATA_LETAK_RUANG.find((item) => item.id === id);

  if (!bagian) {
    return {
      lantai: 1,
      label: "Bagian 1",
    };
  }

  return {
    lantai: ambilLantai(bagian),
    label: bagian.label || "Bagian 1",
  };
}

function adaDataLatest(latest) {
  return latest && Object.keys(latest).length > 0;
}

function formatNilai(latest, key, digit = 0) {
  if (!adaDataLatest(latest)) return "-";

  const nilai = Number(latest?.[key]);
  if (!Number.isFinite(nilai)) return "-";

  return nilai.toFixed(digit);
}

function formatStatus(parameter) {
  return parameter?.kenyamanan || "-";
}

function KartuInfo({
  title,
  icon,
  children,
  titleClassName = "whitespace-pre-line text-[17px] font-medium leading-relaxed text-slate-800",
}) {
  const Icon = icon;

  return (
    <div className="rounded-[26px] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
      <div className="mb-7 flex items-start justify-between gap-4">
        <p className={titleClassName}>{title}</p>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-200">
          <Icon className="h-7 w-7" />
        </div>
      </div>

      {children}
    </div>
  );
}

function KartuJam() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(
      () => setNow(new Date()),
      KONFIG_APP.refreshJamMs || 1000,
    );

    return () => clearInterval(timer);
  }, []);

  const { tanggal, jam } = formatTanggalJam(now);

  return (
    <KartuInfo
      title="Waktu"
      icon={Clock3}
      titleClassName="whitespace-pre-line text-[22px] font-semibold leading-relaxed text-slate-900"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <CalendarDays className="h-6 w-6 text-slate-500" />
          <p className="text-[26px] font-semibold text-slate-950">{tanggal}</p>
        </div>

        <div className="flex items-center gap-4">
          <Clock3 className="h-6 w-6 text-slate-500" />
          <p className="text-[26px] font-semibold text-slate-950">{jam}</p>
        </div>
      </div>
    </KartuInfo>
  );
}

function KartuKenyamanan({ status }) {
  const kelas = getKelasStatus(status);

  const deskripsi =
    status === "Nyaman"
      ? "Kondisi perpustakaan baik"
      : status === "Kurang Nyaman"
        ? "Kondisi perlu diperhatikan"
        : "Kondisi perlu penanganan";

  return (
    <KartuInfo title={"Kenyamanan\nKeseluruhan\nPerpustakaan"} icon={Users}>
      <p
        className={`text-[24px] leading-tight ${kelas.text} ${
          status === "Kurang Nyaman" ? "font-bold" : "font-semibold"
        }`}
      >
        {status || "Belum ada data"}
      </p>

      <p className="mt-3 text-sm font-normal text-slate-500">{deskripsi}</p>
    </KartuInfo>
  );
}

function KartuParameter({ ikon: Ikon, judul, nilai, unit, status, rentang }) {
  const kelas = getKelasStatus(status);
  const tidakAdaData = nilai === "-";

  return (
    <div className="h-full rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-100">
          <Ikon className="h-6 w-6" />
        </div>

        <p className="text-[17px] font-medium leading-snug text-slate-700">
          {judul}
        </p>
      </div>

      <div className="mt-7 text-[32px] font-semibold leading-none text-slate-950">
        {nilai}
        {!tidakAdaData && (
          <span className="ml-2 text-[22px] font-medium">{unit}</span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        {!tidakAdaData && (
          <span className={`h-2.5 w-2.5 rounded-full ${kelas.dot}`} />
        )}

        <p
          className={`text-sm font-medium ${
            tidakAdaData ? "text-slate-400" : kelas.text
          }`}
        >
          {tidakAdaData ? "Belum ada data" : status}
        </p>
      </div>

      <p className="mt-4 text-sm font-normal text-slate-400">{rentang}</p>
    </div>
  );
}

export default function HalamanDashboard({
  rooms,
  kenyamananPerpustakaan,
  ruangAktif,
  setRuangAktif,
  setPage,
}) {
  const ruangUtama = rooms?.[ruangAktif] || {};
  const latest = ruangUtama?.latest || {};
  const fuzzy = ruangUtama?.fuzzy || {};

  const bagianAktif = useMemo(() => ambilInfoBagian(ruangAktif), [ruangAktif]);

  const parameterCards = [
    {
      key: "suhu",
      judul: "Suhu",
      nilai: formatNilai(latest, "suhu", 1),
      unit: "°C",
      status: formatStatus(fuzzy?.suhu),
      rentang: "20 - 28 °C",
      ikon: Thermometer,
      page: "suhu",
    },
    {
      key: "kelembapan",
      judul: "Kelembapan",
      nilai: formatNilai(latest, "kelembapan", 0),
      unit: "%",
      status: formatStatus(fuzzy?.kelembapan),
      rentang: "40 - 60%",
      ikon: Droplets,
      page: "kelembapan",
    },
    {
      key: "kebisingan",
      judul: "Kebisingan",
      nilai: formatNilai(latest, "suara_db", 0),
      unit: "dB",
      status: formatStatus(fuzzy?.kebisingan),
      rentang: "< 45 dB",
      ikon: Volume2,
      page: "kebisingan",
    },
    {
      key: "asap",
      judul: "Asap",
      nilai: formatNilai(latest, "asap_metric", 0),
      unit: "ppm",
      status: formatStatus(fuzzy?.asap),
      rentang: "< 10 ppm",
      ikon: Cloud,
      page: "asap",
    },
    {
      key: "kualitasUdara",
      judul: "Kualitas Udara",
      nilai: formatNilai(latest, "ppm_co", 0),
      unit: "ppm",
      status: formatStatus(fuzzy?.co),
      rentang: "< 6 ppm",
      ikon: Wind,
      page: "kualitasUdara",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[250px_minmax(0,1fr)] gap-5">
        <aside className="space-y-5">
          <KartuKenyamanan status={kenyamananPerpustakaan} />
          <KartuJam />
        </aside>

        <PanelStatusArea
          rooms={rooms}
          ruangAktif={ruangAktif}
          setRuangAktif={setRuangAktif}
        />
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <p className="text-base font-normal text-slate-500">
          Nilai parameter bagian terpilih
        </p>

        <h2 className="mt-1 text-[26px] font-semibold tracking-tight text-slate-950">
          Lantai {bagianAktif.lantai} - {bagianAktif.label}
        </h2>

        <div className="mt-6 grid grid-cols-5 gap-4">
          {parameterCards.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPage(item.page)}
              className="text-left"
            >
              <KartuParameter
                ikon={item.ikon}
                judul={item.judul}
                nilai={item.nilai}
                unit={item.unit}
                status={item.status}
                rentang={item.rentang}
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
