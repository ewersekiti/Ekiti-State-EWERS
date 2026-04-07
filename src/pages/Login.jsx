import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import ekiti from "../assets/images/ekitiundp.png";
import heroBg from "../assets/images/home.jpeg";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-green-950/92 via-green-900/82 to-green-800/72" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <Link to="/">
            <img src={ekiti} alt="Ekiti State" className="h-14" />
          </Link>
        </div>

        {/* Centre text */}
        <div className="relative z-10 px-12 pb-4">
          <div className="mb-5 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold tracking-widest uppercase">
            <FaShieldAlt className="text-green-300" />
            Secure Portal
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Ekiti State Emergency{" "}
            <span className="text-green-300">Response Portal</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            Authorised personnel only. Access your dashboard to manage incidents,
            coordinate response teams, and monitor real-time emergency activities
            across Ekiti State.
          </p>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 m-10 mt-8 grid grid-cols-3 gap-4">
          {[
            { value: "16", label: "LGAs Covered" },
            { value: "24/7", label: "Active Monitoring" },
            { value: "100%", label: "Encrypted" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-white/60 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link to="/">
            <img src={ekiti} alt="Ekiti State" className="h-12 mx-auto" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 md:p-10">
            {/* Header */}
            <div className="mb-7">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-4">
                <FaShieldAlt className="text-green-600 text-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Portal Login</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to access the response dashboard
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl overflow-hidden"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@ekitistate.gov.ng"
                    autoComplete="email"
                    required
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white transition-colors focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-9 pr-11 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white transition-colors focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-green-500/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 mt-1"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            This portal is for authorised government personnel only.{" "}
            <Link to="/" className="text-green-600 hover:underline font-medium">
              Return to homepage
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
