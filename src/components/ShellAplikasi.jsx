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
    { key: "kualitasUdara", label: "Kualitas Udara (CO)", ikon: Wind },
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
        <div className="w-[270px] shrink-0">
          <aside className="sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white/90 backdrop-blur-sm">
            <div className="shrink-0 px-7 py-8 text-[22px] font-bold">
              {KONFIG_APP.namaAplikasi}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden px-4 pb-4">
              <nav className="space-y-2">
                {menu.map((item) => {
                  const Ikon = item.ikon;
                  const active = page === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => setPage(item.key)}
                      className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] transition ${
                        active
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                          : "text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <Ikon className="h-6 w-6" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="shrink-0 border-t border-slate-200 px-4 py-6">
              <button
                onClick={() => setPage("notifikasi")}
                className={`mb-2 flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] transition ${
                  page === "notifikasi"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Bell className="h-6 w-6" />
                <span>Notifikasi</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] text-slate-800 transition hover:bg-slate-100"
              >
                <LogOut className="h-6 w-6" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
