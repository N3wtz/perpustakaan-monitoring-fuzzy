import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const OPSI = [
  { value: "hari", label: "Hari" },
  { value: "bulan", label: "Bulan" },
  { value: "kustom", label: "Kustom" },
];

export default function PemilihPeriode({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selected = OPSI.find((o) => o.value === value);

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
    <div ref={ref} className="relative w-[140px]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
      >
        {selected?.label}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
          {OPSI.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition ${
                value === item.value
                  ? "bg-blue-500 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
