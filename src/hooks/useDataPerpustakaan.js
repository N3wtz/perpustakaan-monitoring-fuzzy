import { useEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";

import { KONFIG_APP, TATA_LETAK_BAGIAN } from "../fuzzy/aturanFuzzy";
import { hitungFuzzyRuang } from "../fuzzy/mesinFuzzy";
import { ambilDatabaseFirebase } from "../firebase/konfigurasiFirebase";
import { DATA_DUMMY } from "../utils/dataDummy";

function angkaAman(value, fallback = 0) {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : fallback;
}

function normalisasiQos(qos = {}) {
  return {
    seq: angkaAman(qos?.seq),
    sent_at_ms: angkaAman(qos?.sent_at_ms),
    sample_interval_ms: angkaAman(qos?.sample_interval_ms),
  };
}

function normalisasiLatest(
  data = {},
  fallbackId = "",
  sumberDefault = "esp32",
) {
  const bagianId = data.bagian_id || data.ruang_id || fallbackId;

  return {
    bagian_id: bagianId,
    ruang_id: bagianId,
    node_id: data.node_id || "",
    sumber_data: data.sumber_data || sumberDefault,

    suhu: angkaAman(data.suhu),
    kelembapan: angkaAman(data.kelembapan),
    suara_db: angkaAman(data.suara_db),
    ppm_co: angkaAman(data.ppm_co),
    asap_flag: angkaAman(data.asap_flag),
    asap_metric:
      data.asap_metric !== undefined
        ? angkaAman(data.asap_metric)
        : angkaAman(data.asap_flag) === 1
          ? 10
          : 0,

    mq2_adc: angkaAman(data.mq2_adc),
    mq2_delta: angkaAman(data.mq2_delta),
    mq7_adc: angkaAman(data.mq7_adc),
    wifi_rssi: angkaAman(data.wifi_rssi),
    timestamp: angkaAman(data.timestamp),
    waktu_text: data.waktu_text || "-",
    status_node: data.status_node || "unknown",
    qos: normalisasiQos(data.qos || {}),
  };
}

function normalisasiHistory(
  historyObj = {},
  fallbackId = "",
  sumberDefault = "esp32",
) {
  return Object.entries(historyObj)
    .map(([id, item]) => {
      const bagianId = item?.bagian_id || item?.ruang_id || fallbackId;

      return {
        id,
        bagian_id: bagianId,
        ruang_id: bagianId,
        node_id: item?.node_id || "",
        sumber_data: item?.sumber_data || sumberDefault,

        suhu: angkaAman(item?.suhu),
        kelembapan: angkaAman(item?.kelembapan),
        suara_db: angkaAman(item?.suara_db),
        ppm_co: angkaAman(item?.ppm_co),
        asap_flag: angkaAman(item?.asap_flag),
        asap_metric:
          item?.asap_metric !== undefined
            ? angkaAman(item.asap_metric)
            : angkaAman(item?.asap_flag) === 1
              ? 10
              : 0,

        mq2_adc: angkaAman(item?.mq2_adc),
        mq2_delta: angkaAman(item?.mq2_delta),
        mq7_adc: angkaAman(item?.mq7_adc),
        wifi_rssi: angkaAman(item?.wifi_rssi),
        timestamp: angkaAman(item?.timestamp),
        waktu_text: item?.waktu_text || "-",
        qos: normalisasiQos(item?.qos || {}),
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

function normalisasiNodeInfo(
  data = {},
  fallbackId = "",
  sumberDefault = "esp32",
) {
  const bagianId = data.bagian_id || data.ruang_id || fallbackId;

  return {
    bagian_id: bagianId,
    ruang_id: bagianId,
    node_id: data.node_id || "",
    sumber_data: data.sumber_data || sumberDefault,
    last_seen: angkaAman(data.last_seen),
    last_seen_text: data.last_seen_text || "-",
    wifi_rssi: angkaAman(data.wifi_rssi),
    status_node: data.status_node || "unknown",
  };
}

function sumberDefaultDariBagian(bagian) {
  return bagian?.sumber === "dummy" ? "dummy_realtime" : "esp32";
}

function cekOnline(latest) {
  if (!latest?.timestamp) return false;

  const sekarangMs = Date.now();
  const latestMs = latest.timestamp * 1000;
  const selisihMs = sekarangMs - latestMs;

  // Semua sumber dicek agar data lama tidak terlihat seperti masih berjalan.
  return selisihMs >= 0 && selisihMs <= KONFIG_APP.esp32OfflineTimeoutMs;
}

function bentukStateKosong(bagian) {
  const sumberDefault = sumberDefaultDariBagian(bagian);

  return {
    id: bagian.id,
    bagian,
    adaData: false,
    online: false,
    dataKadaluarsa: true,
    latest: normalisasiLatest({}, bagian.id, sumberDefault),
    history: [],
    nodeInfo: normalisasiNodeInfo({}, bagian.id, sumberDefault),
    fuzzy: null,
    kartuParameter: {},
  };
}

function bentukStateRooms(dataBagian = {}) {
  const hasil = {};

  // Hanya baca 16 bagian yang memang ada di TATA_LETAK_BAGIAN.
  // Node lama seperti ruang_1, ruang_2, dst. otomatis diabaikan.
  TATA_LETAK_BAGIAN.forEach((bagian) => {
    const bagianData = dataBagian?.[bagian.id];
    if (!bagianData?.latest) {
      hasil[bagian.id] = bentukStateKosong(bagian);
      return;
    }

    const sumberDefault = sumberDefaultDariBagian(bagian);
    const latest = normalisasiLatest(
      bagianData.latest || {},
      bagian.id,
      sumberDefault,
    );
    const history = normalisasiHistory(
      bagianData.history || {},
      bagian.id,
      sumberDefault,
    );
    const nodeInfo = normalisasiNodeInfo(
      bagianData.node_info || {},
      bagian.id,
      sumberDefault,
    );
    const online = cekOnline(latest);
    const adaData = latest.timestamp > 0;
    const dataKadaluarsa = adaData && !online;

    latest.status_node = online ? "online" : "offline";
    nodeInfo.status_node = online ? "online" : "offline";

    const fuzzy = adaData ? hitungFuzzyRuang(latest) : null;

    hasil[bagian.id] = {
      id: bagian.id,
      bagian,
      adaData,
      online,
      dataKadaluarsa,
      latest,
      history,
      nodeInfo,
      fuzzy,
      kartuParameter: fuzzy?.kartuParameter || {},
    };
  });

  return hasil;
}

export function useDataPerpustakaan({ aktif = true } = {}) {
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const rawDataRef = useRef({});

  useEffect(() => {
    if (KONFIG_APP.gunakanDataDummy) {
      rawDataRef.current = DATA_DUMMY?.perpustakaan || {};
      setRooms(bentukStateRooms(rawDataRef.current));
      setLoading(false);
      return undefined;
    }

    if (!aktif) {
      rawDataRef.current = {};
      setRooms({});
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const db = ambilDatabaseFirebase();
    const dataRef = ref(db, "perpustakaan");

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        rawDataRef.current = snapshot.val() || {};
        setRooms(bentukStateRooms(rawDataRef.current));
        setLoading(false);
      },
      (error) => {
        console.error("Gagal membaca data perpustakaan:", error);
        rawDataRef.current = {};
        setRooms({});
        setLoading(false);
      },
    );

    // Re-render tiap 1 detik supaya status offline berubah walaupun Firebase tidak berubah.
    const offlineTimer = setInterval(() => {
      setRooms(bentukStateRooms(rawDataRef.current || {}));
    }, KONFIG_APP.refreshJamMs);

    return () => {
      unsubscribe();
      clearInterval(offlineTimer);
    };
  }, [aktif]);

  return { rooms, loading };
}
