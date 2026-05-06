import KartuUmum from "./KartuUmum";

function formatNilai(nilai) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return "-";
  return angka.toFixed(0);
}

export default function KartuStatistik({ judul, nilai, unit }) {
  return (
    <KartuUmum className="h-full p-5">
      <div className="text-[18px] text-slate-600">{judul}</div>

      <div className="mt-7 flex items-end gap-2 leading-none">
        <div className="text-[48px] font-semibold tracking-tight text-slate-900">
          {formatNilai(nilai)}
        </div>
        {unit ? (
          <div className="pb-1 text-2xl text-slate-500">{unit}</div>
        ) : null}
      </div>
    </KartuUmum>
  );
}
