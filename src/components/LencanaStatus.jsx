import { ambilToneStatus, kelasToneStatus } from "../utils/helper";

export default function LencanaStatus({ status }) {
  const tone = ambilToneStatus(status);
  const kelas = kelasToneStatus(tone);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${kelas.softBg} ${kelas.text}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${kelas.dot}`} />
      {status}
    </span>
  );
}
