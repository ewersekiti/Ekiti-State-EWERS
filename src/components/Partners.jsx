import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import navy  from "../assets/images/navy.png";
import army  from "../assets/images/army.png";
import civil from "../assets/images/civil.png";
import police from "../assets/images/police.png";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const FALLBACK_PARTNERS = [
  { name: "Nigerian Navy",  logoUrl: navy   },
  { name: "Nigerian Army",  logoUrl: army   },
  { name: "Civil Defence",  logoUrl: civil  },
  { name: "Nigeria Police", logoUrl: police },
]

export default function Partners() {
  const [partners, setPartners] = useState(FALLBACK_PARTNERS)

  useEffect(() => {
    fetch(`${API_BASE}/config/partners?active=true`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data.partners?.length > 0) {
          setPartners(data.partners.map((p) => ({ name: p.name, logoUrl: p.logoUrl })))
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  return (
    <section className="bg-linear-to-br from-blue-950 via-blue-900 to-blue-950 py-16">

      {/* Header — constrained width */}
      <div className="px-6 md:px-20 max-w-5xl mx-auto text-center mb-12">
        <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-2">
          Collaborating Agencies
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-white">Our Security Partners</h3>
        <p className="text-blue-300/60 text-sm mt-2 max-w-md mx-auto">
          Working together with Nigeria's finest security agencies to keep Ekiti State safe.
        </p>
      </div>

      {/* Partner logos — full-width scroll container so mobile scroll works */}
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-6 px-6 md:px-20 w-max mx-auto">
          {partners.map(({ name, logoUrl }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.07, transition: { duration: 0.2 } }}
              className="flex flex-col items-center gap-3 group cursor-default shrink-0"
            >
              <div className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-300">
                {logoUrl ? (
                  <img src={logoUrl} alt={name} className="h-14 md:h-16 object-contain brightness-90 group-hover:brightness-110 transition-all duration-300" />
                ) : (
                  <div className="h-14 md:h-16 w-14 md:w-16 flex items-center justify-center text-white/40 text-3xl font-bold">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-white/50 text-xs font-medium group-hover:text-white/80 transition-colors">{name}</span>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}
