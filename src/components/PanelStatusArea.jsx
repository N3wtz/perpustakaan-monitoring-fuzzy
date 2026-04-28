import { useEffect, useMemo, useState } from "react";
import PetaPerpustakaan from "./PetaPerpustakaan";
import { TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";

function ambilLantai(bagian) {
  if (bagian?.lantai) return Number(bagian.lantai);

  const dariId = String(bagian?.id || "").match(/l(\d+)/i);
  if (dariId) return Number(dariId[1]);

  return 1;
}

function ambilNomorBagian(bagian, index) {
  if (bagian?.nomor) return Number(bagian.nomor);

  const dariLabel = String(bagian?.label || "").match(/bagian\s*(\d+)/i);
  if (dariLabel) return Number(dariLabel[1]);

  const dariId = String(bagian?.id || "").match(/_(\d+)$/);
  if (dariId) return Number(dariId[1]);

  return index + 1;
}

function normalisasiBagian() {
  return TATA_LETAK_RUANG.map((bagian, index) => {
    const lantai = ambilLantai(bagian);
    const nomor = ambilNomorBagian(bagian, index);

    return {
      ...bagian,
      lantai,
      nomor,
      label: bagian.label || `Bagian ${nomor}`,
    };
  });
}

function getStatusBagian(state) {
  if (!state?.latest || !state?.fuzzy) return "Belum ada data";
  return state.fuzzy.kenyamananTotal || "Belum ada data";
}

function getDeskripsiStatus(state) {
  if (!state?.latest || !state?.fuzzy) return "Belum ada data";

  const fuzzy = state.fuzzy;

  if (fuzzy?.kebisingan?.kenyamanan === "Tidak Nyaman") {
    return "Kebisingan Tinggi";
  }

  if (fuzzy?.asap?.kenyamanan === "Tidak Nyaman") {
    return "Asap Terdeteksi";
  }

  if (fuzzy?.co?.kenyamanan === "Tidak Nyaman") {
    return "CO Tinggi";
  }

  return fuzzy.kenyamananTotal || "Belum ada data";
}

function getKelasStatus(status) {
  if (!status || status === "Belum ada data") {
    return {
      dot: "bg-slate-400",
      text: "text-slate-400",
      item: "hover:bg-slate-100",
    };
  }

  if (status === "Nyaman") {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-600",
      item: "hover:bg-emerald-50",
    };
  }

  if (status === "Kurang Nyaman") {
    return {
      dot: "bg-amber-500",
      text: "text-amber-600",
      item: "hover:bg-amber-50",
    };
  }

  return {
    dot: "bg-red-500",
    text: "text-red-600",
    item: "hover:bg-red-50",
  };
}

export default function PanelStatusArea({ rooms, ruangAktif, setRuangAktif }) {
  const semuaBagian = useMemo(() => normalisasiBagian(), []);
  const [lantaiAktif, setLantaiAktif] = useState(1);

  const daftarBagian = useMemo(() => {
    return semuaBagian
      .filter((bagian) => bagian.lantai === lantaiAktif)
      .sort((a, b) => a.nomor - b.nomor)
      .slice(0, 8);
  }, [semuaBagian, lantaiAktif]);

  useEffect(() => {
    if (!daftarBagian.length) return;

    const aktifAdaDiLantaiIni = daftarBagian.some(
      (bagian) => bagian.id === ruangAktif,
    );

    if (!aktifAdaDiLantaiIni) {
      setRuangAktif(daftarBagian[0].id);
    }
  }, [daftarBagian, ruangAktif, setRuangAktif]);

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-[28px] font-semibold tracking-tight text-slate-950">
            Kondisi Perpustakaan
          </h2>

          <p className="mt-2 text-sm font-normal text-slate-500">
            Pilih lantai dan bagian untuk melihat kondisi area perpustakaan.
          </p>
        </div>

        <div className="flex shrink-0 rounded-2xl bg-slate-100 p-1">
          {[1, 2].map((lantai) => {
            const aktif = lantaiAktif === lantai;

            return (
              <button
                key={lantai}
                type="button"
                onClick={() => setLantaiAktif(lantai)}
                className={`rounded-xl px-6 py-3 text-sm font-medium transition ${
                  aktif
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Lantai {lantai}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-[340px_minmax(0,1fr)] items-start gap-6">
        <div className="h-[316px] rounded-[24px] bg-slate-50/90 p-4">
          <div className="grid h-full grid-cols-2 grid-rows-4 gap-3">
            {daftarBagian.map((bagian) => {
              const state = rooms?.[bagian.id];
              const status = getStatusBagian(state);
              const deskripsi = getDeskripsiStatus(state);
              const kelas = getKelasStatus(status);
              const aktif = ruangAktif === bagian.id;

              return (
                <button
                  key={bagian.id}
                  type="button"
                  onClick={() => setRuangAktif(bagian.id)}
                  className={`h-full rounded-[18px] px-4 py-3 text-left transition ${
                    aktif
                      ? "bg-white shadow-sm ring-2 ring-blue-100"
                      : kelas.item
                  }`}
                >
                  <div className="flex h-full items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${kelas.dot}`}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-slate-700">
                        {bagian.label}
                      </p>

                      <p
                        className={`mt-1 truncate text-[13px] font-medium leading-snug ${kelas.text}`}
                      >
                        {deskripsi}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-[316px] min-w-0">
          <PetaPerpustakaan
            daftarBagian={daftarBagian}
            rooms={rooms}
            bagianAktif={ruangAktif}
            setBagianAktif={setRuangAktif}
          />
        </div>
      </div>
    </section>
  );
}
