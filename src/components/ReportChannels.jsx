import { FaSms, FaEnvelope } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";

const channels = [
  {
    step: "01",
    icon: <FaSms size={28} />,
    title: "Phone & SMS Channel",
    desc: "Call or SMS us directly to report any incident happening in your area.",
    details: [
      "Call: 09062547141",
      "SMS 08169007000 with EK01, your name, location and incident",
    ],
    iconBg: "bg-linear-to-br from-orange-500 to-amber-500",
    cardBg: "bg-linear-to-br from-orange-50 to-amber-50",
    border: "border-orange-200",
  },
  {
    step: "02",
    icon: <FaEnvelope size={28} />,
    title: "Email Channel",
    desc: "Send a detailed report to our dedicated emergency response email address.",
    details: ["ekitistateresponse@gmail.com"],
    iconBg: "bg-linear-to-br from-green-500 to-emerald-600",
    cardBg: "bg-linear-to-br from-green-50 to-emerald-50",
    border: "border-green-200",
    featured: true,
  },
  {
    step: "03",
    icon: <FaXTwitter size={28} />,
    title: "Twitter / X Channel",
    desc: "Tweet us directly for quick incident reporting via social media.",
    details: ["@ekitistategov"],
    iconBg: "bg-linear-to-br from-sky-500 to-blue-600",
    cardBg: "bg-linear-to-br from-sky-50 to-blue-50",
    border: "border-sky-200",
  },
];

export default function ReportChannels() {
  return (
    <section className="py-24 px-6 md:px-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="section-badge">Report Incident</span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-4">
          How to Report an Incident
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          For Ekiti State to become a peaceful and inclusive state, we need your help.
          Choose any channel below to submit a report.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {channels.map((ch, i) => (
          <motion.div
            key={ch.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`relative ${ch.cardBg} border ${ch.border} rounded-3xl p-7 cursor-pointer group ${
              ch.featured
                ? "ring-2 ring-green-500 shadow-xl shadow-green-500/10"
                : "shadow-sm hover:shadow-lg"
            }`}
          >
            {ch.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                Recommended
              </span>
            )}

            <div className="flex items-start justify-between mb-5">
              <div
                className={`w-14 h-14 rounded-2xl ${ch.iconBg} flex items-center justify-center text-white shadow-md`}
              >
                {ch.icon}
              </div>
              <span className="text-5xl font-black text-gray-100 group-hover:text-gray-200 transition-colors select-none">
                {ch.step}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{ch.title}</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">{ch.desc}</p>

            <div className="space-y-2">
              {ch.details.map((d, j) => (
                <p
                  key={j}
                  className="text-xs font-medium text-gray-700 bg-white/70 rounded-xl px-3 py-2.5 border border-white"
                >
                  {d}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
