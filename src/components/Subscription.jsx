import { motion } from "framer-motion";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaBell } from "react-icons/fa";

const contactItems = [
  { icon: FaEnvelope, label: "Email", value: "ewersekiti@gmail.com" },
  { icon: FaPhoneAlt, label: "Phone", value: "09062547141" },
  { icon: FaMapMarkerAlt, label: "Address", value: "Government of Ekiti State, Nigeria" },
];

export default function Subscription() {
  return (
    <section className="py-24 px-6 md:px-20 bg-gray-50/60">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-badge">Stay Informed</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4">
            Subscribe for Incident Alerts
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto leading-relaxed">
            Get timely notifications about incidents and emergency alerts in your area.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-linear-to-br from-green-700 to-green-900 text-white p-8 rounded-3xl shadow-2xl shadow-green-700/20 overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
                <FaBell className="text-green-200" size={20} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Get Instant Alerts</h3>
              <p className="text-green-200/80 text-sm mb-8 leading-relaxed">
                Subscribe to receive real-time notifications about security incidents
                and emergency updates in Ekiti State.
              </p>

              <div className="space-y-4">
                {contactItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="text-green-200" size={13} />
                    </div>
                    <div>
                      <p className="text-green-300 text-xs">{label}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-1">Complete Registration</h3>
            <p className="text-gray-400 text-sm mb-7">Fill the form to subscribe to incident alerts.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  First Name
                </label>
                <input className="input" placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Other Name
                </label>
                <input className="input" placeholder="Doe" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <input className="input" type="email" placeholder="you@example.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <input className="input" type="tel" placeholder="+234 000 000 0000" />
              </div>
              <button
                type="submit"
                className="col-span-2 bg-linear-to-r from-green-600 to-green-700 text-white py-3.5 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:shadow-green-500/30 hover:scale-[1.02] active:scale-100 transition-all duration-300 mt-1 cursor-pointer"
              >
                Subscribe Now
              </button>
            </div>

            <p className="text-gray-400 text-xs text-center mt-4">
              Your information is secure. We never share your data.
            </p>
          </motion.form>

        </div>
      </div>
    </section>
  );
}
