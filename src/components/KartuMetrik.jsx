import KartuUmum from "./KartuUmum";
import { ambilToneStatus, kelasToneStatus } from "../utils/helper";

export default function KartuMetrik({ judul, nilai, status, ikon: Ikon }) {
  const tone = ambilToneStatus(status);
  const kelas = kelasToneStatus(tone);

  return (
    <KartuUmum className="h-full p-4">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between">
          <p className="text-[17px] text-slate-600">{judul}</p>

          <div className="rounded-xl bg-blue-500 p-3 text-white">
            <Ikon className="h-6 w-6" />
          </div>
        </div>

        {/* Nilai */}
        <div className="mt-0">
          <div className="text-[38px] font-semibold leading-tight text-slate-900">
            {nilai}
          </div>
        </div>

        {/* Status */}
        <div className="mt-3">
          <div
            className={`text-[18px] font-bold ${kelas.text} whitespace-nowrap overflow-hidden text-ellipsis`}
            title={status}
          >
            {status}
          </div>
        </div>
      </div>
    </KartuUmum>
  );
}
