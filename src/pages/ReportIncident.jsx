import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  FaFileAlt,
  FaUser,
  FaUsers,
  FaCamera,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCloudUploadAlt,
  FaCrosshairs,
  FaSpinner,
  FaChevronDown,
} from "react-icons/fa";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Incident Details", icon: FaFileAlt },
  { id: 2, label: "Reporter Info", icon: FaUser },
  { id: 3, label: "Context", icon: FaUsers },
  { id: 4, label: "Evidence", icon: FaCamera },
  { id: 5, label: "Status", icon: FaExclamationTriangle },
  { id: 6, label: "Consent", icon: FaShieldAlt },
];

const INCIDENT_TYPES = ["Theft", "Assault", "Fraud", "Accident", "Fire", "Other"];

const EKITI_LGAS = [
  "Ado-Ekiti",
  "Efon",
  "Ekiti East",
  "Ekiti South-West",
  "Ekiti West",
  "Emure",
  "Gbonyin",
  "Ijero",
  "Ikere",
  "Ikole",
  "Ilejemeje",
  "Irepodun/Ifelodun",
  "Ise/Orun",
  "Moba",
  "Oye",
  "Ido/Osi",
];

const EKITI_LCDAS = [
  "Ado Central LCDA",
  "Ado North LCDA",
  "Ado West LCDA",
  "Ajoni LCDA",
  "Araromi LCDA",
  "Ekameta LCDA",
  "Ekiti Southeast LCDA",
  "Ero LCDA",
  "Gbonyin LCDA",
  "Ifedara LCDA",
  "Ifeloju LCDA",
  "Ifesowapo LCDA",
  "Igbara Odo/Ogotun LCDA",
  "Ikere West LCDA",
  "Ikole West LCDA",
  "Irede LCDA",
  "Irewolede LCDA",
  "Isokan LCDA",
  "Okemesi/Ido-Ile LCDA",
];


const initialForm = {
  // Step 1
  title: "", type: "", description: "", dateTime: "",
  lga: "", lcda: "", location: "", latitude: "", longitude: "",
  // Step 2
  anonymous: false, fullName: "", phone: "", email: "",
  // Step 3
  peopleInvolved: "", numberOfPeople: "",
  killed: "", injured: "", displaced: "",
  hasInjuryOrDamage: null, injuryDetails: "", authorityContacted: null,
  // Step 4
  images: [], documents: [],
  // Step 5
  isOngoing: null,
  // Step 6
  accuracyConfirmed: false, dataConsent: false,
};

// ─── Reusable sub-components ──────────────────────────────────────────────────

function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${checked ? "bg-green-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

function ChoiceGroup({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ v, l }) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(v)}
          className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
            value === v
              ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-500/20"
              : "bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <div
      onClick={onChange}
      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        checked ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200 hover:border-green-200"
      }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
        checked ? "bg-green-600 border-green-600" : "bg-white border-gray-300"
      }`}>
        {checked && <FaCheck size={9} className="text-white" />}
      </div>
      <div>{children}</div>
    </div>
  );
}

function FileDropZone({ accept, multiple, files, onAdd, onRemove, label, icon: Icon }) {
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    onAdd(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all duration-200 group"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => onAdd(Array.from(e.target.files))}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <Icon className="text-green-600 text-xl" />
          </div>
          <p className="text-sm font-medium text-gray-600 group-hover:text-green-700 transition-colors">{label}</p>
          <p className="text-xs text-gray-400">Click to browse or drag & drop here</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="text-xs text-green-700 font-medium max-w-[130px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="text-green-400 hover:text-red-500 transition-colors"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Address autocomplete + optional GPS detect
function LocationField({ value, onChange, onCoords, latitude, longitude }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop,    setShowDrop]    = useState(false);
  const [searching,   setSearching]   = useState(false);
  const [geoStatus,   setGeoStatus]   = useState("idle"); // idle | loading | success | error
  const [geoError,    setGeoError]    = useState("");
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search Nominatim as user types — biased to Nigeria
  const handleInput = (val) => {
    onChange(val);
    setShowDrop(false);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=ng&limit=6&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDrop(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 450);
  };

  const pickSuggestion = (item) => {
    onChange(item.display_name);
    onCoords(item.lat, item.lon);
    setSuggestions([]);
    setShowDrop(false);
    setGeoStatus("success");
  };

  // Optional GPS detect — still available for devices that support it
  const detect = async () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoStatus("loading");
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        onCoords(coords.latitude.toFixed(6), coords.longitude.toFixed(6));
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          onChange(data.display_name || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
          setGeoStatus("success");
        } catch {
          onChange(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
          setGeoStatus("success");
        }
      },
      (err) => {
        setGeoStatus("error");
        setGeoError(
          err.code === 1
            ? "Location access denied. Please allow permission in your browser settings."
            : "GPS detection unavailable on this device. Please type your address below."
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col gap-2" ref={wrapRef}>
      {/* Input row */}
      <div className="relative">
        <input
          className={`input ${searching ? "pr-36" : "pr-36"}`}
          placeholder="Start typing an address or location name…"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          autoComplete="off"
        />

        {/* Searching spinner inside input */}
        {searching && (
          <FaSpinner className="animate-spin absolute right-32 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        )}

        {/* GPS detect button */}
        <button
          type="button"
          onClick={detect}
          disabled={geoStatus === "loading"}
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            geoStatus === "loading"
              ? "bg-gray-100 text-gray-400 cursor-wait"
              : geoStatus === "success"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
          }`}
        >
          {geoStatus === "loading"
            ? <FaSpinner className="animate-spin" size={11} />
            : <FaCrosshairs size={11} />}
          {geoStatus === "loading" ? "…" : geoStatus === "success" ? "✓" : "GPS"}
        </button>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showDrop && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-black/5 overflow-hidden z-50"
          >
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onMouseDown={() => pickSuggestion(s)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0 group"
              >
                <FaMapMarkerAlt className="text-green-500 shrink-0 mt-0.5 group-hover:text-green-600" size={12} />
                <span className="text-xs text-gray-700 leading-relaxed line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GPS error */}
      <AnimatePresence>
        {geoStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <FaExclamationCircle className="text-amber-400 shrink-0" size={12} />
              <p className="text-xs text-amber-700">{geoError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coordinates badge */}
      <AnimatePresence>
        {latitude && longitude && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
              <FaCrosshairs className="text-green-500 shrink-0" size={11} />
              <p className="text-xs text-green-700 font-mono font-medium">
                Lat: {Number(latitude).toFixed(6)} &nbsp;|&nbsp; Lng: {Number(longitude).toFixed(6)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function Step1({ form, update }) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Incident Title" required>
        <input
          className="input"
          placeholder="Brief title describing the incident"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </Field>

      <Field label="Incident Type" required>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {INCIDENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("type", type)}
              className={`py-2.5 px-4 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                form.type === type
                  ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-500/20"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Description" required hint="Provide as much detail as possible about what happened">
        <textarea
          className="input resize-none h-28"
          placeholder="Describe the incident in detail..."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <Field label="Date & Time of Incident" required>
        <div className="relative">
          <input
            type="datetime-local"
            className="input"
            value={form.dateTime}
            onChange={(e) => update("dateTime", e.target.value)}
          />
          <FaCalendarAlt className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
        </div>
      </Field>

      <Field label="Local Government Area (LGA)" required>
        <div className="relative">
          <select
            className="input appearance-none pr-10 cursor-pointer"
            value={form.lga}
            onChange={(e) => update("lga", e.target.value)}
          >
            <option value="" disabled>Select an LGA</option>
            {EKITI_LGAS.map((lga) => (
              <option key={lga} value={lga}>{lga}</option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </Field>

      <Field label="Local Council Development Area (LCDA)">
        <div className="relative">
          <select
            className="input appearance-none pr-10 cursor-pointer"
            value={form.lcda}
            onChange={(e) => update("lcda", e.target.value)}
          >
            <option value="">Select an LCDA (optional)</option>
            {EKITI_LCDAS.map((lcda) => (
              <option key={lcda} value={lcda}>{lcda}</option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </Field>

      <Field label="Incident Location" required hint="We'll auto-detect your location — you can edit it if it's not accurate">
        <LocationField
          value={form.location}
          onChange={(val) => update("location", val)}
          onCoords={(lat, lng) => { update("latitude", String(lat)); update("longitude", String(lng)); }}
          latitude={form.latitude}
          longitude={form.longitude}
        />
      </Field>
    </div>
  );
}

function Step2({ form, update }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between p-4 rounded-2xl bg-green-50 border border-green-100">
        <div>
          <p className="text-sm font-bold text-gray-700">Report Anonymously</p>
          <p className="text-xs text-gray-500 mt-0.5">Your personal details will not be attached to this report</p>
        </div>
        <Toggle checked={form.anonymous} onChange={() => update("anonymous", !form.anonymous)} />
      </div>

      <AnimatePresence initial={false}>
        {form.anonymous ? (
          <motion.div
            key="anon-notice"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <FaInfoCircle className="text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700">
                You are reporting anonymously. Your identity will remain fully protected.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reporter-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5 overflow-hidden"
          >
            <Field label="Full Name">
              <input
                className="input"
                placeholder="Your full legal name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Phone Number" required>
                <input
                  type="tel"
                  className="input"
                  placeholder="08XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step3({ form, update }) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="People Involved" hint="Describe victims, suspects, and/or witnesses">
        <textarea
          className="input resize-none h-24"
          placeholder="e.g. Two male suspects in red caps, one female victim in blue dress…"
          value={form.peopleInvolved}
          onChange={(e) => update("peopleInvolved", e.target.value)}
        />
      </Field>

      <Field label="Number of People Involved">
        <input
          type="number"
          min="0"
          className="input"
          placeholder="Approximate number"
          value={form.numberOfPeople}
          onChange={(e) => update("numberOfPeople", e.target.value)}
        />
      </Field>

      {/* ── Casualties block ── */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Casualties & Displacement</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Number Killed">
            <div className="relative">
              <input
                type="number"
                min="0"
                className="input pl-10"
                placeholder="0"
                value={form.killed}
                onChange={(e) => update("killed", e.target.value)}
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </span>
            </div>
          </Field>

          <Field label="Number Injured">
            <div className="relative">
              <input
                type="number"
                min="0"
                className="input pl-10"
                placeholder="0"
                value={form.injured}
                onChange={(e) => update("injured", e.target.value)}
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              </span>
            </div>
          </Field>

          <Field label="Number Displaced">
            <div className="relative">
              <input
                type="number"
                min="0"
                className="input pl-10"
                placeholder="0"
                value={form.displaced}
                onChange={(e) => update("displaced", e.target.value)}
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </span>
            </div>
          </Field>
        </div>
      </div>

      <Field label="Were there Injuries or Property Damage?">
        <div className="flex flex-col gap-3">
          <ChoiceGroup
            value={form.hasInjuryOrDamage}
            onChange={(v) => update("hasInjuryOrDamage", v)}
            options={[{ v: true, l: "Yes" }, { v: false, l: "No" }]}
          />
          <AnimatePresence>
            {form.hasInjuryOrDamage === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  className="input resize-none h-20 mt-1"
                  placeholder="Describe the injuries or property damage in detail…"
                  value={form.injuryDetails}
                  onChange={(e) => update("injuryDetails", e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Field>

      <Field label="Was an Authority Contacted?">
        <ChoiceGroup
          value={form.authorityContacted}
          onChange={(v) => update("authorityContacted", v)}
          options={[{ v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "not_sure", l: "Not Sure" }]}
        />
      </Field>
    </div>
  );
}

function Step4({ form, update }) {
  const addImages   = (f) => update("images",    [...form.images,    ...f]);
  const removeImage = (i) => update("images",    form.images.filter((_,  idx) => idx !== i));
  const addDocs     = (f) => update("documents", [...form.documents, ...f]);
  const removeDoc   = (i) => update("documents", form.documents.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <FaExclamationCircle className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Upload any photos, videos, or documents supporting your report.
          Accepted: JPG, PNG, MP4, PDF. Max 10 MB per file.
        </p>
      </div>

      <Field label="Upload Images / Videos">
        <FileDropZone
          accept="image/*,video/*"
          multiple
          files={form.images}
          onAdd={addImages}
          onRemove={removeImage}
          label="Drag & drop images or videos here"
          icon={FaCamera}
        />
      </Field>

      <Field label="Upload Supporting Documents" hint="Optional — police reports, medical records, etc.">
        <FileDropZone
          accept=".pdf,.doc,.docx"
          multiple
          files={form.documents}
          onAdd={addDocs}
          onRemove={removeDoc}
          label="Drag & drop documents here"
          icon={FaCloudUploadAlt}
        />
      </Field>
    </div>
  );
}

function Step5({ form, update }) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Is this Incident Still Ongoing?">
        <div className="flex flex-col gap-3">
          <ChoiceGroup
            value={form.isOngoing}
            onChange={(v) => update("isOngoing", v)}
            options={[{ v: true, l: "Yes" }, { v: false, l: "No" }]}
          />
          <AnimatePresence>
            {form.isOngoing === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl mt-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <p className="text-sm text-red-700 font-medium">
                    This report will be flagged as active. Authorities will be alerted immediately.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Field>
    </div>
  );
}

function Step6({ form, update }) {
  const casualties = [form.killed, form.injured, form.displaced]
    .map(Number)
    .reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="p-5 bg-green-50 border border-green-100 rounded-2xl">
        <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" /> Report Summary
        </p>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
          {[
            ["Type",         form.type || "—"],
            ["Title",        form.title || "—"],
            ["LGA",          form.lga || "—"],
            ["LCDA",         form.lcda || "—"],
            ["Location",     form.location || "—"],
            ["Casualties",   casualties > 0 ? `${form.killed || 0} killed · ${form.injured || 0} injured · ${form.displaced || 0} displaced` : "None reported"],
            ["Reporting as", form.anonymous ? "Anonymous" : (form.fullName || "—")],
            ["Attachments",  `${form.images.length + form.documents.length} file(s)`],
            ["Latitude",     form.latitude ? Number(form.latitude).toFixed(6) : "—"],
            ["Longitude",    form.longitude ? Number(form.longitude).toFixed(6) : "—"],
          ].map(([k, v]) => (
            <Fragment key={k}>
              <span className="text-gray-500 font-medium">{k}:</span>
              <span className="font-semibold text-gray-700 truncate">{v}</span>
            </Fragment>
          ))}
        </div>
      </div>

      <Checkbox
        checked={form.accuracyConfirmed}
        onChange={() => update("accuracyConfirmed", !form.accuracyConfirmed)}
      >
        <p className="text-sm font-semibold text-gray-700">
          I confirm the information provided is accurate
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Submitting false information is a punishable offence under applicable laws.
        </p>
      </Checkbox>

      <Checkbox
        checked={form.dataConsent}
        onChange={() => update("dataConsent", !form.dataConsent)}
      >
        <p className="text-sm font-semibold text-gray-700">
          I consent to the use of this data for incident resolution
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Your data will be used solely to process and resolve this incident in
          accordance with Ekiti State's privacy policy.
        </p>
      </Checkbox>

      {(!form.accuracyConfirmed || !form.dataConsent) && (
        <p className="text-xs text-center text-gray-400">
          Please check both boxes above to enable submission.
        </p>
      )}
    </div>
  );
}

// ─── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen() {
  const ref = `EKS-${Date.now().toString().slice(-6)}`;
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-32">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.55 }}
          className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 220 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="text-green-600 text-4xl" />
          </motion.div>

          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Report Submitted!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Your incident report has been received and will be reviewed by our
            response team within 24 hours.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Reference: <span className="font-bold text-green-700">{ref}</span>
          </p>

          <div className="flex flex-col gap-3">
            <a href="/" className="btn-primary inline-block">Back to Home</a>
            <a href="/report" className="text-sm text-green-600 font-medium hover:text-green-800 transition-colors">
              Submit another report
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};

export default function ReportIncident() {
  const [step, setStep]         = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm]         = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const goTo = (target) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const next = () => goTo(Math.min(step + 1, STEPS.length));
  const prev = () => goTo(Math.max(step - 1, 1));

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canSubmit = form.accuracyConfirmed && form.dataConsent;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const body = new FormData();
      body.append('channel',            'web');
      body.append('title',              form.title);
      body.append('type',               (form.type || 'other').toLowerCase());
      body.append('description',        form.description);
      body.append('lga',                form.lga);
      body.append('lcda',               form.lcda || '');
      body.append('location',           form.location || '');
      body.append('latitude',           form.latitude || '');
      body.append('longitude',          form.longitude || '');
      body.append('anonymous',          String(form.anonymous));
      body.append('reporter',           form.anonymous ? 'Anonymous' : (form.fullName || 'Unknown'));
      body.append('reporterPhone',      form.phone || '');
      body.append('reporterEmail',      form.email || '');
      body.append('peopleInvolved',     form.peopleInvolved || '');
      body.append('killed',             form.killed || '0');
      body.append('injured',            form.injured || '0');
      body.append('displaced',          form.displaced || '0');
      body.append('injuryDetails',      form.injuryDetails || '');
      body.append('authorityContacted', form.authorityContacted ? 'yes' : 'no');
      body.append('isOngoing',          String(form.isOngoing === true));

      // Attach images and videos
      form.images.forEach((file) => body.append('images', file));
      // Documents go as images field too (backend stores all media together)
      form.documents.forEach((file) => body.append('images', file));

      await api.post('/incidents', body);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, form]);

  if (submitted) return <SuccessScreen />;

  const StepIcon = STEPS[step - 1].icon;
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="pt-36 pb-10 px-6 md:px-20 bg-linear-to-r from-green-800 to-green-700 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-48 bottom-0 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <span className="section-badge bg-white/15 text-white mb-4 inline-block">
            Ekiti State Response System
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Report an Incident
          </h1>
          <p className="text-green-100 text-sm md:text-base max-w-xl mx-auto">
            Complete the form below to report an incident. All information is
            handled securely and confidentially.
          </p>
        </motion.div>
      </div>

      {/* Sticky stepper */}
      <div className="sticky top-[89px] z-40 bg-white shadow-sm border-b border-gray-100 px-6 md:px-20 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center justify-between">
            <div className="absolute inset-x-0 top-4 h-0.5 bg-gray-100 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

            {STEPS.map(({ id, label, icon: Icon }) => {
              const done   = id < step;
              const active = id === step;
              return (
                <button key={id} onClick={() => goTo(id)} className="flex flex-col items-center gap-1.5 z-10 group">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    done   ? "bg-green-600 border-green-600 text-white"
                    : active ? "bg-white border-green-600 text-green-600 shadow-md shadow-green-500/20 scale-110"
                             : "bg-white border-gray-200 text-gray-400 group-hover:border-green-300"
                  }`}>
                    {done ? <FaCheck size={10} /> : <Icon size={11} />}
                  </div>
                  <span className={`hidden md:block text-xs font-medium transition-colors ${
                    active ? "text-green-700" : done ? "text-green-500" : "text-gray-400"
                  }`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="py-10 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">

            {/* Step header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                  <StepIcon className="text-green-600 text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Step {step} of {STEPS.length}
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">
                    {STEPS[step - 1].label}
                  </h2>
                </div>
              </div>
            </div>

            {/* Animated step content */}
            <div className="px-8 py-8 overflow-hidden min-h-[360px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {step === 1 && <Step1 form={form} update={update} />}
                  {step === 2 && <Step2 form={form} update={update} />}
                  {step === 3 && <Step3 form={form} update={update} />}
                  {step === 4 && <Step4 form={form} update={update} />}
                  {step === 5 && <Step5 form={form} update={update} />}
                  {step === 6 && <Step6 form={form} update={update} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation footer */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                  step === 1
                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                    : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 active:scale-95"
                }`}
              >
                <FaChevronLeft size={11} /> Back
              </button>

              <span className="text-xs text-gray-400 font-medium">{step} / {STEPS.length}</span>

              {step < STEPS.length ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 active:scale-95"
                >
                  Next <FaChevronRight size={11} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    canSubmit && !submitting
                      ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? <FaSpinner size={11} className="animate-spin" /> : <FaCheck size={11} />}
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              )}
            </div>
          </div>

          {submitError && (
            <p className="text-center text-xs text-red-500 mt-3">{submitError}</p>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            Need immediate help? Call{" "}
            <span className="font-semibold text-green-600">09062547141</span> · Available 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
