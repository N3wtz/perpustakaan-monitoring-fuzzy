import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";

const OPSI = [
  { id: "semua", labelLengkap: "Semua Bagian" },
  ...TATA_LETAK_BAGIAN,
];

export default function PemilihRuangNotifikasi({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = OPSI.find((r) => r.id === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-[220px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
      >
        <span className="truncate">
          {selected?.labelLengkap || selected?.label || "Semua Bagian"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-[360px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {OPSI.map((bagian) => (
            <button
              key={bagian.id}
              type="button"
              onClick={() => {
                onChange(bagian.id);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition ${
                value === bagian.id
                  ? "bg-blue-500 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {bagian.labelLengkap || bagian.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
