import { useEffect, useRef } from "react";
import { push, ref, set } from "firebase/database";

import { ambilDatabaseFirebase } from "../firebase/konfigurasiFirebase";
import { KONFIG_APP, TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";
import { buatDataDummyRealtime } from "../utils/dataDummy";

export function useDummyRealtimeFirebase({ aktif = true } = {}) {
  const latestSeqRef = useRef({});
  const historySeqRef = useRef({});

  useEffect(() => {
    const bolehJalan =
      aktif &&
      !KONFIG_APP.gunakanDataDummy &&
      KONFIG_APP.dummyRealtimeFirebaseAktif;

    if (!bolehJalan) return undefined;

    // Penting: hanya bagian dummy. Bagian ESP32 asli tidak ditulis oleh hook ini.
    const daftarDummy = TATA_LETAK_BAGIAN.filter(
      (bagian) => bagian.sumber === "dummy",
    );
    if (!daftarDummy.length) return undefined;

    const db = ambilDatabaseFirebase();
    let sedangKirimLatest = false;
    let sedangKirimHistory = false;

    async function kirimLatestDummy() {
      if (sedangKirimLatest) return;
      sedangKirimLatest = true;

      try {
        const sekarang = new Date();

        await Promise.all(
          daftarDummy.map(async (bagian) => {
            latestSeqRef.current[bagian.id] =
              (latestSeqRef.current[bagian.id] || 0) + 1;

            const data = buatDataDummyRealtime(
              bagian,
              latestSeqRef.current[bagian.id],
              KONFIG_APP.dummyLatestIntervalMs,
              sekarang,
            );

            await set(ref(db, `perpustakaan/${bagian.id}/latest`), data);
            await set(ref(db, `perpustakaan/${bagian.id}/node_info`), {
              bagian_id: bagian.id,
              ruang_id: bagian.id,
              node_id: data.node_id,
              sumber_data: "dummy_realtime",
              last_seen: data.timestamp,
              last_seen_text: data.waktu_text,
              wifi_rssi: data.wifi_rssi,
              status_node: "online",
            });
          }),
        );
      } finally {
        sedangKirimLatest = false;
      }
    }

    async function kirimHistoryDummy() {
      if (sedangKirimHistory) return;
      sedangKirimHistory = true;

      try {
        const sekarang = new Date();

        await Promise.all(
          daftarDummy.map(async (bagian) => {
            historySeqRef.current[bagian.id] =
              (historySeqRef.current[bagian.id] || 0) + 1;

            const data = buatDataDummyRealtime(
              bagian,
              historySeqRef.current[bagian.id],
              KONFIG_APP.dummyHistoryIntervalMs,
              sekarang,
            );

            await push(ref(db, `perpustakaan/${bagian.id}/history`), data);
          }),
        );
      } finally {
        sedangKirimHistory = false;
      }
    }

    // Dibuat seperti ESP32: tidak menulis terus-menerus setiap render,
    // tetapi menunggu interval. Latest masuk tiap 5 detik, history tiap 1 menit.
    const latestTimer = setInterval(() => {
      kirimLatestDummy().catch((error) =>
        console.error("Gagal kirim latest dummy:", error),
      );
    }, KONFIG_APP.dummyLatestIntervalMs);

    const historyTimer = setInterval(() => {
      kirimHistoryDummy().catch((error) =>
        console.error("Gagal kirim history dummy:", error),
      );
    }, KONFIG_APP.dummyHistoryIntervalMs);

    return () => {
      clearInterval(latestTimer);
      clearInterval(historyTimer);
    };
  }, [aktif]);
}
