import KartuUmum from "./KartuUmum";

export default function KartuStatistik({ judul, nilai, unit }) {
  return (
    <KartuUmum className="p-5">
      <div className="text-[18px] text-slate-600">{judul}</div>
      <div className="mt-7 flex items-end gap-3">
        <div className="h-3 w-3 rounded-full bg-blue-500" />
        <div className="text-[56px] font-semibold leading-none tracking-tight">
          {Number.isFinite(nilai) ? nilai.toFixed(0) : 0}
          {unit}
        </div>
      </div>
    </KartuUmum>
  );
}
