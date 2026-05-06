import { useEffect, useRef } from "react";
import { push, ref, set } from "firebase/database";

import { ambilDatabaseFirebase } from "../firebase/konfigurasiFirebase";
import { KONFIG_APP, TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";
import { buatDataDummyRealtime } from "../utils/dataDummy";

const BAGIAN_DUMMY_TIDAK_NYAMAN = "bagian_l2_4";

function paksaDummyBagian4TidakNyaman(data, bagian) {
  if (bagian.id !== BAGIAN_DUMMY_TIDAK_NYAMAN) {
    return data;
  }

  return {
    ...data,

    // Dibuat panas agar parameter suhu selalu masuk Tidak Nyaman.
    // Nilai 31 aman karena melewati batas panas pada aturan fuzzy.
    suhu: 31.0,

    // Parameter lain dibuat tetap normal supaya yang terlihat bermasalah utamanya suhu.
    kelembapan: 52.0,
    suara_db: 40.0,
    asap_metric: 2.0,
    asap_flag: 0,
    ppm_co: 3.0,

    // Opsional: agar data mentah MQ juga terlihat normal.
    mq2_delta: 20,
  };
}

export function useDummyRealtimeFirebase({ aktif = true } = {}) {
  const latestSeqRef = useRef({});
  const historySeqRef = useRef({});

  useEffect(() => {
    const bolehJalan =
      aktif &&
      !KONFIG_APP.gunakanDataDummy &&
      KONFIG_APP.dummyRealtimeFirebaseAktif;

    if (!bolehJalan) return undefined;

    // Penting: hanya bagian dummy lantai 2.
    // Bagian ESP32 asli lantai 2 bagian 1, 3, 6, dan 8 tidak ditulis hook ini.
    const daftarDummy = TATA_LETAK_BAGIAN.filter(
      (bagian) => bagian.sumber === "dummy",
    );

    if (!daftarDummy.length) return undefined;

    const db = ambilDatabaseFirebase();
    let sedangKirimLatest = false;
    let sedangKirimHistory = false;
    let sudahStop = false;

    async function kirimLatestDummy() {
      if (sedangKirimLatest || sudahStop) return;
      sedangKirimLatest = true;

      try {
        const sekarang = new Date();

        await Promise.all(
          daftarDummy.map(async (bagian) => {
            latestSeqRef.current[bagian.id] =
              (latestSeqRef.current[bagian.id] || 0) + 1;

            const dataAwal = buatDataDummyRealtime(
              bagian,
              latestSeqRef.current[bagian.id],
              KONFIG_APP.dummyLatestIntervalMs,
              sekarang,
            );

            const data = paksaDummyBagian4TidakNyaman(dataAwal, bagian);

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
      if (sedangKirimHistory || sudahStop) return;
      sedangKirimHistory = true;

      try {
        const sekarang = new Date();

        await Promise.all(
          daftarDummy.map(async (bagian) => {
            historySeqRef.current[bagian.id] =
              (historySeqRef.current[bagian.id] || 0) + 1;

            const dataAwal = buatDataDummyRealtime(
              bagian,
              historySeqRef.current[bagian.id],
              KONFIG_APP.dummyHistoryIntervalMs,
              sekarang,
            );

            const data = paksaDummyBagian4TidakNyaman(dataAwal, bagian);

            await push(ref(db, `perpustakaan/${bagian.id}/history`), data);
          }),
        );
      } finally {
        sedangKirimHistory = false;
      }
    }

    // Kirim sekali di awal supaya 4 dummy langsung muncul setelah login.
    kirimLatestDummy().catch((error) =>
      console.error("Gagal kirim latest dummy:", error),
    );

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
      sudahStop = true;
      clearInterval(latestTimer);
      clearInterval(historyTimer);
    };
  }, [aktif]);
}
