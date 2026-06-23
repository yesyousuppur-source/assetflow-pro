'use client'

// ─── AssetFlow Pro — Main App Entry ──────────────────────────
// All screens are in this single file for easy deployment.
// Later split into separate components as the app grows.

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, CheckCircle, XCircle, Plus, QrCode, MapPin,
  Bell, User, Settings, LogOut, ChevronRight, ChevronLeft,
  Camera, Upload, Eye, ArrowRight, Scan, BarChart3,
  Users, FileText, Download, Search, Filter, Moon, Sun,
  Clock, AlertCircle, TrendingUp, Activity, Shield, Star,
  Phone, Building2, Briefcase, Hash, Home, Navigation,
  RefreshCw, Check, X, Zap, Globe, Mail, Edit3,
  MoreVertical, ChevronDown, Target, Award, Layers,
  Send, Box, Route, Radio, Image, Trash2,
  ArrowUpRight, Fingerprint, Lock, Key,
  UserPlus, BadgeCheck, FileDown, Printer, BarChart2,
  PieChart, Calendar, SlidersHorizontal, Info, Wallet,
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
  blue:    "#2563eb",
  blueL:   "#3b82f6",
  blueLighter: "#93c5fd",
  indigo:  "#4f46e5",
  purple:  "#7c3aed",
  green:   "#059669",
  greenL:  "#10b981",
  amber:   "#d97706",
  amberL:  "#f59e0b",
  red:     "#dc2626",
  redL:    "#ef4444",
  navy:    "#0f172a",
  navyM:   "#1e293b",
  navyL:   "#334155",
};

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",    color: C.amberL, bg: "rgba(245,158,11,0.12)"  },
  transit:   { label: "In Transit", color: C.blueL,  bg: "rgba(59,130,246,0.12)" },
  delivered: { label: "Delivered",  color: C.greenL, bg: "rgba(16,185,129,0.12)" },
  rejected:  { label: "Rejected",   color: C.redL,   bg: "rgba(239,68,68,0.12)"  },
};

// ─── MOCK DATA ────────────────────────────────────────────────
const USERS_DATA = [
  { id:1, name:"Arjun Sharma",  code:"EMP001", dept:"Operations", designation:"Senior Manager",  role:"admin",    status:"active"   },
  { id:2, name:"Priya Patel",   code:"EMP023", dept:"Design",     designation:"UI/UX Lead",      role:"employee", status:"active"   },
  { id:3, name:"Rajan Verma",   code:"DRV042", dept:"Logistics",  designation:"Senior Driver",   role:"driver",   status:"active"   },
  { id:4, name:"Meera Singh",   code:"EMP067", dept:"Finance",    designation:"Finance Lead",    role:"employee", status:"inactive" },
];

const TRANSFERS = [
  { id:"TRF-2401", asset:"MacBook Pro 14\"",   assetId:"MBP-001", from:"Arjun S.",  to:"Priya P.",  driver:"Rajan V.", status:"delivered", date:"Today"     },
  { id:"TRF-2402", asset:"Dell Monitor 27\"",  assetId:"DM-0892", from:"Rajan V.",  to:"Dev Team",  driver:"Anil K.",  status:"transit",   date:"Today"     },
  { id:"TRF-2403", asset:"Office Chair Exec",  assetId:"OC-1134", from:"Admin",     to:"CEO Office",driver:"Rajan V.", status:"pending",   date:"Yesterday" },
  { id:"TRF-2404", asset:"iPad Pro 12.9\"",    assetId:"IPD-221", from:"HR Dept.",  to:"Sales Team",driver:"Anil K.",  status:"rejected",  date:"Jun 4"     },
];

const NOTIFS = [
  { id:1, title:"Delivery Accepted",     msg:"Priya Patel accepted MacBook Pro",     time:"2m ago",   type:"success", read:false },
  { id:2, title:"New Transfer Assigned", msg:"Transfer TRF-2402 assigned to you",    time:"15m ago",  type:"info",    read:false },
  { id:3, title:"Delivery Rejected",     msg:"iPad Pro damaged — rejection filed",    time:"3h ago",   type:"danger",  read:true  },
  { id:4, title:"OTP Login Detected",    msg:"New device login from Mumbai",          time:"1d ago",   type:"warning", read:true  },
];

const WEEKLY = [32, 58, 41, 76, 62, 88, 54];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun"];

// ─── TYPES ────────────────────────────────────────────────────
interface ToastItem { id: number; msg: string; type: string; }
interface StaffData  { name: string; phone: string; dept: string; designation: string; role: string; }

// ─── ATOMS ───────────────────────────────────────────────────
function Card({ children, style = {}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <motion.div whileTap={onClick ? { scale: 0.984 } : {}} onClick={onClick}
      style={{ background: "#161B27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden", ...style }}>
      {children}
    </motion.div>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, borderRadius: 8, fontSize: 11, fontWeight: 800, padding: "4px 10px", letterSpacing: "0.04em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
      {label}
    </span>
  );
}

function Ava({ name, color, size = 44, status }: { name: string; color: string; size?: number; status?: string }) {
  const ini = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const isLive = status === "present";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {isLive && (
        <motion.div animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2.4, repeat: Infinity }}
          style={{ position: "absolute", inset: -4, borderRadius: "50%", background: `${color}28` }} />
      )}
      <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${color}dd, ${color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 800, color: "#fff", position: "relative", zIndex: 1 }}>
        {ini}
      </div>
      {status && (
        <div style={{ position: "absolute", bottom: 1, right: 1, width: size * 0.27, height: size * 0.27, borderRadius: "50%", background: status === "active" ? C.greenL : C.redL, border: "2px solid #0F1117", zIndex: 2 }} />
      )}
    </div>
  );
}

function Sk({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <motion.div animate={{ opacity: [0.3, 0.65, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: w, height: h, borderRadius: r, background: "#1E2538" }} />;
}

function ToastComp({ msg, type, onClose }: { msg: string; type: string; onClose: () => void }) {
  const map: Record<string, string> = { success: C.greenL, error: C.redL, info: C.blueL, warning: C.amberL };
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); });
  return (
    <motion.div initial={{ opacity: 0, y: 64, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
      style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#1A1F2E", color: "#fff", padding: "14px 20px", borderRadius: 18, display: "flex", alignItems: "center", gap: 12, minWidth: 288, maxWidth: 340, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", borderLeft: `4px solid ${map[type] || C.blueL}`, fontFamily: "inherit" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: map[type], flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>{msg}</span>
    </motion.div>
  );
}

function PBtn({ children, variant = "primary", onClick, disabled = false, icon: Icon, size = "md" }: {
  children: React.ReactNode; variant?: string; onClick?: () => void;
  disabled?: boolean; icon?: React.ComponentType<{ size: number }>; size?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`, color: "#fff", boxShadow: `0 4px 18px rgba(37,99,235,0.38)`, border: "none" },
    success: { background: `linear-gradient(135deg, ${C.green}, #047857)`, color: "#fff", boxShadow: `0 4px 16px rgba(5,150,105,0.35)`, border: "none" },
    danger:  { background: `linear-gradient(135deg, ${C.red}, #b91c1c)`, color: "#fff", boxShadow: `0 4px 16px rgba(220,38,38,0.3)`, border: "none" },
    ghost:   { background: `rgba(37,99,235,0.07)`, color: C.blueL, border: "none" },
    outline: { background: "transparent", color: C.blueL, border: `1.5px solid ${C.blueL}60` },
  };
  const sz: Record<string, React.CSSProperties> = {
    sm: { padding: "9px 16px", fontSize: 13, borderRadius: 12 },
    md: { padding: "15px 22px", fontSize: 14, borderRadius: 14 },
    lg: { padding: "18px 28px", fontSize: 16, borderRadius: 16 },
  };
  return (
    <motion.button whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={!disabled ? onClick : undefined}
      style={{ ...styles[variant], ...sz[size], fontWeight: 800, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontFamily: "inherit" }}>
      {Icon && <Icon size={size === "lg" ? 20 : 16} />}
      {children}
    </motion.button>
  );
}

function Inp({ label, value, onChange, placeholder, icon: Icon, type = "text", prefix, helper }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string;
  icon?: React.ComponentType<{ size: number; style?: React.CSSProperties }>; type?: string; prefix?: string; helper?: string;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {Icon && <Icon size={17} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: foc ? C.blueL : "#475569", zIndex: 1 }} />}
        {prefix && <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 15, fontWeight: 700, zIndex: 1 }}>{prefix}</span>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{ width: "100%", padding: `15px 16px 15px ${Icon ? "46px" : prefix ? "46px" : "16px"}`, fontSize: 15, borderRadius: 14, fontFamily: "inherit", color: "#E2E8F0", background: foc ? "#1E2538" : "#161B27", border: `2px solid ${foc ? C.blue : "rgba(255,255,255,0.08)"}`, outline: "none", transition: "all 0.2s", boxSizing: "border-box" as const }} />
      </div>
      {helper && <p style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{helper}</p>}
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────
function BottomNav({ screen, go, unread = 0 }: { screen: string; go: (s: string) => void; unread?: number }) {
  const items = [
    { id: "home",    icon: Home,   label: "Home"     },
    { id: "transfers",icon: Route, label: "Transfers"},
    { id: "newTransfer", icon: Plus, label: "", fab: true },
    { id: "alerts",  icon: Bell,   label: "Alerts",  badge: unread },
    { id: "profile", icon: User,   label: "Profile"  },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(10,12,18,0.96)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6px 0 20px", zIndex: 100, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
      {items.map(item => {
        if ((item as { fab?: boolean }).fab) return (
          <motion.button key={item.id} whileTap={{ scale: 0.86 }} onClick={() => go("newTransfer")}
            style={{ width: 56, height: 56, borderRadius: "50%", marginBottom: 8, background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px rgba(37,99,235,0.45)` }}>
            <Plus size={26} color="#fff" />
          </motion.button>
        );
        const active = screen === item.id;
        const badge = (item as { badge?: number }).badge;
        return (
          <motion.button key={item.id} whileTap={{ scale: 0.86 }} onClick={() => go(item.id)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 14px", position: "relative" }}>
            {badge && badge > 0 ? (
              <div style={{ position: "absolute", top: 2, right: 6, width: 17, height: 17, borderRadius: "50%", background: C.redL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>{badge}</span>
              </div>
            ) : null}
            <div style={{ width: 44, height: 30, borderRadius: 14, background: active ? `${C.blue}25` : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <item.icon size={21} color={active ? "#93c5fd" : "#475569"} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 800 : 500, color: active ? "#93c5fd" : "#475569" }}>{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(x => x - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  const send = () => { if (phone.length < 10) return; setLoading(true); setTimeout(() => { setLoading(false); setStep(2); setTimer(30); }, 1400); };
  const change = (i: number, v: string) => { const d = [...otp]; d[i] = v.slice(-1); setOtp(d); if (v && i < 5) refs.current[i + 1]?.focus(); };
  const back = (i: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); };
  const verify = () => { setLoading(true); setTimeout(() => { setLoading(false); onLogin(); }, 1600); };
  const filled = otp.every(v => v);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#0f172a 0%,#1e3a5f 55%,#0f172a 100%)", display: "flex", flexDirection: "column", fontFamily: "inherit", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -120, left: -80, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.blue}18 0%, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 32px ${C.blue}45` }}>
              <Package size={28} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#F1F5F9", margin: 0 }}>AssetFlow Pro</h1>
              <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Enterprise Asset Management</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: "#F1F5F9", margin: "0 0 8px" }}>Welcome back 👋</h2>
                <p style={{ fontSize: 15, color: "#475569", margin: "0 0 28px" }}>Enter your registered mobile number</p>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Mobile Number</label>
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
                    <span style={{ fontSize: 20 }}>🇮🇳</span>
                    <span style={{ color: "#64748B", fontSize: 15, fontWeight: 700 }}>+91</span>
                    <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765 43210" maxLength={10}
                    style={{ width: "100%", padding: "16px 16px 16px 86px", background: "#161B27", border: `2px solid ${phone.length >= 10 ? C.blue : "rgba(255,255,255,0.08)"}`, borderRadius: 16, color: "#F1F5F9", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={send} disabled={loading || phone.length < 10}
                  style={{ width: "100%", padding: "17px", background: phone.length >= 10 ? `linear-gradient(135deg, ${C.blue}, #1d4ed8)` : "rgba(37,99,235,0.2)", border: "none", borderRadius: 16, color: "#fff", fontSize: 16, fontWeight: 800, cursor: phone.length < 10 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: phone.length >= 10 ? `0 6px 24px ${C.blue}45` : "none", fontFamily: "inherit" }}>
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}><RefreshCw size={20} /></motion.div> : <><Send size={18} /> Send OTP</>}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 24, padding: 0 }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px" }}>Enter OTP</h2>
                <p style={{ color: "#475569", fontSize: 13, margin: "0 0 24px" }}>Sent to +91 {phone}</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                  {otp.map((v, i) => (
                    <input key={i} ref={el => { refs.current[i] = el; }} value={v} onChange={e => change(i, e.target.value)} onKeyDown={e => back(i, e)} maxLength={1} inputMode="numeric"
                      style={{ width: 46, height: 56, textAlign: "center", fontSize: 24, fontWeight: 900, background: v ? `${C.blue}18` : "#161B27", border: `2px solid ${v ? C.blue : "rgba(255,255,255,0.08)"}`, borderRadius: 14, color: "#F1F5F9", outline: "none", fontFamily: "inherit" }} />
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={verify} disabled={loading || !filled}
                  style={{ width: "100%", padding: "17px", background: filled ? `linear-gradient(135deg, ${C.green}, #047857)` : "rgba(5,150,105,0.15)", border: "none", borderRadius: 16, color: "#fff", fontSize: 16, fontWeight: 800, cursor: !filled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit" }}>
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}><RefreshCw size={20} /></motion.div> : <><Fingerprint size={20} /> Verify & Login</>}
                </motion.button>
                <p style={{ textAlign: "center", color: "#334155", fontSize: 13, marginTop: 18 }}>
                  {timer > 0 ? `Resend in ${timer}s` : <span onClick={send} style={{ color: "#93c5fd", cursor: "pointer", fontWeight: 700 }}>Resend OTP</span>}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <div style={{ padding: "0 24px 36px", display: "flex", justifyContent: "center", gap: 24 }}>
        {["🔒 SSL Secure", "✅ ISO 27001", "🇮🇳 India Cloud"].map(b => (
          <span key={b} style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function DashboardScreen({ go, toast }: { go: (s: string) => void; toast: (m: string, t: string) => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 1000); }, []);

  return (
    <div style={{ background: "#080A10", minHeight: "100vh", paddingBottom: 88, fontFamily: "inherit" }}>
      <div style={{ background: "linear-gradient(180deg,#0D1321,#080A10)", padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -40, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${C.blue}14 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 2px" }}>Good morning,</p>
            <h2 style={{ color: "#F1F5F9", fontSize: 22, fontWeight: 900, margin: 0 }}>Arjun 👋</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => go("alerts")} style={{ width: 42, height: 42, borderRadius: 13, background: "#161B27", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Bell size={20} color="#64748B" />
              <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: C.redL, border: "2px solid #080A10" }} />
            </motion.button>
          </div>
        </div>
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => go("transfers")} style={{ background: "#161B27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <Search size={18} color="#334155" />
          <span style={{ color: "#334155", fontSize: 14 }}>Search assets, transfers...</span>
        </motion.div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: -16, position: "relative", zIndex: 1, marginBottom: 22 }}>
          {loading ? [...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "#161B27", borderRadius: 20, padding: 18 }}><Sk w={36} h={36} r={10} /><div style={{ marginTop: 10 }}><Sk w="50%" h={28} /></div><div style={{ marginTop: 6 }}><Sk w="70%" h={12} /></div></div>
          )) : [
            { label: "Pending",    v: 12, icon: Clock,       color: C.amberL },
            { label: "In Transit", v: 8,  icon: Truck,       color: C.blueL  },
            { label: "Delivered",  v: 47, icon: CheckCircle, color: C.greenL },
            { label: "Rejected",   v: 3,  icon: XCircle,     color: C.redL   },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} onClick={() => go("transfers")}
              style={{ background: "#161B27", borderRadius: 20, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <k.icon size={20} color={k.color} />
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#F1F5F9", margin: 0, letterSpacing: "-0.5px" }}>{k.v}</p>
              <p style={{ fontSize: 12, color: "#475569", margin: "6px 0 0", fontWeight: 600 }}>{k.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} style={{ marginBottom: 20 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div><p style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0", margin: 0 }}>Transfer Activity</p><p style={{ fontSize: 12, color: "#475569", margin: 0 }}>Last 7 days</p></div>
              <div style={{ background: "rgba(16,185,129,0.12)", borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowUpRight size={13} color={C.greenL} /><span style={{ fontSize: 12, fontWeight: 800, color: C.greenL }}>+18%</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 90 }}>
              {WEEKLY.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                    style={{ width: "100%", background: i === 5 ? `linear-gradient(180deg, ${C.blueL}, #1d4ed8)` : `${C.blueL}28`, borderRadius: "6px 6px 0 0", minHeight: 4 }} />
                  <span style={{ fontSize: 10, color: "#334155" }}>{"MTWTFSS"[i]}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0", margin: "0 0 14px" }}>Quick Actions</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Transfer",  icon: Plus,   color: C.blueL,  screen: "newTransfer" },
              { label: "Scan QR",   icon: QrCode, color: C.purple, screen: "qr"          },
              { label: "Track",     icon: MapPin, color: C.greenL, screen: "tracking"    },
              { label: "Admin",     icon: Shield, color: C.redL,   screen: "admin"       },
            ].map(a => (
              <motion.button key={a.label} whileTap={{ scale: 0.92 }} onClick={() => go(a.screen)}
                style={{ background: "#161B27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: "16px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${a.color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <a.icon size={22} color={a.color} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{a.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Transfers */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0" }}>Recent Transfers</span>
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => go("newTransfer")} style={{ background: C.blue, border: "none", borderRadius: 10, padding: "7px 13px", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <Plus size={13} /> New
            </motion.button>
          </div>
          {TRANSFERS.slice(0, 3).map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 + i * 0.07 }}>
              <Card style={{ padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${STATUS[t.status].color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}><Box size={20} color={STATUS[t.status].color} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.asset}</p>
                  <p style={{ fontSize: 12, color: "#475569", margin: "2px 0 0" }}>{t.from} → {t.to} · {t.date}</p>
                </div>
                <Pill label={STATUS[t.status].label} color={STATUS[t.status].color} bg={STATUS[t.status].bg} />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (msg: string, type = "info") => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); };
  const rmToast = (id: number) => setToasts(t => t.filter(x => x.id !== id));
  const go = (s: string) => setScreen(s);

  const navScreens = ["home", "transfers", "tracking", "alerts", "profile"];
  const showNav = navScreens.includes(screen);
  const unread = NOTIFS.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", fontFamily: "'DM Sans','Nunito',system-ui,sans-serif", minHeight: "100vh", background: "#080A10", overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        <motion.div key={screen} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
          {screen === "login"    && <LoginScreen     onLogin={() => go("home")} />}
          {screen === "home"     && <DashboardScreen go={go} toast={toast} />}
          {screen === "transfers"&& <DashboardScreen go={go} toast={toast} />}
          {screen === "alerts"   && <DashboardScreen go={go} toast={toast} />}
          {screen === "tracking" && <DashboardScreen go={go} toast={toast} />}
          {screen === "profile"  && <DashboardScreen go={go} toast={toast} />}
          {screen === "newTransfer" && <DashboardScreen go={go} toast={toast} />}
          {screen === "qr"       && <DashboardScreen go={go} toast={toast} />}
          {screen === "admin"    && <DashboardScreen go={go} toast={toast} />}
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav screen={screen} go={go} unread={unread} />}

      <AnimatePresence>
        {toasts.map(t => <ToastComp key={t.id} msg={t.msg} type={t.type} onClose={() => rmToast(t.id)} />)}
      </AnimatePresence>
    </div>
  );
}
