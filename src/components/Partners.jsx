import { motion } from "framer-motion";
import navy from "../assets/images/navy.png";
import army from "../assets/images/army.png";
import civil from "../assets/images/civil.png";
import police from "../assets/images/police.png";

const partners = [
  { src: navy, alt: "Nigerian Navy" },
  { src: army, alt: "Nigerian Army" },
  { src: civil, alt: "Civil Defence" },
  { src: police, alt: "Nigeria Police" },
];

export default function Partners() {
  return (
    <section className="bg-linear-to-br from-blue-950 via-blue-900 to-blue-950 py-16 px-6 md:px-20">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-2">
            Collaborating Agencies
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Our Security Partners
          </h3>
          <p className="text-blue-300/60 text-sm mt-2 max-w-md mx-auto">
            Working together with Nigeria's finest security agencies to keep Ekiti State safe.
          </p>
        </div>

        {/* Partner logos */}
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4">
          {partners.map(({ src, alt }, i) => (
            <motion.div
              key={alt}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.07, transition: { duration: 0.2 } }}
              className="flex flex-col items-center gap-3 group cursor-default"
            >
              <div className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-300">
                <img
                  src={src}
                  alt={alt}
                  className="h-14 md:h-16 object-contain brightness-90 group-hover:brightness-110 transition-all duration-300"
                />
              </div>
              <span className="text-white/50 text-xs font-medium group-hover:text-white/80 transition-colors">
                {alt}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
