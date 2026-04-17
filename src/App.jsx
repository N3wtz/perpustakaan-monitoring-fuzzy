import { useMemo, useState } from "react";
import ShellAplikasi from "./components/ShellAplikasi";
import HalamanDashboard from "./pages/HalamanDashboard";
import HalamanParameter from "./pages/HalamanParameter";
import HalamanNotifikasi from "./pages/HalamanNotifikasi";
import HalamanQoS from "./pages/HalamanQoS";
import HalamanLogin from "./pages/HalamanLogin";
import { useDataPerpustakaan } from "./hooks/useDataPerpustakaan";
import { useAlertFirebase } from "./hooks/useAlertFirebase";
import { useMesinAlert } from "./hooks/useMesinAlert";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function useKenyamananPerpustakaan(rooms) {
  return useMemo(() => {
    const daftar = Object.values(rooms || {});
    if (!daftar.length) return "Belum Ada Data";

    const adaBuruk = daftar.some(
      (item) => item?.fuzzy?.kenyamananTotal === "Tidak Nyaman",
    );

    const adaPeringatan = daftar.some(
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
  const [ruangAktif, setRuangAktif] = useState("ruang_1");

  const sudahLogin = !!user;

  const { rooms, loading } = useDataPerpustakaan({
    aktif: sudahLogin,
  });

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

  if (!user) {
    return <HalamanLogin />;
  }

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
