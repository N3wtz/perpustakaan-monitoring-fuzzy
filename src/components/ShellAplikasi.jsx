import {
  Bell,
  Cloud,
  Droplets,
  LayoutDashboard,
  LogOut,
  Thermometer,
  Volume2,
  Wind,
  Activity,
} from "lucide-react";
import { KONFIG_APP } from "../fuzzy/aturanFuzzy";
import { useAuth } from "../auth/AuthContext";

export default function ShellAplikasi({ page, setPage, children }) {
  const { logout } = useAuth();

  const menu = [
    { key: "dashboard", label: "Dashboard", ikon: LayoutDashboard },
    { key: "suhu", label: "Suhu", ikon: Thermometer },
    { key: "kelembapan", label: "Kelembapan", ikon: Droplets },
    { key: "kebisingan", label: "Kebisingan", ikon: Volume2 },
    { key: "asap", label: "Asap", ikon: Cloud },
    { key: "kualitasUdara", label: "Kualitas Udara", ikon: Wind },
    { key: "qos", label: "QoS", ikon: Activity },
  ];

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
        <div className="w-[245px] shrink-0">
          <aside className="sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white/95 backdrop-blur-sm">
            <div className="shrink-0 px-6 py-7 text-[20px] font-extrabold leading-snug text-slate-950">
              {KONFIG_APP.namaAplikasi}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
              <nav className="space-y-2">
                {menu.map((item) => {
                  const Ikon = item.ikon;
                  const active = page === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => setPage(item.key)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[16px] font-semibold transition ${
                        active
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Ikon className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="shrink-0 border-t border-slate-200 px-3 py-5">
              <button
                onClick={() => setPage("notifikasi")}
                className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[16px] font-semibold transition ${
                  page === "notifikasi"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Bell className="h-5 w-5 shrink-0" />
                <span>Notifikasi</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[16px] font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>

        <main className="min-w-0 flex-1 overflow-x-auto p-5 lg:p-6">
          <div className="min-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
