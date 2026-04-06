import { motion } from "framer-motion";
import about from "../assets/images/about1.png";
import round from "../assets/images/round.png";
import { FaCheckCircle } from "react-icons/fa";

const stats = [
  { value: "16", label: "LGAs" },
  { value: "5,887", label: "Sq. KM Area" },
  { value: "2.4M+", label: "Population" },
  { value: "1996", label: "Year Founded" },
];

const highlights = [
  "Dedicated early warning intelligence system",
  "Partnership with federal security agencies",
  "Community-based conflict prevention approach",
];

export default function About() {
  return (
    <section className="py-24 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center order-2 md:order-1"
        >
          <div className="relative w-full max-w-md">
            {/* Decorative background blob */}
            <div className="absolute -inset-4 bg-linear-to-br from-green-100 to-blue-100 rounded-[40px] -rotate-3" />
            <img src={round} alt="" className="relative w-full" />
            <img
              src={about}
              alt="About Ekiti State"
              className="absolute inset-0 w-full h-full object-contain p-6"
            />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-4 right-4 md:right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-700 font-black text-xs">24/7</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Always Active</p>
              <p className="text-gray-400 text-xs">Emergency Response</p>
            </div>
          </div>
        </motion.div>

        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-1 md:order-2"
        >
          <span className="section-badge">About Us</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mt-4 mb-5">
            Ekiti State —{" "}
            <span className="text-green-700">Heart of Nigeria</span>
          </h2>

          <p className="text-gray-600 leading-relaxed mb-6">
            Located between longitudes 4°51′ and 5°45′ East of the Greenwich meridian and
            latitudes 7°15′ and 8°5′ north of the Equator, Ekiti State lies south of Kwara
            and Kogi State, East of Osun State, and is bounded by Ondo State. With a total
            land area of 5,887.89 sq km, the state has 16 Local Government Councils.
          </p>

          <div className="space-y-3 mb-8">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500 shrink-0" size={16} />
                <span className="text-gray-700 text-sm font-medium">{h}</span>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:border-green-200 hover:bg-green-50/40 transition-colors"
              >
                <div className="text-2xl font-extrabold text-green-700">{value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
