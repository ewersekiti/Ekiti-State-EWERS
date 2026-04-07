import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaFacebookF,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ekiti from "../assets/images/ekitiundp.png";

const navLinks = ["Home", "About", "Report Incident", "Partners", "FAQs"];

// Links that route to a dedicated page instead of a hash anchor
const PAGE_ROUTES = {
  "Report Incident": "/report",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed w-full z-50">
      {/* Top Bar */}
      <div className="bg-linear-to-r from-green-800 to-green-700 text-white text-xs px-6 md:px-20 py-2.5 flex justify-between items-center">
        <div className="hidden md:flex gap-5 items-center">
          <span className="flex items-center gap-1.5 hover:text-green-200 transition-colors cursor-default">
            <FaEnvelope className="text-green-300 shrink-0" />
            ewersekiti@gmail.com
          </span>
          <span className="text-green-600">|</span>
          <span className="flex items-center gap-1.5 hover:text-green-200 transition-colors cursor-default">
            <FaPhone className="text-green-300 shrink-0" />
            09062547141
          </span>
          <span className="text-green-600">|</span>
          <span className="flex items-center gap-1.5 cursor-default">
            <FaMapMarkerAlt className="text-green-300 shrink-0" />
            Government House, Ado-Ekiti, Ekiti State
          </span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span className="flex items-center gap-1.5">
            <FaClock className="text-green-300" />
            <span className="font-semibold">24/7 Response</span>
          </span>
          <div className="flex gap-2">
            <button className="w-6 h-6 rounded-full bg-green-600/50 hover:bg-sky-500 flex items-center justify-center transition-all duration-200">
              <FaXTwitter size={11} />
            </button>
            <button className="w-6 h-6 rounded-full bg-green-600/50 hover:bg-blue-600 flex items-center justify-center transition-all duration-200">
              <FaFacebookF size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div
        className={`transition-all duration-300 px-6 md:px-20 py-3 flex justify-between items-center ${
          scrolled
            ? "bg-white shadow-lg shadow-black/5"
            : "bg-white/95 backdrop-blur-md"
        }`}
      >
        <img src={ekiti} className="h-14 md:h-16 cursor-pointer" alt="Ekiti State" />

        {/* Desktop Links */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((item) => {
            const route = PAGE_ROUTES[item];
            const cls = "relative text-sm font-medium text-gray-700 hover:text-green-700 transition-colors group py-1";
            const underline = <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300 rounded-full" />;
            return route ? (
              <Link key={item} to={route} className={cls}>
                {item}{underline}
              </Link>
            ) : (
              <a key={item} href={`/#${item.toLowerCase().replace(/\s+/g, "-")}`} className={cls}>
                {item}{underline}
              </a>
            );
          })}
        </nav>

        {/* Login Button */}
        <Link
          to="/login"
          className="hidden md:flex items-center gap-2 bg-linear-to-r from-green-600 to-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          Portal Login
        </Link>

        {/* Mobile Toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-white border-t border-gray-100 shadow-xl md:hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((item, i) => {
                const route = PAGE_ROUTES[item];
                const sharedCls = "py-3 px-4 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all font-medium text-sm";
                return route ? (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={route} className={sharedCls} onClick={() => setOpen(false)}>
                      {item}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.a
                    key={item}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    href={`/#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className={sharedCls}
                    onClick={() => setOpen(false)}
                  >
                    {item}
                  </motion.a>
                );
              })}
              <Link to="/login" className="mt-2 btn-primary text-sm text-center" onClick={() => setOpen(false)}>
                Portal Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
