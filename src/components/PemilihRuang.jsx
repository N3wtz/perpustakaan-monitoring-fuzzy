import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";

export default function PemilihRuang({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = TATA_LETAK_BAGIAN.find((r) => r.id === value);

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
          {selected?.labelLengkap || "Pilih Bagian"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-[360px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {TATA_LETAK_BAGIAN.map((bagian) => (
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
              <div className="font-medium">{bagian.labelLengkap}</div>
              <div
                className={`text-[11px] ${value === bagian.id ? "text-blue-100" : "text-slate-400"}`}
              >
                {bagian.sumber === "esp32"
                  ? "Sensor ESP32 asli"
                  : "Sensor dummy realtime"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
