import { useState } from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

function ambilPesanError(errorCode = "") {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/missing-password":
      return "Password belum diisi.";
    case "auth/invalid-credential":
      return "Email atau password salah.";
    case "auth/user-disabled":
      return "Akun ini dinonaktifkan.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan login. Coba lagi nanti.";
    default:
      return "Login gagal. Periksa email dan password Anda.";
  }
}

export default function HalamanLogin() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorText("");
    setLoadingSubmit(true);

    try {
      await login(email, password);
    } catch (error) {
      setErrorText(ambilPesanError(error?.code));
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F5FA] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <LogIn className="h-8 w-8" />
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Masuk untuk mengakses sistem monitoring perpustakaan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400"
            />
          </div>

          {errorText ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorText}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full rounded-2xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingSubmit ? "Sedang masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
