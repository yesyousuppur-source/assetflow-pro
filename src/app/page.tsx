'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package, Truck, CheckCircle, XCircle, Plus, QrCode,
  MapPin, Bell, User, LogOut, ChevronLeft, Home,
  Clock, Shield, RefreshCw, Check, Send, Box,
  Route, ArrowUpRight, Fingerprint, UserPlus,
  Info, Wallet,
} from "lucide-react"
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createClient } from "@supabase/supabase-js"

// ─── Supabase ────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Colors ──────────────────────────────────────────────────
const C = {
  blue:  "#2563eb", blueL: "#3b82f6", blueLighter: "#93c5fd",
  green: "#059669", greenL: "#10b981",
  amber: "#d97706", amberL: "#f59e0b",
  red:   "#dc2626", redL: "#ef4444",
  purple:"#7c3aed",
}

// ─── Types ───────────────────────────────────────────────────
interface UserData {
  id: string
  name: string
  phone: string
  emp_code: string
  department: string
  designation: string
  role: string
}

interface ToastItem { id: number; msg: string; type: string }

// ─── Atoms ───────────────────────────────────────────────────
function Card({ children, style = {}, onClick }: {
  children: React.ReactNode
  style?: React.CSSProperties
  onClick?: () => void
}) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.984 } : {}}
      onClick={onClick}
      style={{
        background: "#161B27",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

function Ava({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  const ini = (name || "??").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 800, color: "#fff", flexShrink: 0,
    }}>
      {ini}
    </div>
  )
}

function ToastComp({ msg, type, onClose }: { msg: string; type: string; onClose: () => void }) {
  const map: Record<string, string> = {
    success: C.greenL, error: C.redL, info: C.blueL, warning: C.amberL,
  }
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) })
  return (
    <motion.div
      initial={{ opacity: 0, y: 64, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16 }}
      style={{
        position: "fixed", bottom: 96, left: "50%",
        transform: "translateX(-50%)", zIndex: 9999,
        background: "#1A1F2E", color: "#fff",
        padding: "14px 20px", borderRadius: 18,
        display: "flex", alignItems: "center", gap: 12,
        minWidth: 288, maxWidth: 340,
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        borderLeft: `4px solid ${map[type] || C.blueL}`,
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: map[type], flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>{msg}</span>
    </motion.div>
  )
}

function BottomNav({ screen, go }: { screen: string; go: (s: string) => void }) {
  const items = [
    { id: "home",      icon: Home,  label: "Home"      },
    { id: "transfers", icon: Route, label: "Transfers"  },
    { id: "newTransfer", icon: Plus, label: "", fab: true },
    { id: "alerts",    icon: Bell,  label: "Alerts"    },
    { id: "profile",   icon: User,  label: "Profile"   },
  ]
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%",
      transform: "translateX(-50%)", width: "100%", maxWidth: 480,
      background: "rgba(10,12,18,0.96)", backdropFilter: "blur(24px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "6px 0 20px", zIndex: 100,
      display: "flex", justifyContent: "space-around", alignItems: "flex-end",
    }}>
      {items.map(item => {
        if ((item as { fab?: boolean }).fab) return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.86 }}
            onClick={() => go("newTransfer")}
            style={{
              width: 56, height: 56, borderRadius: "50%", marginBottom: 8,
              background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 20px rgba(37,99,235,0.45)`,
            }}
          >
            <Plus size={26} color="#fff" />
          </motion.button>
        )
        const active = screen === item.id
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.86 }}
            onClick={() => go(item.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "6px 14px",
            }}
          >
            <div style={{
              width: 44, height: 30, borderRadius: 14,
              background: active ? `${C.blue}25` : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <item.icon size={21} color={active ? "#93c5fd" : "#475569"} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 800 : 500, color: active ? "#93c5fd" : "#475569" }}>
              {item.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  LOGIN — Firebase Phone OTP
// ══════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (user: UserData) => void }) {
  const [phone, setPhone]       = useState("")
  const [otp, setOtp]           = useState(["", "", "", "", "", ""])
  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [timer, setTimer]       = useState(0)
  const [confirm, setConfirm]   = useState<ConfirmationResult | null>(null)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(x => x - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [timer])

  // Setup invisible reCAPTCHA
  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      })
    }
    return recaptchaRef.current
  }

  // ── Firebase Send OTP ──
  const sendOTP = async () => {
    if (phone.length !== 10) { setError("Valid 10-digit number daalo"); return }
    setLoading(true); setError("")
    try {
      const verifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, verifier)
      setConfirm(result)
      setStep(2)
      setTimer(30)
    } catch (err: unknown) {
      console.error(err)
      setError("OTP bhejne mein dikkat. Dobara try karo.")
      recaptchaRef.current = null
    } finally {
      setLoading(false)
    }
  }

  // ── Firebase Verify OTP ──
  const verifyOTP = async () => {
    const otpStr = otp.join("")
    if (otpStr.length !== 6 || !confirm) { setError("6-digit OTP daalo"); return }
    setLoading(true); setError("")
    try {
      await confirm.confirm(otpStr)
      const fullPhone = `91${phone}`

      // Check user in Supabase
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("phone", fullPhone)
        .single()

      if (!user) {
        setStep(3) // New user → registration
      } else {
        onLogin(user as UserData)
      }
    } catch (err: unknown) {
      console.error(err)
      setError("Galat OTP hai. Dobara try karo.")
    } finally {
      setLoading(false)
    }
  }

  const changeOtp = (i: number, v: string) => {
    const d = [...otp]; d[i] = v.slice(-1); setOtp(d)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const backspace = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const filled = otp.every(v => v)

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(155deg,#0f172a 0%,#1e3a5f 55%,#0f172a 100%)",
      display: "flex", flexDirection: "column", fontFamily: "inherit",
    }}>
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 8px 32px ${C.blue}45`,
            }}>
              <Package size={28} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#F1F5F9", margin: 0 }}>AssetFlow Pro</h1>
              <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Enterprise Asset Management</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Phone Number */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: "#F1F5F9", margin: "0 0 8px" }}>Welcome back 👋</h2>
                <p style={{ fontSize: 15, color: "#475569", margin: "0 0 28px" }}>Mobile number se login karein</p>

                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                  Mobile Number
                </label>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
                    <span style={{ fontSize: 20 }}>🇮🇳</span>
                    <span style={{ color: "#64748B", fontSize: 15, fontWeight: 700 }}>+91</span>
                    <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    maxLength={10}
                    inputMode="numeric"
                    style={{
                      width: "100%", padding: "16px 16px 16px 86px",
                      background: "#161B27",
                      border: `2px solid ${phone.length === 10 ? C.blue : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 16, color: "#F1F5F9", fontSize: 18,
                      fontWeight: 700, outline: "none", fontFamily: "inherit",
                      boxSizing: "border-box" as const,
                    }}
                  />
                </div>

                {error && <p style={{ color: C.redL, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠️ {error}</p>}

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={sendOTP}
                  disabled={loading || phone.length !== 10}
                  style={{
                    width: "100%", padding: "17px",
                    background: phone.length === 10
                      ? `linear-gradient(135deg, ${C.blue}, #1d4ed8)`
                      : "rgba(37,99,235,0.2)",
                    border: "none", borderRadius: 16,
                    color: "#fff", fontSize: 16, fontWeight: 800,
                    cursor: phone.length !== 10 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 10, fontFamily: "inherit",
                    boxShadow: phone.length === 10 ? `0 6px 24px ${C.blue}45` : "none",
                  }}
                >
                  {loading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}><RefreshCw size={20} /></motion.div>
                    : <><Send size={18} /> OTP Bhejein</>
                  }
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: OTP Verify */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}
                >
                  <ChevronLeft size={16} /> Wapas
                </button>

                <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
                  <CheckCircle size={22} color={C.greenL} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.greenL, margin: 0 }}>OTP bhej diya! ✅</p>
                    <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>+91 {phone} pe SMS aaya hoga</p>
                  </div>
                </div>

                <p style={{ color: "#475569", fontSize: 14, margin: "0 0 20px" }}>6-digit code daalo:</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      ref={el => { refs.current[i] = el }}
                      value={v}
                      onChange={e => changeOtp(i, e.target.value)}
                      onKeyDown={e => backspace(i, e)}
                      maxLength={1}
                      inputMode="numeric"
                      style={{
                        width: 46, height: 56, textAlign: "center",
                        fontSize: 24, fontWeight: 900,
                        background: v ? `${C.blue}18` : "#161B27",
                        border: `2px solid ${v ? C.blue : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 14, color: "#F1F5F9",
                        outline: "none", fontFamily: "inherit",
                      }}
                    />
                  ))}
                </div>

                {error && <p style={{ color: C.redL, fontSize: 13, marginBottom: 12, fontWeight: 600, textAlign: "center" }}>⚠️ {error}</p>}

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={verifyOTP}
                  disabled={loading || !filled}
                  style={{
                    width: "100%", padding: "17px",
                    background: filled
                      ? `linear-gradient(135deg, ${C.green}, #047857)`
                      : "rgba(5,150,105,0.15)",
                    border: "none", borderRadius: 16,
                    color: "#fff", fontSize: 16, fontWeight: 800,
                    cursor: !filled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 10, fontFamily: "inherit", marginBottom: 16,
                    boxShadow: filled ? `0 6px 24px ${C.green}40` : "none",
                  }}
                >
                  {loading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}><RefreshCw size={20} /></motion.div>
                    : <><Fingerprint size={20} /> Verify karein</>
                  }
                </motion.button>

                <p style={{ textAlign: "center", color: "#334155", fontSize: 13 }}>
                  {timer > 0
                    ? `Resend ${timer}s mein`
                    : <span onClick={sendOTP} style={{ color: "#93c5fd", cursor: "pointer", fontWeight: 700 }}>OTP dubara bhejein</span>
                  }
                </p>
              </motion.div>
            )}

            {/* Step 3: New User Registration */}
            {step === 3 && (
              <RegisterForm phone={phone} onDone={onLogin} />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div style={{ padding: "0 24px 36px", display: "flex", justifyContent: "center", gap: 24 }}>
        {["🔒 Firebase Auth", "✅ Secure OTP", "🇮🇳 India Ready"].map(b => (
          <span key={b} style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>{b}</span>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  REGISTRATION — Real API
// ══════════════════════════════════════════════════════════════
function RegisterForm({ phone, onDone }: { phone: string; onDone: (user: UserData) => void }) {
  const [name, setName]               = useState("")
  const [dept, setDept]               = useState("")
  const [designation, setDesignation] = useState("")
  const [role, setRole]               = useState("employee")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")
  const [done, setDone]               = useState(false)
  const [empCode, setEmpCode]         = useState("")

  const depts = ["Operations","Design","Finance","HR","Logistics","IT","Sales","Marketing"]

  const register = async () => {
    if (!name || !dept || !designation) { setError("Saari fields bharni zaroori hain"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, department: dept, designation, role }),
      })
      const data = await res.json()
      if (data.success) {
        setEmpCode(data.user.emp_code)
        setDone(true)
        setTimeout(() => onDone(data.user), 2500)
      } else {
        setError(data.error || "Registration failed.")
      }
    } catch {
      setError("Network error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}
        style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <CheckCircle size={44} color={C.greenL} />
      </motion.div>
      <h3 style={{ color: "#F1F5F9", fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>Registration Complete! 🎉</h3>
      <p style={{ color: "#475569", fontSize: 14, marginBottom: 16 }}>Tumhara Employee Code:</p>
      <div style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}35`, borderRadius: 16, padding: "14px 20px", display: "inline-block" }}>
        <p style={{ color: "#93c5fd", fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: "0.12em" }}>{empCode}</p>
      </div>
      <p style={{ color: "#334155", fontSize: 13, marginTop: 12 }}>Ye code save kar lo!</p>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "#F1F5F9", margin: "0 0 6px" }}>Account Banayein</h2>
      <p style={{ color: "#475569", fontSize: 14, margin: "0 0 24px" }}>+91 {phone} verified ✅</p>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Poora Naam</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arjun Sharma"
          style={{ width: "100%", padding: "15px 16px", fontSize: 15, borderRadius: 14, fontFamily: "inherit", color: "#E2E8F0", background: "#161B27", border: "2px solid rgba(255,255,255,0.08)", outline: "none", boxSizing: "border-box" as const }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Department</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {depts.map(d => (
            <motion.button key={d} whileTap={{ scale: 0.94 }} onClick={() => setDept(d)}
              style={{ padding: "8px 14px", borderRadius: 12, border: `1.5px solid ${dept === d ? C.blue : "rgba(255,255,255,0.1)"}`, background: dept === d ? `${C.blue}18` : "rgba(255,255,255,0.04)", color: dept === d ? "#93c5fd" : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {d}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Designation</label>
        <input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Senior Manager"
          style={{ width: "100%", padding: "15px 16px", fontSize: 15, borderRadius: 14, fontFamily: "inherit", color: "#E2E8F0", background: "#161B27", border: "2px solid rgba(255,255,255,0.08)", outline: "none", boxSizing: "border-box" as const }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Role</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["employee", "driver", "admin"].map(r => (
            <motion.button key={r} whileTap={{ scale: 0.94 }} onClick={() => setRole(r)}
              style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1.5px solid ${role === r ? C.blue : "rgba(255,255,255,0.1)"}`, background: role === r ? `${C.blue}18` : "rgba(255,255,255,0.04)", color: role === r ? "#93c5fd" : "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" as const }}>
              {r}
            </motion.button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: C.redL, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠️ {error}</p>}

      <motion.button whileTap={{ scale: 0.96 }} onClick={register} disabled={loading || !name || !dept || !designation}
        style={{ width: "100%", padding: "17px", background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`, border: "none", borderRadius: 16, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", boxShadow: `0 6px 24px ${C.blue}45` }}>
        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}><RefreshCw size={20} /></motion.div> : <><UserPlus size={18} /> Account Banayein</>}
      </motion.button>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════
function DashboardScreen({ user, go, toast }: { user: UserData; go: (s: string) => void; toast: (m: string, t: string) => void }) {
  return (
    <div style={{ background: "#080A10", minHeight: "100vh", paddingBottom: 88, fontFamily: "inherit" }}>
      <div style={{ background: "linear-gradient(180deg,#0D1321,#080A10)", padding: "52px 20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Ava name={user.name} color={C.blueL} size={46} />
            <div>
              <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>Namaste,</p>
              <h2 style={{ color: "#F1F5F9", fontSize: 20, fontWeight: 900, margin: 0 }}>{user.name.split(" ")[0]} 👋</h2>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => go("alerts")}
            style={{ width: 42, height: 42, borderRadius: 13, background: "#161B27", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={20} color="#64748B" />
          </motion.button>
        </div>

        {/* Emp Code */}
        <div style={{ background: "#161B27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: C.greenL }} />
            <span style={{ color: "#94A3B8", fontSize: 13 }}>Employee Code:</span>
            <span style={{ color: "#93c5fd", fontSize: 15, fontWeight: 900, letterSpacing: "0.06em" }}>{user.emp_code}</span>
          </div>
          <span style={{ fontSize: 11, color: "#334155", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 8, fontWeight: 600, textTransform: "capitalize" as const }}>{user.role}</span>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Pending",    v: 12, icon: Clock,       color: C.amberL },
            { label: "In Transit", v: 8,  icon: Truck,       color: C.blueL  },
            { label: "Delivered",  v: 47, icon: CheckCircle, color: C.greenL },
            { label: "Rejected",   v: 3,  icon: XCircle,     color: C.redL   },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "#161B27", borderRadius: 20, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <k.icon size={20} color={k.color} />
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#F1F5F9", margin: 0 }}>{k.v}</p>
              <p style={{ fontSize: 12, color: "#475569", margin: "6px 0 0", fontWeight: 600 }}>{k.label}</p>
            </motion.div>
          ))}
        </div>

        {/* User Details */}
        <Card style={{ padding: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0", margin: "0 0 16px" }}>Meri Details</p>
          {[
            ["Employee Code", user.emp_code],
            ["Department",    user.department],
            ["Designation",   user.designation],
            ["Role",          user.role],
            ["Mobile",        `+91 ${user.phone.replace("91", "")}`],
          ].map(([k, v], i, a) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: i < a.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", textTransform: "capitalize" as const }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("login")
  const [user, setUser]     = useState<UserData | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = (msg: string, type = "info") => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
  }
  const rmToast = (id: number) => setToasts(t => t.filter(x => x.id !== id))
  const go = (s: string) => setScreen(s)

  const handleLogin = (loggedUser: UserData) => {
    setUser(loggedUser)
    setScreen("home")
    toast(`✅ Welcome, ${loggedUser.name.split(" ")[0]}!`, "success")
  }

  const handleLogout = () => {
    setUser(null)
    setScreen("login")
    toast("👋 Logout successful", "info")
  }

  const navScreens = ["home", "transfers", "alerts", "profile"]
  const showNav = navScreens.includes(screen)

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", fontFamily: "'DM Sans','Nunito',system-ui,sans-serif", minHeight: "100vh", background: "#080A10", overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        <motion.div key={screen} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
          {screen === "login" && <LoginScreen onLogin={handleLogin} />}
          {screen === "home"  && user && <DashboardScreen user={user} go={go} toast={toast} />}
          {["transfers","alerts","newTransfer","qr","tracking","admin"].includes(screen) && user && (
            <DashboardScreen user={user} go={go} toast={toast} />
          )}
          {screen === "profile" && user && (
            <div style={{ background: "#080A10", minHeight: "100vh", paddingBottom: 88, fontFamily: "inherit" }}>
              <div style={{ background: "linear-gradient(160deg,#0D1020,#161B27)", padding: "52px 20px 32px", textAlign: "center" }}>
                <Ava name={user.name} color={C.blueL} size={80} />
                <h3 style={{ color: "#F1F5F9", fontSize: 22, fontWeight: 900, margin: "14px 0 4px" }}>{user.name}</h3>
                <p style={{ color: "#475569", fontSize: 14, margin: "0 0 14px" }}>{user.designation} · {user.department}</p>
                <span style={{ background: `${C.blue}20`, color: "#93c5fd", fontSize: 14, fontWeight: 800, padding: "6px 18px", borderRadius: 20, letterSpacing: "0.06em" }}>{user.emp_code}</span>
              </div>
              <div style={{ padding: 16 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                  style={{ width: "100%", padding: "16px", background: "transparent", border: "2px solid rgba(220,38,38,0.2)", borderRadius: 17, color: C.redL, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit" }}>
                  <LogOut size={19} /> Logout
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav screen={screen} go={go} />}

      <AnimatePresence>
        {toasts.map(t => <ToastComp key={t.id} msg={t.msg} type={t.type} onClose={() => rmToast(t.id)} />)}
      </AnimatePresence>
    </div>
  )
}
