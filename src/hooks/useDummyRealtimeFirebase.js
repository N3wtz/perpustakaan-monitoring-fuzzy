import { useEffect, useRef } from "react";
import { push, ref, set } from "firebase/database";

import { ambilDatabaseFirebase } from "../firebase/konfigurasiFirebase";
import { KONFIG_APP, TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";
import { buatDataDummyRealtime } from "../utils/dataDummy";

function buatVariasiNyaman(seq, min, max, fase = 0, desimal = 1) {
  const tengah = (min + max) / 2;
  const amplitudo = (max - min) / 2;

  // Membuat variasi naik-turun secara halus.
  // Nilai tetap dikunci agar tidak keluar dari batas nyaman.
  const nilai = tengah + Math.sin((seq + fase) * 0.73) * amplitudo * 0.85;

  return Number(Math.min(max, Math.max(min, nilai)).toFixed(desimal));
}

function paksaDummyNyaman(data) {
  const seq = Number(
    data?.qos?.seq || data?.seq || data?.timestamp || Date.now(),
  );

  return {
    ...data,

    // Suhu dibuat bervariasi, tetapi tetap dalam batas nyaman.
    suhu: buatVariasiNyaman(seq, 23.2, 25.6, 1, 1),

    // Kelembapan dibuat bervariasi, tetapi tetap dalam batas nyaman.
    kelembapan: buatVariasiNyaman(seq, 44, 58, 2, 1),

    // Suara dibuat bervariasi, tetapi tetap dalam kondisi tenang/nyaman.
    suara_db: buatVariasiNyaman(seq, 32, 44, 3, 1),

    // Asap dibuat tetap aman dan tidak terdeteksi.
    asap_metric: buatVariasiNyaman(seq, 0.5, 5.5, 4, 1),
    asap_flag: 0,

    // CO dibuat bervariasi, tetapi tetap dalam batas nyaman.
    ppm_co: buatVariasiNyaman(seq, 1, 5.5, 5, 1),

    // Data mentah MQ dibuat bervariasi, tetapi tetap normal.
    mq2_delta: Math.round(buatVariasiNyaman(seq, 5, 35, 6, 0)),
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

    // Penting: hanya bagian dummy.
    // Bagian ESP32 asli tidak ditulis oleh hook ini.
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

            const data = paksaDummyNyaman(dataAwal);

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

            const data = paksaDummyNyaman(dataAwal);

            await push(ref(db, `perpustakaan/${bagian.id}/history`), data);
          }),
        );
      } finally {
        sedangKirimHistory = false;
      }
    }

    // Kirim sekali di awal supaya dummy langsung muncul setelah login.
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
