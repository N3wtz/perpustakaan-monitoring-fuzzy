import { useEffect, useMemo } from "react";
import { ref, runTransaction, update } from "firebase/database";

import { ambilDatabaseFirebase } from "../firebase/konfigurasiFirebase";
import * as aturanFuzzy from "../fuzzy/aturanFuzzy";
import { hitungFuzzyRuang } from "../fuzzy/mesinFuzzy";
import {
  KONFIG_NOTIFIKASI,
  DAFTAR_PARAMETER_ALERT,
} from "../notifikasi/konfigNotifikasi";
import { kirimPesanTelegram } from "../notifikasi/telegramService";

const KONFIG_APP = aturanFuzzy.KONFIG_APP || {};
const DAFTAR_BAGIAN =
  aturanFuzzy.TATA_LETAK_BAGIAN || aturanFuzzy.TATA_LETAK_RUANG || [];

function buatInstanceId() {
  return `client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function cariLabelRuang(roomId) {
  return (
    DAFTAR_BAGIAN.find((item) => item.id === roomId)?.label ||
    DAFTAR_BAGIAN.find((item) => item.id === roomId)?.labelLengkap ||
    roomId
  );
}

function formatNilai(nilai, unit) {
  return `${Number(nilai || 0).toFixed(1)} ${unit}`;
}

function hitungStreakBurukDariHistory(history, parameter) {
  if (!history?.length) return 0;

  let streak = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    const record = history[i];
    const fuzzy = hitungFuzzyRuang(record);
    const status = parameter.ambilStatus(fuzzy);

    if (status === "Tidak Nyaman") {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function apakahBolehKirimTelegram({
  status,
  badStreak,
  lastTelegramStreak,
  telegramAktifWebsite,
}) {
  const threshold = Number(KONFIG_NOTIFIKASI.jumlahBurukBerturutTurut || 3);

  if (!KONFIG_NOTIFIKASI.telegramAktifDariKode) return false;
  if (!telegramAktifWebsite) return false;
  if (status !== "Tidak Nyaman") return false;
  if (badStreak < threshold) return false;

  // Jika Telegram baru dinyalakan saat kondisi sudah buruk,
  // kirim 1 notifikasi pada data baru berikutnya selama streak sudah >= threshold.
  if (!lastTelegramStreak || lastTelegramStreak <= 0) return true;

  // Setelah itu, kirim lagi tiap kelipatan threshold.
  // Contoh threshold 3: streak 3, 6, 9, 12, dst.
  return badStreak - lastTelegramStreak >= threshold;
}

export function useMesinAlert({
  rooms,
  alerts,
  telegramAktifWebsite,
  siapJalankanMesinAlert = true,
}) {
  const instanceId = useMemo(() => buatInstanceId(), []);

  // ======================================================
  // BAGIAN A: MEMBUAT ALERT KE FIREBASE
  // Alert tetap masuk halaman notifikasi website.
  // Telegram hanya dibuat pending jika saklar Telegram sedang aktif.
  // ======================================================
  useEffect(() => {
    if (!siapJalankanMesinAlert) return;

    const db = ambilDatabaseFirebase();

    async function prosesSemuaRoom() {
      const daftarRoom = Object.entries(rooms || {});
      if (!daftarRoom.length) return;

      for (const [roomId, roomData] of daftarRoom) {
        const latest = roomData?.latest;
        const fuzzy = roomData?.fuzzy;
        const history = roomData?.history || [];

        if (!latest?.timestamp || !fuzzy) continue;

        for (const parameter of DAFTAR_PARAMETER_ALERT) {
          const status = parameter.ambilStatus(fuzzy);
          const detail = parameter.ambilDetail(fuzzy);
          const nilaiAngka = parameter.ambilNilai(latest);

          let badStreak = 0;
          let bolehTelegram = false;

          if (KONFIG_APP.gunakanDataDummy) {
            badStreak = hitungStreakBurukDariHistory(history, parameter);

            bolehTelegram = apakahBolehKirimTelegram({
              status,
              badStreak,
              lastTelegramStreak: 0,
              telegramAktifWebsite,
            });
          } else {
            const stateRef = ref(
              db,
              `${KONFIG_NOTIFIKASI.pathMonitoringState}/${roomId}/${parameter.key}`,
            );

            const txResult = await runTransaction(stateRef, (current) => {
              const timestampSekarang = Number(latest.timestamp || 0);

              if (!current) {
                current = {
                  lastTimestamp: 0,
                  badStreak: 0,
                  lastStatus: "Nyaman",
                  lastTelegramStreak: 0,
                };
              }

              // Jangan proses ulang timestamp yang sama atau lebih lama.
              if (Number(current.lastTimestamp || 0) >= timestampSekarang) {
                return current;
              }

              let streakBaru = 0;

              if (status === "Tidak Nyaman") {
                streakBaru =
                  current.lastStatus === "Tidak Nyaman"
                    ? Number(current.badStreak || 0) + 1
                    : 1;
              } else {
                streakBaru = 0;
              }

              const lastTelegramStreakLama =
                status === "Tidak Nyaman"
                  ? Number(current.lastTelegramStreak || 0)
                  : 0;

              const harusKirimTelegram = apakahBolehKirimTelegram({
                status,
                badStreak: streakBaru,
                lastTelegramStreak: lastTelegramStreakLama,
                telegramAktifWebsite,
              });

              return {
                ...current,
                lastTimestamp: timestampSekarang,
                lastStatus: status,
                badStreak: streakBaru,

                // Jika status sudah kembali Nyaman/Kurang Nyaman,
                // reset penanda Telegram agar episode Tidak Nyaman berikutnya bisa kirim lagi.
                lastTelegramStreak:
                  status === "Tidak Nyaman"
                    ? harusKirimTelegram
                      ? streakBaru
                      : lastTelegramStreakLama
                    : 0,

                shouldSendTelegramNow: harusKirimTelegram,
                lastUpdatedBy: instanceId,
                updatedAt: Date.now(),
              };
            });

            const stateAkhir = txResult.snapshot.val();
            if (!stateAkhir) continue;

            if (
              stateAkhir.lastUpdatedBy !== instanceId &&
              Number(stateAkhir.lastTimestamp || 0) ===
                Number(latest.timestamp || 0)
            ) {
              continue;
            }

            badStreak = Number(stateAkhir.badStreak || 0);
            bolehTelegram = Boolean(stateAkhir.shouldSendTelegramNow);
          }

          // Website tetap simpan alert untuk status non-nyaman.
          if (status !== "Nyaman") {
            const alertKey = KONFIG_APP.gunakanDataDummy
              ? `${roomId}_${parameter.key}_dummy_${latest.timestamp}`
              : `${roomId}_${parameter.key}_${latest.timestamp}`;

            const alertRef = ref(
              db,
              `${KONFIG_NOTIFIKASI.pathAlerts}/${alertKey}`,
            );

            await runTransaction(alertRef, (current) => {
              if (current) return current;

              return {
                roomId,
                area: cariLabelRuang(roomId),

                parameterKey: parameter.key,
                parameter: parameter.label,

                nilai: formatNilai(nilaiAngka, parameter.unit),
                nilaiAngka: Number(nilaiAngka || 0),
                unit: parameter.unit,

                detail,
                status,

                waktu: latest.waktu_text || "-",
                timestamp: Number(latest.timestamp || 0),

                dibuatOleh: KONFIG_APP.gunakanDataDummy
                  ? "website_fuzzy_dummy"
                  : "website_fuzzy",
                dibuatPada: Date.now(),

                telegram: {
                  shouldSend: bolehTelegram,
                  status: bolehTelegram ? "pending" : "not_applicable",

                  // Field ini penting agar alert lama yang pending dari kode lama
                  // tidak ikut terkirim menumpuk.
                  createdWhenTelegramActive: Boolean(telegramAktifWebsite),

                  threshold: KONFIG_NOTIFIKASI.jumlahBurukBerturutTurut,
                  currentBadStreak: badStreak,

                  claimedBy: null,
                  claimedAt: null,
                  sentAt: null,
                  sentBy: null,
                  lastError: null,
                },
              };
            });
          }
        }
      }
    }

    prosesSemuaRoom();
  }, [rooms, instanceId, siapJalankanMesinAlert, telegramAktifWebsite]);

  // ======================================================
  // BAGIAN B: KIRIM TELEGRAM DARI ALERT FIREBASE
  // Hanya kirim alert baru yang memang dibuat saat Telegram aktif.
  // Alert lama yang pending dari kode lama tidak dikirim.
  // ======================================================
  useEffect(() => {
    if (!siapJalankanMesinAlert) return;

    const db = ambilDatabaseFirebase();

    async function prosesTelegram() {
      if (!KONFIG_NOTIFIKASI.telegramAktifDariKode) return;
      if (!telegramAktifWebsite) return;
      if (!alerts?.length) return;

      for (const alert of alerts) {
        if (alert?.status !== "Tidak Nyaman") continue;
        if (!alert?.telegram?.shouldSend) continue;
        if (alert?.telegram?.status !== "pending") continue;

        // Mencegah alert pending lama dari kode sebelumnya ikut terkirim.
        if (alert?.telegram?.createdWhenTelegramActive !== true) continue;

        const alertRef = ref(db, `${KONFIG_NOTIFIKASI.pathAlerts}/${alert.id}`);

        const claimResult = await runTransaction(alertRef, (current) => {
          if (!current) return current;
          if (current?.telegram?.status !== "pending") return current;
          if (current?.telegram?.claimedBy) return current;
          if (current?.telegram?.createdWhenTelegramActive !== true)
            return current;

          return {
            ...current,
            telegram: {
              ...current.telegram,
              status: "sending",
              claimedBy: instanceId,
              claimedAt: Date.now(),
            },
          };
        });

        const alertSesudahClaim = claimResult.snapshot.val();
        if (!alertSesudahClaim) continue;

        if (
          alertSesudahClaim?.telegram?.claimedBy !== instanceId ||
          alertSesudahClaim?.telegram?.status !== "sending"
        ) {
          continue;
        }

        const hasilKirim = await kirimPesanTelegram(alertSesudahClaim);

        if (hasilKirim.ok) {
          await update(alertRef, {
            "telegram/status": "sent",
            "telegram/sentAt": Date.now(),
            "telegram/sentBy": instanceId,
            "telegram/lastError": null,
          });
        } else {
          await update(alertRef, {
            "telegram/status": "error",
            "telegram/lastError": hasilKirim.error || "Gagal kirim Telegram",
          });
        }
      }
    }

    prosesTelegram();
  }, [alerts, telegramAktifWebsite, instanceId, siapJalankanMesinAlert]);
}
