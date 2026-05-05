import {
  Activity,
  Bell,
  Cloud,
  Droplets,
  LayoutDashboard,
  LogOut,
  Thermometer,
  Users,
  Volume2,
  Wind,
} from "lucide-react";

import { KONFIG_APP } from "../fuzzy/aturanFuzzy";
import { useAuth } from "../auth/AuthContext";

const MENU_UTAMA = [
  { key: "dashboard", label: "Dashboard", ikon: LayoutDashboard },
  { key: "suhu", label: "Suhu", ikon: Thermometer },
  { key: "kelembapan", label: "Kelembapan", ikon: Droplets },
  { key: "kebisingan", label: "Kebisingan", ikon: Volume2 },
  { key: "asap", label: "Indeks Asap", ikon: Cloud },
  { key: "kualitasUdara", label: "Kualitas Udara", ikon: Wind },
  { key: "kenyamananTotal", label: "Kenyamanan Total", ikon: Users },
  { key: "qos", label: "QoS", ikon: Activity },
];

export default function ShellAplikasi({
  page,
  setPage,
  notifikasiCount = 0,
  children,
}) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white p-6 shadow-sm lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold text-white">
            P
          </div>
          <div>
            <div className="text-lg font-semibold leading-tight">
              Perpustakaan
            </div>
            <div className="text-xs text-slate-500">Monitoring Fuzzy</div>
          </div>
        </div>

        <nav className="mt-9 space-y-2">
          {MENU_UTAMA.map((item) => {
            const Ikon = item.ikon;
            const aktif = page === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setPage(item.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                  aktif
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Ikon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => setPage("notifikasi")}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
              page === "notifikasi"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              Notifikasi
            </span>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {notifikasiCount}
            </span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold">
                {KONFIG_APP.namaAplikasi}
              </div>
              <div className="text-xs text-slate-500">Monitoring Fuzzy</div>
            </div>

            <button
              type="button"
              onClick={() => setPage("notifikasi")}
              className="relative rounded-2xl bg-slate-100 p-3 text-slate-700"
            >
              <Bell className="h-5 w-5" />
              {notifikasiCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {notifikasiCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
