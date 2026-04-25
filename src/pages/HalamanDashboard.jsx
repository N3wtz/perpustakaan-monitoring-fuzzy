import { useEffect, useState } from "react";
import {
  ChevronDown,
  Clock3,
  Droplets,
  Thermometer,
  Users,
  Volume2,
  Cloud,
  Wind,
} from "lucide-react";
import KartuUmum from "../components/KartuUmum";
import KartuMetrik from "../components/KartuMetrik";
import PanelStatusArea from "../components/PanelStatusArea";
import PemilihRuang from "../components/PemilihRuang";
import {
  formatTanggalJam,
  ambilToneStatus,
  kelasToneStatus,
} from "../utils/helper";
import { KONFIG_APP, TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";

function HeaderUser() {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>

      <div className="flex items-center gap-3 rounded-full bg-transparent px-4 py-2 opacity-0 pointer-events-none">
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

function KartuJam() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(
      () => setNow(new Date()),
      KONFIG_APP.refreshJamMs,
    );
    return () => clearInterval(timer);
  }, []);

  const { tanggal, jam } = formatTanggalJam(now);

  return (
    <KartuUmum className="h-full p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[18px] text-slate-600">Waktu</p>
          <div className="mt-4 text-[30px] font-semibold tracking-tight">
            {tanggal}
          </div>
          <div className="mt-1 text-[32px] font-semibold tracking-tight">
            {jam}
          </div>
        </div>

        <div className="rounded-full bg-blue-500 p-3 text-white">
          <Clock3 className="h-6 w-6" />
        </div>
      </div>
    </KartuUmum>
  );
}

function KartuKenyamanan({ status }) {
  const tone = ambilToneStatus(status);
  const kelas = kelasToneStatus(tone);

  return (
    <KartuUmum className="h-full p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="max-w-[160px] text-[15px] leading-tight text-slate-600">
            Kenyamanan Keseluruhan Perpustakaan
          </p>
          <div className={`mt-8 text-[22px] font-bold ${kelas.text}`}>
            {status}
          </div>
        </div>

        <div className="rounded-full bg-blue-500 p-3 text-white">
          <Users className="h-6 w-6" />
        </div>
      </div>
    </KartuUmum>
  );
}

export default function HalamanDashboard({
  rooms,
  kenyamananPerpustakaan,
  ruangAktif,
  setRuangAktif,
  setPage,
}) {
  const ruangUtama = rooms?.[ruangAktif] || Object.values(rooms)[0];
  const kartu = ruangUtama?.kartuParameter || {};
  const labelRuang =
    TATA_LETAK_RUANG.find((item) => item.id === ruangAktif)?.label || "Area 1";

  return (
    <>
      <HeaderUser />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">Ruangan yang ditampilkan</div>
          <div className="text-xl font-semibold text-slate-800">
            {labelRuang}
          </div>
        </div>

        <PemilihRuang value={ruangAktif} onChange={setRuangAktif} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div
          onClick={() => setPage("suhu")}
          className="h-full cursor-pointer transition hover:scale-[1.02]"
        >
          <KartuMetrik
            judul="Suhu"
            nilai={kartu?.suhu?.tampil || "0°C"}
            status={kartu?.suhu?.status || "-"}
            ikon={Thermometer}
          />
        </div>

        <div
          onClick={() => setPage("kelembapan")}
          className="h-full cursor-pointer transition hover:scale-[1.02]"
        >
          <KartuMetrik
            judul="Kelembapan"
            nilai={kartu?.kelembapan?.tampil || "0%"}
            status={kartu?.kelembapan?.status || "-"}
            ikon={Droplets}
          />
        </div>

        <div
          onClick={() => setPage("kebisingan")}
          className="h-full cursor-pointer transition hover:scale-[1.02]"
        >
          <KartuMetrik
            judul="Kebisingan"
            nilai={kartu?.kebisingan?.tampil || "0 dB"}
            status={kartu?.kebisingan?.status || "-"}
            ikon={Volume2}
          />
        </div>

        <div
          onClick={() => setPage("asap")}
          className="h-full cursor-pointer transition hover:scale-[1.02]"
        >
          <KartuMetrik
            judul="Asap"
            nilai={kartu?.asap?.tampil || "0 ppm"}
            status={kartu?.asap?.status || "-"}
            ikon={Cloud}
          />
        </div>

        <div
          onClick={() => setPage("kualitasUdara")}
          className="h-full cursor-pointer transition hover:scale-[1.02]"
        >
          <KartuMetrik
            judul="Kualitas Udara"
            nilai={kartu?.kualitasUdara?.tampil || "0 ppm"}
            status={kartu?.kualitasUdara?.status || "-"}
            ikon={Wind}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[210px_1fr]">
        <div className="grid grid-cols-1 gap-4">
          <KartuKenyamanan status={kenyamananPerpustakaan} />
          <KartuJam />
        </div>

        <PanelStatusArea
          rooms={rooms}
          ruangAktif={ruangAktif}
          setRuangAktif={setRuangAktif}
        />
      </div>
    </>
  );
}
