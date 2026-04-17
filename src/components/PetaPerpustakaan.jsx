import { TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";
import { ambilToneStatus } from "../utils/helper";

export default function PetaPerpustakaan({ rooms, setRuangAktif }) {
  return (
    <div className="grid grid-cols-2 gap-0 bg-green-50">
      {TATA_LETAK_RUANG.map((ruang) => {
        const state = rooms[ruang.id];
        const total = state?.fuzzy?.kenyamananTotal || "Tidak Nyaman";
        const tone = ambilToneStatus(total);
        const kelasArea =
          tone === "buruk"
            ? "bg-red-100"
            : tone === "peringatan"
              ? "bg-amber-50"
              : "bg-green-100";

        return (
          <div
            key={ruang.id}
            onClick={() => setRuangAktif(ruang.id)}
            className={`relative min-h-[230px] border border-white/60 p-8 ${kelasArea} cursor-pointer`}
          >
            <div className="absolute left-6 top-5 text-sm font-semibold text-slate-500">
              {ruang.label}
            </div>

            <div className="mx-auto mt-8 grid max-w-[420px] grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="mx-auto h-[124px] w-[52px] rounded-md border-2 border-blue-400/80 bg-white/20 shadow-inner"
                />
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(#3b82f6_2px,transparent_2px)] [background-size:26px_28px]" />
          </div>
        );
      })}
    </div>
  );
}
