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
  { key: "grafikGabungan", label: "Grafik Gabungan", ikon: Activity },
  { key: "qos", label: "QoS", ikon: Activity },
];

export default function ShellAplikasi({
  page,
  setPage,
  notifikasiCount = 0,
  children,
}) {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F5FA] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="shrink-0 px-5 pb-4 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
              P
            </div>

            <div className="mt-3 text-[18px] font-extrabold leading-snug text-slate-950">
              Perpustakaan
              <br />
              Monitoring Fuzzy
            </div>
          </div>

          <div className="flex-1 px-3">
            <nav className="space-y-1.5">
              {MENU_UTAMA.map((item) => {
                const Ikon = item.ikon;
                const aktif = page === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setPage(item.key)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition ${
                      aktif
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Ikon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="shrink-0 border-t border-slate-200 px-3 py-3">
            <button
              onClick={() => setPage("notifikasi")}
              className={`mb-1.5 flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                page === "notifikasi"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="flex items-center gap-3">
                <Bell className="h-5 w-5 shrink-0" />
                <span>Notifikasi</span>
              </span>

              {notifikasiCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {notifikasiCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-auto p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                {KONFIG_APP.namaAplikasi}
              </div>
              <div className="text-lg font-semibold text-slate-900">
                Monitoring Fuzzy
              </div>
            </div>

            <button
              onClick={() => setPage("notifikasi")}
              className="relative rounded-2xl bg-slate-100 p-3 text-slate-700"
            >
              <Bell className="h-5 w-5" />

              {notifikasiCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {notifikasiCount}
                </span>
              )}
            </button>
          </div>

          <div className="min-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
