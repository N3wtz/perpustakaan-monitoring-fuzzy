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

const PAGE_PARAMETER = [
  "suhu",
  "kelembapan",
  "kebisingan",
  "asap",
  "kualitasUdara",
  "kenyamananTotal",
];

function useKenyamananPerpustakaan(rooms) {
  return useMemo(() => {
    const daftarOnline = Object.values(rooms || {}).filter(
      (item) => item?.online && item?.fuzzy,
    );

    if (!daftarOnline.length) return "Belum Ada Data";

    const adaTidakNyaman = daftarOnline.some(
      (item) => item?.fuzzy?.kenyamananTotal === "Tidak Nyaman",
    );

    if (adaTidakNyaman) return "Tidak Nyaman";

    const adaKurangNyaman = daftarOnline.some(
      (item) => item?.fuzzy?.kenyamananTotal === "Kurang Nyaman",
    );

    if (adaKurangNyaman) return "Kurang Nyaman";

    return "Nyaman";
  }, [rooms]);
}

function IsiAplikasi() {
  const { user, loadingAuth } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [ruangAktif, setRuangAktif] = useState("bagian_l2_1");

  const sudahLogin = !!user;

  useDummyRealtimeFirebase({ aktif: sudahLogin });

  const { rooms, loading } = useDataPerpustakaan({ aktif: sudahLogin });
  const statusPerpustakaan = useKenyamananPerpustakaan(rooms);

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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Memeriksa login...
      </div>
    );
  }

  if (!user) {
    return <HalamanLogin />;
  }

  if (loading || loadingTelegramSetting || loadingAlerts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Memuat dashboard...
      </div>
    );
  }

  let konten = null;

  if (page === "dashboard") {
    konten = (
      <HalamanDashboard
        rooms={rooms}
        ruangAktif={ruangAktif}
        setRuangAktif={setRuangAktif}
        setPage={setPage}
        statusPerpustakaan={statusPerpustakaan}
      />
    );
  } else if (PAGE_PARAMETER.includes(page)) {
    konten = (
      <HalamanParameter
        rooms={rooms}
        page={page}
        ruangAktif={ruangAktif}
        setRuangAktif={setRuangAktif}
      />
    );
  } else if (page === "qos") {
    konten = <HalamanQoS rooms={rooms} />;
  } else if (page === "notifikasi") {
    konten = (
      <HalamanNotifikasi
        notifikasi={notifikasi}
        telegramAktifWebsite={telegramAktifWebsite}
        setTelegramAktifWebsite={setTelegramAktifWebsite}
      />
    );
  } else {
    konten = <div className="text-slate-600">Halaman tidak ditemukan.</div>;
  }

  return (
    <ShellAplikasi
      page={page}
      setPage={setPage}
      notifikasiCount={notifikasi.length}
    >
      {konten}
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
