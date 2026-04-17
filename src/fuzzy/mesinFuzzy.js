import {
  ATURAN_MAMDANI,
  OUTPUT_KENYAMANAN,
  RULE_PARAMETER,
  RULE_KESELURUHAN,
} from "./aturanFuzzy";

// ======================================================
// FUNGSI DASAR FUZZY
// ======================================================
function trapmf(x, [a, b, c, d]) {
  // bahu kiri
  if (a === b && x <= b) return 1;

  // bahu kanan
  if (c === d && x >= c) return 1;

  // di luar area
  if (x <= a && a !== b) return 0;
  if (x >= d && c !== d) return 0;

  // plateau
  if (x >= b && x <= c) return 1;

  // sisi naik
  if (x > a && x < b) {
    return (x - a) / (b - a);
  }

  // sisi turun
  if (x > c && x < d) {
    return (d - x) / (d - c);
  }

  return 0;
}

function trimf(x, [a, b, c]) {
  if (x === b) return 1;
  if (x <= a || x >= c) return 0;

  if (x > a && x < b) {
    return (x - a) / (b - a);
  }

  if (x > b && x < c) {
    return (c - x) / (c - b);
  }

  return 0;
}

function hitungMembership(x, config) {
  if (config.type === "trap") return trapmf(x, config.points);
  return trimf(x, config.points);
}

function fuzzifikasi(value, himpunan) {
  const hasil = {};

  Object.entries(himpunan).forEach(([key, config]) => {
    hasil[key] = hitungMembership(value, config);
  });

  return hasil;
}

function cariLabelDominan(derajat, himpunan) {
  let bestKey = null;
  let bestValue = -1;

  Object.entries(derajat).forEach(([key, value]) => {
    if (value > bestValue) {
      bestKey = key;
      bestValue = value;
    }
  });

  if (!bestKey) return "-";
  return himpunan[bestKey]?.label || bestKey;
}

function outputMembership(x, keyOutput) {
  const config = OUTPUT_KENYAMANAN[keyOutput];
  return hitungMembership(x, config);
}

function inferensiOutput(ruleMap, derajatInput) {
  const agregasi = {
    tidakNyaman: 0,
    kurangNyaman: 0,
    nyaman: 0,
  };

  Object.entries(ruleMap).forEach(([inputKey, outputKey]) => {
    const alpha = derajatInput[inputKey] || 0;
    agregasi[outputKey] = Math.max(agregasi[outputKey], alpha);
  });

  return agregasi;
}

function centroid(agregasi) {
  let pembilang = 0;
  let penyebut = 0;

  for (let z = 0; z <= 100; z += 1) {
    const mu = Math.max(
      Math.min(agregasi.tidakNyaman, outputMembership(z, "tidakNyaman")),
      Math.min(agregasi.kurangNyaman, outputMembership(z, "kurangNyaman")),
      Math.min(agregasi.nyaman, outputMembership(z, "nyaman")),
    );

    pembilang += z * mu;
    penyebut += mu;
  }

  if (penyebut === 0) return 0;
  return pembilang / penyebut;
}

function labelOutputDariSkor(score) {
  const kandidat = {
    tidakNyaman: outputMembership(score, "tidakNyaman"),
    kurangNyaman: outputMembership(score, "kurangNyaman"),
    nyaman: outputMembership(score, "nyaman"),
  };

  let bestKey = "tidakNyaman";
  let bestValue = -1;

  Object.entries(kandidat).forEach(([key, value]) => {
    if (value > bestValue) {
      bestKey = key;
      bestValue = value;
    }
  });

  return OUTPUT_KENYAMANAN[bestKey].label;
}

// ======================================================
// FUZZY PER PARAMETER
// ======================================================
function prosesFuzzyParameter(value, aturanInput, ruleParameter) {
  const derajat = fuzzifikasi(value, aturanInput);
  const labelInput = cariLabelDominan(derajat, aturanInput);

  const agregasi = inferensiOutput(ruleParameter, derajat);
  const skor = centroid(agregasi);
  const kenyamanan = labelOutputDariSkor(skor);

  return {
    nilai: value,
    derajat,
    label: labelInput,
    kenyamanan,
    skor,
  };
}

// ======================================================
// FUZZY KESELURUHAN
// ======================================================
function prosesFuzzyKeseluruhan(fuzzyParameter) {
  const agregasi = {
    tidakNyaman: 0,
    kurangNyaman: 0,
    nyaman: 0,
  };

  RULE_KESELURUHAN.forEach((rule) => {
    const alpha = Math.min(
      fuzzyParameter.suhu.derajat[rule.suhu] || 0,
      fuzzyParameter.kelembapan.derajat[rule.kelembapan] || 0,
      fuzzyParameter.kebisingan.derajat[rule.kebisingan] || 0,
      fuzzyParameter.asap.derajat[rule.asap] || 0,
      fuzzyParameter.co.derajat[rule.co] || 0,
    );

    agregasi[rule.output] = Math.max(agregasi[rule.output], alpha);
  });

  // fallback supaya kombinasi di luar 30 rule tetap punya hasil logis
  agregasi.tidakNyaman = Math.max(
    agregasi.tidakNyaman,
    fuzzyParameter.asap.derajat.terdeteksiAsap || 0,
    fuzzyParameter.co.derajat.coTinggi || 0,
    fuzzyParameter.kebisingan.derajat.kebisinganTinggi || 0,
    fuzzyParameter.suhu.derajat.dingin || 0,
    fuzzyParameter.suhu.derajat.panas || 0,
    fuzzyParameter.kelembapan.derajat.terlaluKering || 0,
    fuzzyParameter.kelembapan.derajat.terlaluLembab || 0,
  );

  agregasi.kurangNyaman = Math.max(
    agregasi.kurangNyaman,
    fuzzyParameter.suhu.derajat.hangat || 0,
    fuzzyParameter.kebisingan.derajat.kebisinganRendah || 0,
    fuzzyParameter.co.derajat.coRendah || 0,
  );

  agregasi.nyaman = Math.max(
    agregasi.nyaman,
    Math.min(
      Math.max(
        fuzzyParameter.suhu.derajat.nyaman || 0,
        fuzzyParameter.suhu.derajat.sejuk || 0,
      ),
      fuzzyParameter.kelembapan.derajat.nyaman || 0,
      fuzzyParameter.kebisingan.derajat.nyaman || 0,
      fuzzyParameter.asap.derajat.nyaman || 0,
      fuzzyParameter.co.derajat.nyaman || 0,
    ),
  );

  const skor = centroid(agregasi);
  const kenyamananTotal = labelOutputDariSkor(skor);

  return {
    agregasi,
    skor,
    kenyamananTotal,
  };
}

function buatKartuParameter(data, hasil) {
  return {
    suhu: {
      tampil: `${Number(data.suhu || 0).toFixed(1)}°C`,
      status: hasil.suhu.kenyamanan,
      detail: hasil.suhu.label,
    },
    kelembapan: {
      tampil: `${Number(data.kelembapan || 0).toFixed(1)}%`,
      status: hasil.kelembapan.kenyamanan,
      detail: hasil.kelembapan.label,
    },
    kebisingan: {
      tampil: `${Number(data.suara_db || 0).toFixed(1)} dB`,
      status: hasil.kebisingan.kenyamanan,
      detail: hasil.kebisingan.label,
    },
    asap: {
      tampil: `${Number(data.asap_metric || 0).toFixed(1)} ppm`,
      status: hasil.asap.kenyamanan,
      detail: hasil.asap.label,
    },
    kualitasUdara: {
      tampil: `${Number(data.ppm_co || 0).toFixed(1)} ppm`,
      status: hasil.co.kenyamanan,
      detail: hasil.co.label,
    },
  };
}

export function hitungFuzzyRuang(data) {
  const hasilParameter = {
    suhu: prosesFuzzyParameter(
      Number(data?.suhu || 0),
      ATURAN_MAMDANI.suhu,
      RULE_PARAMETER.suhu,
    ),
    kelembapan: prosesFuzzyParameter(
      Number(data?.kelembapan || 0),
      ATURAN_MAMDANI.kelembapan,
      RULE_PARAMETER.kelembapan,
    ),
    kebisingan: prosesFuzzyParameter(
      Number(data?.suara_db || 0),
      ATURAN_MAMDANI.kebisingan,
      RULE_PARAMETER.kebisingan,
    ),
    asap: prosesFuzzyParameter(
      Number(data?.asap_metric ?? data?.asap_flag ?? 0),
      ATURAN_MAMDANI.asap,
      RULE_PARAMETER.asap,
    ),
    co: prosesFuzzyParameter(
      Number(data?.ppm_co || 0),
      ATURAN_MAMDANI.co,
      RULE_PARAMETER.co,
    ),
  };

  const keseluruhan = prosesFuzzyKeseluruhan(hasilParameter);

  const hasilAkhir = {
    ...hasilParameter,
    kenyamananTotal: keseluruhan.kenyamananTotal,
    skorTotal: keseluruhan.skor,
  };

  hasilAkhir.kartuParameter = buatKartuParameter(data, hasilAkhir);

  return hasilAkhir;
}
