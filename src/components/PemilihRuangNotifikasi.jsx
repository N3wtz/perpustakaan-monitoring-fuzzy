import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { TATA_LETAK_RUANG } from "../fuzzy/aturanFuzzy";

const OPSI = [{ id: "semua", label: "Semua Area" }, ...TATA_LETAK_RUANG];

export default function PemilihRuangNotifikasi({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selected = OPSI.find((r) => r.id === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-[160px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
      >
        {selected?.label}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
          {OPSI.map((ruang) => (
            <button
              key={ruang.id}
              type="button"
              onClick={() => {
                onChange(ruang.id);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition ${
                value === ruang.id
                  ? "bg-blue-500 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {ruang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
