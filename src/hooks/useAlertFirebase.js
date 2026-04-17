import { useEffect, useMemo, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { ambilDatabaseFirebase } from "../firebase/konfigurasiFirebase";
import { KONFIG_NOTIFIKASI } from "../notifikasi/konfigNotifikasi";

export function useAlertFirebase() {
  const [alerts, setAlerts] = useState([]);
  const [telegramAktifWebsite, setTelegramAktifWebsiteState] = useState(false);
  const [loadingTelegramSetting, setLoadingTelegramSetting] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    const db = ambilDatabaseFirebase();

    const alertsRef = ref(db, KONFIG_NOTIFIKASI.pathAlerts);
    const unsubscribeAlerts = onValue(
      alertsRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const hasil = Object.entries(data)
          .map(([id, item]) => ({ id, ...item }))
          .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));

        setAlerts(hasil);
        setLoadingAlerts(false);
      },
      () => {
        setAlerts([]);
        setLoadingAlerts(false);
      },
    );

    const pengaturanRef = ref(db, KONFIG_NOTIFIKASI.pathPengaturanTelegram);
    const unsubscribePengaturan = onValue(
      pengaturanRef,
      async (snapshot) => {
        const value = snapshot.val();

        // kalau belum ada sama sekali di database, buat default FALSE
        // supaya tidak ada kirim otomatis saat pertama kali start
        if (value === null) {
          await set(pengaturanRef, false);
          setTelegramAktifWebsiteState(false);
        } else {
          setTelegramAktifWebsiteState(Boolean(value));
        }

        setLoadingTelegramSetting(false);
      },
      () => {
        setTelegramAktifWebsiteState(false);
        setLoadingTelegramSetting(false);
      },
    );

    return () => {
      unsubscribeAlerts();
      unsubscribePengaturan();
    };
  }, []);

  const setTelegramAktifWebsite = async (value) => {
    const db = ambilDatabaseFirebase();
    await set(
      ref(db, KONFIG_NOTIFIKASI.pathPengaturanTelegram),
      Boolean(value),
    );
    setTelegramAktifWebsiteState(Boolean(value));
  };

  return {
    alerts,
    notifikasi: useMemo(() => alerts, [alerts]),
    telegramAktifWebsite,
    setTelegramAktifWebsite,
    loadingTelegramSetting,
    loadingAlerts,
  };
}
