import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { KONFIG_APP } from "../fuzzy/aturanFuzzy";
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

function normalisasiLatest(data = {}) {
  return {
    ruang_id: data.ruang_id || "",
    node_id: data.node_id || "",
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

function normalisasiHistory(historyObj = {}) {
  return Object.entries(historyObj)
    .map(([id, item]) => ({
      id,
      ruang_id: item?.ruang_id || "",
      node_id: item?.node_id || "",
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
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function normalisasiNodeInfo(data = {}) {
  return {
    ruang_id: data.ruang_id || "",
    node_id: data.node_id || "",
    last_seen: angkaAman(data.last_seen),
    last_seen_text: data.last_seen_text || "-",
    wifi_rssi: angkaAman(data.wifi_rssi),
    status_node: data.status_node || "unknown",
  };
}

function bentukStateRooms(dataRuangan = {}) {
  const hasil = {};

  Object.entries(dataRuangan).forEach(([roomId, roomData]) => {
    const latest = normalisasiLatest(roomData?.latest || {});
    const history = normalisasiHistory(roomData?.history || {});
    const nodeInfo = normalisasiNodeInfo(roomData?.node_info || {});
    const fuzzy = hitungFuzzyRuang(latest);

    hasil[roomId] = {
      latest,
      history,
      nodeInfo,
      fuzzy,
      kartuParameter: fuzzy.kartuParameter,
    };
  });

  return hasil;
}

export function useDataPerpustakaan({ aktif = true } = {}) {
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // mode dummy tetap langsung jalan
    if (KONFIG_APP.gunakanDataDummy) {
      const hasil = bentukStateRooms(DATA_DUMMY?.perpustakaan || {});
      setRooms(hasil);
      setLoading(false);
      return;
    }

    // kalau belum boleh aktif (misal belum login), jangan subscribe
    if (!aktif) {
      setRooms({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const db = ambilDatabaseFirebase();
    const dataRef = ref(db, "perpustakaan");

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const hasil = bentukStateRooms(data);
        setRooms(hasil);
        setLoading(false);
      },
      (error) => {
        console.error("Gagal membaca data perpustakaan:", error);
        setRooms({});
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [aktif]);

  return { rooms, loading };
}
