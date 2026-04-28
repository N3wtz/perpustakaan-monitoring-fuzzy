function getStatusBagian(state) {
  if (!state?.latest || !state?.fuzzy) return "Belum ada data";
  return state.fuzzy.kenyamananTotal || "Belum ada data";
}

function getToneStatus(status) {
  if (!status || status === "Belum ada data") return "kosong";
  if (status === "Nyaman") return "baik";
  if (status === "Kurang Nyaman") return "peringatan";
  return "bahaya";
}

function getKelasPeta(status, aktif) {
  const tone = getToneStatus(status);

  if (aktif) {
    return {
      kartu: "border-blue-500 bg-blue-50 ring-2 ring-blue-100",
      label: "border-blue-100 text-blue-700",
      bar: "border-blue-400 bg-blue-100",
      status: "text-blue-600",
    };
  }

  if (tone === "baik") {
    return {
      kartu: "border-emerald-100 bg-emerald-50/70",
      label: "border-emerald-100 text-emerald-700",
      bar: "border-emerald-300 bg-emerald-100",
      status: "text-emerald-600",
    };
  }

  if (tone === "peringatan") {
    return {
      kartu: "border-amber-100 bg-amber-50/80",
      label: "border-amber-100 text-amber-700",
      bar: "border-amber-300 bg-amber-100",
      status: "text-amber-600",
    };
  }

  if (tone === "bahaya") {
    return {
      kartu: "border-red-100 bg-red-50/80",
      label: "border-red-100 text-red-700",
      bar: "border-red-300 bg-red-100",
      status: "text-red-600",
    };
  }

  return {
    kartu: "border-slate-200 bg-slate-50",
    label: "border-slate-200 text-slate-500",
    bar: "border-slate-300 bg-slate-100",
    status: "text-slate-400",
  };
}

function singkatStatus(status) {
  if (status === "Belum ada data") return "Belum ada data";
  return status || "Belum ada data";
}

export default function PetaPerpustakaan({
  daftarBagian = [],
  rooms = {},
  bagianAktif,
  setBagianAktif,
}) {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-4">
      {daftarBagian.map((bagian) => {
        const state = rooms?.[bagian.id];
        const status = getStatusBagian(state);
        const aktif = bagian.id === bagianAktif;
        const kelas = getKelasPeta(status, aktif);

        return (
          <button
            key={bagian.id}
            type="button"
            onClick={() => setBagianAktif(bagian.id)}
            className={`relative h-[150px] overflow-hidden rounded-[22px] border transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${kelas.kartu}`}
          >
            <div
              className={`absolute left-1/2 top-4 flex h-[36px] min-w-[92px] -translate-x-1/2 items-center justify-center rounded-full border bg-white px-4 text-center text-[13px] font-medium leading-none shadow-sm ${kelas.label}`}
            >
              {bagian.label}
            </div>

            <div className="absolute left-1/2 top-[66px] flex h-[54px] -translate-x-1/2 items-end justify-center gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-[54px] w-[18px] rounded-md border ${kelas.bar}`}
                />
              ))}
            </div>

            <div
              className={`absolute bottom-3 left-3 right-3 truncate text-center text-[12px] font-medium leading-none ${kelas.status}`}
            >
              {singkatStatus(status)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
