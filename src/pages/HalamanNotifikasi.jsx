import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SendHorizonal,
} from "lucide-react";

import KartuUmum from "../components/KartuUmum";
import PemilihRuangNotifikasi from "../components/PemilihRuangNotifikasi";
import PemilihStatusNotifikasi from "../components/PemilihStatusNotifikasi";
import { KONFIG_APP, TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";
import { ambilToneStatus, kelasToneStatus } from "../utils/helper";

const ITEM_PER_HALAMAN = 50;

function HeaderUser() {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Notifikasi</h1>
        <p className="mt-2 text-sm text-slate-500">
          Data notifikasi ditampilkan 50 data per halaman.
        </p>
      </div>

      <div className="pointer-events-none flex items-center gap-3 rounded-full bg-transparent px-4 py-2 opacity-0">
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

function SwitchTelegram({ aktif, onChange }) {
  const bisaDiubah = typeof onChange === "function";

  return (
    <KartuUmum className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3 text-blue-600">
            <SendHorizonal className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">
              Notifikasi Telegram
            </div>
            <div className="text-sm text-slate-500">
              {aktif ? "Aktif" : "Tidak Aktif"}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!bisaDiubah}
          onClick={() => bisaDiubah && onChange(!aktif)}
          className={`relative h-8 w-14 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
            aktif ? "bg-blue-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
              aktif ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>
    </KartuUmum>
  );
}

function formatNilaiNotifikasi(item) {
  const nilai = item?.nilai || "-";
  const parameter = String(item?.parameter || "").toLowerCase();

  if (parameter.includes("asap")) {
    return String(nilai).replace(/ppm/gi, "indeks");
  }

  return nilai;
}

function KartuNotifikasi({ item }) {
  const tone = ambilToneStatus(item?.status || "Tidak Nyaman");
  const kelas = kelasToneStatus(tone);

  return (
    <KartuUmum className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 h-3 w-3 rounded-full ${kelas.dot}`} />
          <div>
            <div className="text-lg font-semibold text-slate-800">
              {item?.area || item?.roomId || "-"}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {item?.parameter || "-"}
            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <div>
                <span className="font-medium">Nilai:</span>{" "}
                {formatNilaiNotifikasi(item)}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className={kelas.text}>{item?.status || "-"}</span>
              </div>
              <div>
                <span className="font-medium">Detail:</span>{" "}
                {item?.detail || "-"}
              </div>
              <div>
                <span className="font-medium">Waktu:</span> {item?.waktu || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
          <Bell className="h-5 w-5" />
        </div>
      </div>
    </KartuUmum>
  );
}

export default function HalamanNotifikasi({
  notifikasi,
  telegramAktifWebsite = false,
  setTelegramAktifWebsite,
}) {
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterArea, setFilterArea] = useState("semua");
  const [halamanAktif, setHalamanAktif] = useState(1);

  const labelAreaAktif = useMemo(() => {
    if (filterArea === "semua") return "Semua Area";
    return (
      TATA_LETAK_RUANG.find((item) => item.id === filterArea)?.label ||
      filterArea
    );
  }, [filterArea]);

  const notifikasiTersaring = useMemo(() => {
    return (notifikasi || []).filter((item) => {
      const lolosStatus =
        filterStatus === "semua" ? true : item?.status === filterStatus;
      const lolosArea =
        filterArea === "semua" ? true : item?.roomId === filterArea;
      return lolosStatus && lolosArea;
    });
  }, [notifikasi, filterStatus, filterArea]);

  const totalHalaman = Math.max(
    1,
    Math.ceil(notifikasiTersaring.length / ITEM_PER_HALAMAN),
  );

  useEffect(() => {
    setHalamanAktif(1);
  }, [filterStatus, filterArea]);

  useEffect(() => {
    if (halamanAktif > totalHalaman) {
      setHalamanAktif(totalHalaman);
    }
  }, [halamanAktif, totalHalaman]);

  const notifikasiHalamanIni = useMemo(() => {
    const awal = (halamanAktif - 1) * ITEM_PER_HALAMAN;
    const akhir = awal + ITEM_PER_HALAMAN;
    return notifikasiTersaring.slice(awal, akhir);
  }, [notifikasiTersaring, halamanAktif]);

  const nomorAwal = notifikasiTersaring.length
    ? (halamanAktif - 1) * ITEM_PER_HALAMAN + 1
    : 0;
  const nomorAkhir = Math.min(
    halamanAktif * ITEM_PER_HALAMAN,
    notifikasiTersaring.length,
  );

  return (
    <>
      <HeaderUser />

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <KartuUmum className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <PemilihRuangNotifikasi
              value={filterArea}
              onChange={setFilterArea}
            />
            <PemilihStatusNotifikasi
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </div>
        </KartuUmum>

        <SwitchTelegram
          aktif={telegramAktifWebsite}
          onChange={setTelegramAktifWebsite}
        />
      </div>

      <KartuUmum className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-slate-600">
            Menampilkan{" "}
            <span className="font-semibold">
              {nomorAwal}-{nomorAkhir}
            </span>{" "}
            dari{" "}
            <span className="font-semibold">{notifikasiTersaring.length}</span>{" "}
            notifikasi untuk{" "}
            <span className="font-semibold">{labelAreaAktif}</span>
            {filterStatus !== "semua" ? ` dengan status ${filterStatus}` : ""}.
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>
              Halaman {halamanAktif} dari {totalHalaman} • {ITEM_PER_HALAMAN}{" "}
              per halaman
            </span>
            <button
              type="button"
              disabled={halamanAktif <= 1}
              onClick={() => setHalamanAktif((prev) => Math.max(1, prev - 1))}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={halamanAktif >= totalHalaman}
              onClick={() =>
                setHalamanAktif((prev) => Math.min(totalHalaman, prev + 1))
              }
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </KartuUmum>

      <div className="grid grid-cols-1 gap-4">
        {notifikasiHalamanIni.length > 0 ? (
          notifikasiHalamanIni.map((item, index) => (
            <KartuNotifikasi
              key={item.id || `${item.roomId}-${item.waktu}-${index}`}
              item={item}
            />
          ))
        ) : (
          <KartuUmum className="p-6 text-center text-slate-500">
            Tidak ada notifikasi yang sesuai dengan filter.
          </KartuUmum>
        )}
      </div>
    </>
  );
}
