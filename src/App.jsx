import { useMemo, useState } from "react";

import ShellAplikasi from "./components/ShellAplikasi";
import HalamanDashboard from "./pages/HalamanDashboard";
import HalamanParameter from "./pages/HalamanParameter";
import HalamanNotifikasi from "./pages/HalamanNotifikasi";
import HalamanQoS from "./pages/HalamanQoS";
import HalamanLogin from "./pages/HalamanLogin";

import { useDataPerpustakaan } from "./hooks/useDataPerpustakaan";
import { useDummyRealtimeFirebase } from "./hooks/useDummyRealtimeFirebase";
import { useAlertFirebase } from "./hooks/useAlertFirebase";
import { useMesinAlert } from "./hooks/useMesinAlert";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function useKenyamananPerpustakaan(rooms) {
  return useMemo(() => {
    const daftarOnline = Object.values(rooms || {}).filter(
      (item) => item?.online && item?.fuzzy,
    );
    if (!daftarOnline.length) return "Belum Ada Data";

    const adaBuruk = daftarOnline.some(
      (item) => item?.fuzzy?.kenyamananTotal === "Tidak Nyaman",
    );
    const adaPeringatan = daftarOnline.some(
      (item) => item?.fuzzy?.kenyamananTotal === "Kurang Nyaman",
    );

    if (adaBuruk) return "Tidak Nyaman";
    if (adaPeringatan) return "Kurang Nyaman";
    return "Nyaman";
  }, [rooms]);
}

function IsiAplikasi() {
  const { user, loadingAuth } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [ruangAktif, setRuangAktif] = useState("bagian_l1_1");

  const sudahLogin = !!user;

  // Mengirim 12 bagian dummy ke Firebase secara realtime.
  // 4 sensor ESP32 asli tidak disentuh oleh hook ini.
  useDummyRealtimeFirebase({ aktif: sudahLogin });

  const { rooms, loading } = useDataPerpustakaan({ aktif: sudahLogin });
  const kenyamananPerpustakaan = useKenyamananPerpustakaan(rooms);

  const {
    notifikasi,
    telegramAktifWebsite,
    setTelegramAktifWebsite,
    loadingTelegramSetting,
    loadingAlerts,
  } = useAlertFirebase();

  const siapJalankanMesinAlert =
    sudahLogin && !loading && !loadingTelegramSetting && !loadingAlerts;

  useMesinAlert({
    rooms,
    alerts: notifikasi,
    telegramAktifWebsite,
    siapJalankanMesinAlert,
  });

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5FA] text-slate-600">
        Memeriksa login...
      </div>
    );
  }

  if (!user) return <HalamanLogin />;

  if (loading || loadingTelegramSetting || loadingAlerts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5FA] text-slate-600">
        Memuat dashboard...
      </div>
    );
  }

  let isi = null;

  if (page === "dashboard") {
    isi = (
      <HalamanDashboard
        rooms={rooms}
        kenyamananPerpustakaan={kenyamananPerpustakaan}
        ruangAktif={ruangAktif}
        setRuangAktif={setRuangAktif}
        setPage={setPage}
      />
    );
  } else if (
    ["suhu", "kelembapan", "kebisingan", "asap", "kualitasUdara"].includes(page)
  ) {
    isi = (
      <HalamanParameter
        page={page}
        rooms={rooms}
        ruangAktif={ruangAktif}
        setRuangAktif={setRuangAktif}
      />
    );
  } else if (page === "qos") {
    isi = <HalamanQoS rooms={rooms} />;
  } else if (page === "notifikasi") {
    isi = (
      <HalamanNotifikasi
        notifikasi={notifikasi}
        telegramAktifWebsite={telegramAktifWebsite}
        setTelegramAktifWebsite={setTelegramAktifWebsite}
      />
    );
  } else {
    isi = (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Halaman tidak ditemukan.
      </div>
    );
  }

  return (
    <ShellAplikasi page={page} setPage={setPage}>
      {isi}
    </ShellAplikasi>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <IsiAplikasi />
    </AuthProvider>
  );
}
