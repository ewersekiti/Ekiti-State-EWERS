import { motion } from "framer-motion";
import home from "../assets/images/home.jpg";
import { FaShieldAlt, FaChevronDown } from "react-icons/fa";

const stats = [
  { value: "24/7", label: "Emergency Response" },
  { value: "16", label: "Local Govt. Areas" },
  { value: "3M+", label: "Residents Protected" },
  { value: "5–30 min", label: "Response Time" },
];

export default function Hero() {
  return (
    <div className="relative h-[calc(100vh-120px)] min-h-140">
      <img src={home} className="absolute w-full h-full object-cover" alt="Hero" />

      {/* Layered overlays */}
      <div className="absolute inset-0 bg-linear-to-br from-black/75 via-black/55 to-green-900/40" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

      {/* Main content */}
      <div className="relative h-full flex flex-col justify-center px-6 md:px-24 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-2xl"
        >
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 backdrop-blur-sm text-green-300 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
          >
            <FaShieldAlt className="text-green-400" />
            Ekiti State Early Warning System
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white mb-6">
            SEE SOMETHING, SAY SOMETHING,{" "}
            <span className="text-green-400">Don't wait till a crime happens.</span>
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
            A Peaceful Ekiti State is what we need. Don't hold information to yourself.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.a
              href="/report"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-block"
            >
              Report an Incident
            </motion.a>
            <motion.a
              href="#about"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="btn-outline inline-block"
            >
              Learn More
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-md border-t border-white/10"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map(({ value, label }) => (
            <div key={label} className="py-4 px-6 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-green-400">{value}</div>
              <div className="text-white/60 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="absolute bottom-20 right-8 text-white/40 hidden md:block"
      >
        <FaChevronDown size={20} />
      </motion.div>
    </div>
  );
}
