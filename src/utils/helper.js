export function angkaAman(value, fallback = 0) {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : fallback;
}

export function formatTanggalJam(date) {
  const d = new Date(date);
  const hari = String(d.getDate()).padStart(2, "0");
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const jam = String(d.getHours()).padStart(2, "0");
  const menit = String(d.getMinutes()).padStart(2, "0");
  const detik = String(d.getSeconds()).padStart(2, "0");

  return {
    tanggal: `${hari}/${bulan}`,
    jam: `${jam}:${menit}:${detik}`,
  };
}

export function ambilToneStatus(status) {
  if (status === "Nyaman") return "baik";
  if (status === "Kurang Nyaman") return "peringatan";
  return "buruk";
}

export function kelasToneStatus(tone) {
  if (tone === "baik") {
    return {
      text: "text-green-600",
      softBg: "bg-green-100",
      dot: "bg-green-500",
    };
  }

  if (tone === "peringatan") {
    return {
      text: "text-amber-600",
      softBg: "bg-amber-100",
      dot: "bg-amber-500",
    };
  }

  return {
    text: "text-red-600",
    softBg: "bg-red-100",
    dot: "bg-red-500",
  };
}

export function ambilAngkaAsap(record = {}) {
  if (record.asap_ppm !== undefined) return angkaAman(record.asap_ppm);
  if (record.asap_metric !== undefined) return angkaAman(record.asap_metric);

  if (record.asap_flag !== undefined) {
    return angkaAman(record.asap_flag) === 1 ? 10 : 0;
  }

  return 0;
}

function normalisasiQos(data = {}) {
  return {
    seq: angkaAman(data.seq),
    sent_at_ms: angkaAman(data.sent_at_ms),
    sample_interval_ms: angkaAman(data.sample_interval_ms),
  };
}

export function normalisasiDataTerbaru(data = {}) {
  return {
    suhu: angkaAman(data.suhu),
    kelembapan: angkaAman(data.kelembapan),
    suara_db: angkaAman(data.suara_db),
    ppm_co: angkaAman(data.ppm_co),
    asap_flag: angkaAman(data.asap_flag),
    asap_metric: ambilAngkaAsap(data),
    timestamp: angkaAman(data.timestamp),
    waktu_text: data.waktu_text || "-",
    qos: normalisasiQos(data.qos || {}),
  };
}

export function normalisasiRiwayat(objekRiwayat = {}) {
  return Object.entries(objekRiwayat)
    .map(([id, item]) => ({
      id,
      suhu: angkaAman(item?.suhu),
      kelembapan: angkaAman(item?.kelembapan),
      suara_db: angkaAman(item?.suara_db),
      ppm_co: angkaAman(item?.ppm_co),
      asap_flag: angkaAman(item?.asap_flag),
      asap_metric: ambilAngkaAsap(item),
      timestamp: angkaAman(item?.timestamp),
      waktu_text: item?.waktu_text || "-",
      qos: normalisasiQos(item?.qos || {}),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function formatInputDate(date = new Date()) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

function formatInputMonth(date = new Date()) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  return `${tahun}-${bulan}`;
}

export function buatFilterDefault() {
  const hariIni = new Date();

  const tujuhHariLalu = new Date(hariIni);
  tujuhHariLalu.setDate(hariIni.getDate() - 6);

  return {
    tanggal: formatInputDate(hariIni),
    tanggalMulai: formatInputDate(tujuhHariLalu),
    tanggalSelesai: formatInputDate(hariIni),
    bulan: formatInputMonth(hariIni),
  };
}

function awalHari(tanggal) {
  const d = new Date(`${tanggal}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function akhirHari(tanggal) {
  const d = new Date(`${tanggal}T23:59:59`);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function filterRiwayatByPeriode(riwayat, periode, filterTanggal = {}) {
  if (!riwayat?.length) return [];

  if (periode === "hari") {
    const tanggal = filterTanggal.tanggal || formatInputDate(new Date());
    const awal = awalHari(tanggal);
    const akhir = akhirHari(tanggal);

    return riwayat.filter((item) => {
      const waktu = angkaAman(item.timestamp) * 1000;
      return waktu >= awal && waktu <= akhir;
    });
  }

  if (periode === "kustom") {
    const mulai = filterTanggal.tanggalMulai || formatInputDate(new Date());
    const selesai = filterTanggal.tanggalSelesai || formatInputDate(new Date());

    const awal = awalHari(mulai);
    const akhir = akhirHari(selesai);

    return riwayat.filter((item) => {
      const waktu = angkaAman(item.timestamp) * 1000;
      return waktu >= awal && waktu <= akhir;
    });
  }

  const bulanDipilih = filterTanggal.bulan || formatInputMonth(new Date());
  const [tahun, bulan] = bulanDipilih.split("-").map(Number);

  const awalBulan = new Date(tahun, bulan - 1, 1, 0, 0, 0, 0).getTime();
  const akhirBulan = new Date(tahun, bulan, 0, 23, 59, 59, 999).getTime();

  return riwayat.filter((item) => {
    const waktu = angkaAman(item.timestamp) * 1000;
    return waktu >= awalBulan && waktu <= akhirBulan;
  });
}

export function kelompokkanGrafik(riwayat, field, periode) {
  if (!riwayat?.length) return [];

  if (periode === "hari") {
    return riwayat.map((item) => ({
      label: new Date(item.timestamp * 1000).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: angkaAman(item[field]),
    }));
  }

  const map = new Map();

  for (const item of riwayat) {
    const d = new Date(item.timestamp * 1000);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    if (!map.has(key)) {
      map.set(key, {
        tanggal: d,
        total: 0,
        jumlah: 0,
      });
    }

    const data = map.get(key);
    data.total += angkaAman(item[field]);
    data.jumlah += 1;
  }

  return Array.from(map.values())
    .sort((a, b) => a.tanggal - b.tanggal)
    .map((item) => ({
      label: item.tanggal.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: item.total / item.jumlah,
    }));
}

export function hitungStatistik(dataGrafik) {
  if (!dataGrafik?.length) {
    return {
      rataRata: 0,
      tertinggi: 0,
      terendah: 0,
    };
  }

  const nilai = dataGrafik.map((item) => angkaAman(item.value));
  const total = nilai.reduce((a, b) => a + b, 0);

  return {
    rataRata: total / nilai.length,
    tertinggi: Math.max(...nilai),
    terendah: Math.min(...nilai),
  };
}
