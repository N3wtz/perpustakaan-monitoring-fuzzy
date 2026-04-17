import PetaPerpustakaan from "./PetaPerpustakaan";
import { TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";
import { ambilToneStatus, kelasToneStatus, angkaAman } from "../utils/helper";

export default function PanelStatusArea({ rooms, ruangAktif, setRuangAktif }) {
  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[24px] bg-white shadow-sm lg:grid-cols-[320px_1fr]">
      <div className="p-6">
        <h3 className="text-[22px] font-bold">Kondisi Perpustakaan</h3>

        <div className="mt-6 space-y-3 text-[15px]">
          {TATA_LETAK_RUANG.map((ruang) => {
            const state = rooms[ruang.id];
            const tone = ambilToneStatus(
              state?.fuzzy?.kenyamananTotal || "Tidak Nyaman",
            );
            const kelas = kelasToneStatus(tone);
            const latest = state?.latest;
            const fuzzy = state?.fuzzy;

            let deskripsi = state ? fuzzy.kenyamananTotal : "Belum ada data";
            if (fuzzy?.kebisingan?.kenyamanan === "Tidak Nyaman") {
              deskripsi = `Terdeteksi Kebisingan ${angkaAman(latest?.suara_db).toFixed(0)}dB`;
            } else if (fuzzy?.asap?.kenyamanan === "Tidak Nyaman") {
              deskripsi = `Terdeteksi Asap ${angkaAman(latest?.asap_metric).toFixed(0)} ppm`;
            } else if (fuzzy?.co?.kenyamanan === "Tidak Nyaman") {
              deskripsi = `CO Tinggi ${angkaAman(latest?.ppm_co).toFixed(0)} ppm`;
            }

            return (
              <div key={ruang.id}>
                <div className="text-slate-700">{ruang.label}</div>
                <div className={`font-semibold ${kelas.text}`}>{deskripsi}</div>
              </div>
            );
          })}
        </div>
      </div>

      <PetaPerpustakaan
        rooms={rooms}
        ruangAktif={ruangAktif}
        setRuangAktif={setRuangAktif}
      />
    </div>
  );
}
