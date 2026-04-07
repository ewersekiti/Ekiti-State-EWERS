import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import imgfaq from "../assets/images/faqs.png";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const FALLBACK_FAQS = [
  { q: "What is the Early Warning and Early Response System?", a: "The Ekiti State Early Warning and Early Response System (EWERS EKITI) is a government initiative to prevent and minimize violence and unrest in Ekiti State. It provides a grassroots-based intelligence gathering system to assist security agencies in preventing and responding effectively to incidents.", category: "General" },
  { q: "How can I be part of the Early Warning System?", a: "Residents of Ekiti State can help security agencies save lives, prevent and manage conflicts by providing timely and accurate intelligence through any of our reporting channels.", category: "Participation" },
  { q: "How do I report an incident?", a: "You can report an incident via our website by clicking 'Report Incident', via our mobile app (available on Android and iPhone), by calling 08062547143 to speak with a call center agent, or via SMS to 08168007000.", category: "Reporting" },
  { q: "What types of incidents can I report?", a: "Armed Attacks, Banditry, Boundary Disputes, Cattle Rustling, Chieftaincy Tussles, Community Aggression, Criminal Activity, Cross-border Conflicts, Destruction of Property, Gender-based Violence, Inter-ethnic Disputes, Land Disputes, Political Conflicts, Protests, Terrorism, and more.", category: "Reporting" },
  { q: "How do I use the SMS channel to report?", a: "Send an SMS to 08168007000 using the format: EKITI [your name], [location], [incident description].\n\nExample: EKITI Michael, Emure, There is an ongoing protest here.", category: "SMS" },
  { q: "How fast do security agencies respond?", a: "The typical response time is between 5–30 minutes. When we receive an incident alert at the control room, instant alerts are sent to responders who move immediately.", category: "Response" },
  { q: "Where is EWERS EKITI located?", a: "EWERS EKITI is located in a secured but undisclosed location to ensure the safety and integrity of the response operation.", category: "General" },
]

const CATEGORY_COLORS = {
  General: "bg-blue-100 text-blue-700",
  Participation: "bg-purple-100 text-purple-700",
  Reporting: "bg-green-100 text-green-700",
  SMS: "bg-orange-100 text-orange-700",
  Response: "bg-red-100 text-red-700",
  Other: "bg-gray-100 text-gray-600",
}

export default function FAQ() {
  const [open, setOpen]   = useState(null)
  const [faqs, setFaqs]   = useState(FALLBACK_FAQS.map((f) => ({ q: f.q, a: f.a, category: f.category })))

  useEffect(() => {
    fetch(`${API_BASE}/config/faqs?active=true`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data.faqs?.length > 0) {
          setFaqs(data.faqs.map((f) => ({ q: f.question, a: f.answer, category: f.category })))
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  return (
    <section className="py-24 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-badge">FAQs</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about EWERS EKITI and how to use the system.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12 items-start">

          {/* Image + support card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 hidden md:block sticky top-32"
          >
            <div className="relative">
              <div className="absolute inset-4 bg-linear-to-br from-green-100 to-blue-100 rounded-3xl" />
              <img src={imgfaq} className="relative rounded-3xl shadow-xl w-full" alt="FAQ illustration" />
            </div>
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-gray-800 font-semibold text-sm mb-1">Still have questions?</p>
              <p className="text-gray-400 text-xs mb-4">Our support team is available 24/7.</p>
              <a href="mailto:ekitistateresponse@gmail.com"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                Contact Support
              </a>
            </div>
          </motion.div>

          {/* Accordion */}
          <div className="md:col-span-3 space-y-3">
            {faqs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  open === i ? "border-green-200 shadow-md shadow-green-500/5" : "border-gray-100 shadow-sm hover:border-green-100 hover:shadow-md"
                }`}
              >
                <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                      {item.category}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm leading-tight">{item.q}</span>
                  </div>
                  <span className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${open === i ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {open === i ? <FiMinus size={14} /> : <FiPlus size={14} />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div key="answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed whitespace-pre-line border-t border-gray-50 pt-3">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
