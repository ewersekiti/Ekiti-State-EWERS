import { useState, useEffect } from "react";
import logo from "../assets/images/ekitiundp.png";
import footerBg from "../assets/images/footer-bg.png";
import {
  FaFacebookF,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaChevronRight,
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const FALLBACK_PARTNERS = [
  "Nigeria Police Force",
  "Nigerian Navy",
  "Department of State Services",
  "Nigeria Security and Civil Defence Corps",
]

const contactItems = [
  { icon: FaMapMarkerAlt, text: "Government of Ekiti State, Nigeria" },
  { icon: FaPhoneAlt, text: "09062547141" },
  { icon: FaEnvelope, text: "ewersekiti@gmail.com" },
  { icon: FaClock, text: "Opening Hours: 24/7" },
];

export default function Footer() {
  const [partners, setPartners] = useState(FALLBACK_PARTNERS)

  useEffect(() => {
    fetch(`${API_BASE}/config/partners?active=true`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data.partners?.length > 0) {
          setPartners(data.partners.map((p) => p.name))
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  return (
    <footer>
      {/* Main footer body */}
      <div className="relative bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 px-6 md:px-20 pt-16 pb-10 overflow-hidden">
        {/* Background watermark */}
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover pointer-events-none opacity-5"
          style={{ backgroundImage: `url(${footerBg})` }}
        />

        {/* Top gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-500 via-blue-400 to-green-500" />

        <div className="relative z-10 grid md:grid-cols-3 gap-12 max-w-6xl mx-auto pb-10 border-b border-white/10">

          {/* Column 1: Logo + description + socials */}
          <div>
            <img src={logo} className="h-16 mb-5 brightness-125" alt="Ekiti State & UNDP" />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Ekiti State Early Warning and Early Response System — dedicated to monitoring,
              mitigating and preventing conflicts for peaceful co-existence in Ekiti State.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-600 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              >
                <FaFacebookF size={13} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-sky-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              >
                <FaTwitter size={13} />
              </a>
            </div>
          </div>

          {/* Column 2: Our Partners */}
          <div>
            <h4 className="text-white font-bold mb-5 text-base">Our Partners</h4>
            <ul className="space-y-2.5">
              {partners.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors cursor-default text-sm group"
                >
                  <FaChevronRight
                    size={9}
                    className="text-green-600 group-hover:translate-x-1 transition-transform shrink-0"
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-5 text-base">Contact Info</h4>
            <ul className="space-y-4">
              {contactItems.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-400">
                  <div className="w-7 h-7 bg-green-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="text-green-400" size={12} />
                  </div>
                  <span className="hover:text-gray-300 transition-colors leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Copyright bar */}
        <div className="relative z-10 mt-8 text-center">
          <p className="text-gray-500 text-xs mb-4">
            © {new Date().getFullYear()} Ekiti State Early Warning and Early Response System.
            All rights reserved.
          </p>
          <a href="https://kikiotolu.com/web-design-nigeria" className="text-gray-500 text-xs">Kikiotolu Solutions</a>
        </div>
      </div>
    </footer>
  );
}
