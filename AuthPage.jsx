import { useState } from "react";
import { supabase } from "./supabaseClient";
import { BITCORUM_LOGO } from "./logo";

// ── Bitcorum Auth Page ──────────────────────────────────────────────────
// Two distinct screens sharing the same page shell:
//   - Signup: "Join Bitcorum" — Username / Email / Password + 18+ checkbox
//   - Login:  "Welcome Back"  — bordered card, Forgot Password, Back to Home
// Both feature the candlestick side art, the 4-tile feature grid, and the
// trust strip, per Paul's approved design.

const GOLD = "#d4a300";
const GOLD_LIGHT = "#fbbf24";

// ── Icons (inline SVG, gold line-art style) ──
const IconUser = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);
const IconMail = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
  </svg>
);
const IconLock = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const IconEye = ({ open, ...p }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(212,163,0,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(212,163,0,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 3l18 18" /><path d="M10.6 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a17.9 17.9 0 0 1-4 4.6M6.5 6.5A17.6 17.6 0 0 0 1 12s4 7 11 7a10.6 10.6 0 0 0 5.1-1.3" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
const IconRadio = (p) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4.9 4.9a10 10 0 0 0 0 14.14M19.1 4.9a10 10 0 0 1 0 14.14M8.46 8.46a5 5 0 0 0 0 7.07M15.54 8.46a5 5 0 0 1 0 7.07" /><circle cx="12" cy="12" r="1.5" fill={GOLD} />
  </svg>
);
const IconRobot = (p) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="5" y="8" width="14" height="10" rx="3" /><path d="M12 4v4" /><circle cx="12" cy="3" r="1" fill={GOLD} />
    <circle cx="9" cy="13" r="1.3" fill={GOLD} /><circle cx="15" cy="13" r="1.3" fill={GOLD} /><path d="M9 16.5h6" />
  </svg>
);
const IconChart = (p) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4 19h16" /><rect x="6" y="12" width="2.5" height="7" fill={GOLD} stroke="none" />
    <rect x="11" y="8" width="2.5" height="11" fill={GOLD} stroke="none" /><rect x="16" y="14" width="2.5" height="5" fill={GOLD} stroke="none" />
    <path d="M4 11l4-3 4 2 6-6" /><path d="M14 4h4v4" />
  </svg>
);
const IconPeople = (p) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" />
    <path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M12 20c0-2.8 2-5.2 4.7-5.8" />
  </svg>
);
const IconShield = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 2l7 4v6c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V6l7-4z" /><path d="M9 12l2 2 4-4" />
  </svg>
);
const IconBolt = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
  </svg>
);
const IconGlobe = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// ── Decorative candlestick side art ──
function CandleStrip({ side }) {
  const bars = [
    [30, 55, 1], [45, 30, 0], [25, 65, 1], [50, 40, 0], [35, 70, 1],
    [55, 35, 0], [40, 60, 1], [60, 45, 0], [30, 75, 1], [50, 55, 0],
    [65, 40, 1], [45, 80, 0], [70, 50, 1], [55, 90, 0], [80, 60, 1],
  ];
  return (
    <div style={{
      position: "absolute", top: 0, [side]: 0, width: 90, height: "100%",
      display: "flex", alignItems: "flex-end", gap: 3, padding: "0 8px",
      opacity: 0.35, pointerEvents: "none", overflow: "hidden",
    }}>
      {bars.map(([h, offset, up], i) => (
        <div key={i} style={{ width: 4, height: `${h + offset}px`, marginBottom: offset, borderRadius: 1,
          background: up ? "#4ade80" : GOLD, boxShadow: up ? "0 0 6px rgba(74,222,128,0.4)" : `0 0 6px rgba(212,163,0,0.4)` }} />
      ))}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", background: "#020409", position: "relative",
    overflow: "hidden", fontFamily: "inherit", padding: "40px 20px 60px",
  },
  content: { position: "relative", zIndex: 1, maxWidth: 460, margin: "0 auto" },
  backHome: {
    fontSize: 11, color: GOLD, letterSpacing: "0.15em", fontWeight: 700,
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24,
  },
  logoRow: { textAlign: "center", marginBottom: 8 },
  logoImg: { width: "min(180px,50vw)", height: "auto", margin: "0 auto", display: "block",
    filter: "drop-shadow(0 0 30px rgba(212,163,0,0.5))" },
  heading: { textAlign: "center", fontSize: 30, fontWeight: 900, marginTop: 8, marginBottom: 10 },
  subtext: { fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 26 },
  card: {
    background: "rgba(10,10,12,0.5)", border: "1px solid rgba(212,163,0,0.3)",
    borderRadius: 16, padding: "26px 22px", marginBottom: 26,
  },
  fieldWrap: {
    display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(212,163,0,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 14,
  },
  fieldWrapLabeled: {
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,163,0,0.25)",
    borderRadius: 10, padding: "12px 14px", marginBottom: 16,
  },
  labelRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  fieldLabel: { fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: "0.05em" },
  input: {
    flex: 1, background: "transparent", border: "none", outline: "none",
    color: "#e2e8f0", fontSize: 13, fontFamily: "inherit",
  },
  inputLabeled: {
    width: "100%", background: "transparent", border: "none", outline: "none",
    color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box",
    borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8,
  },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" },
  checkboxRow: { display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 16, marginTop: 6 },
  checkboxLabel: { fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 },
  button: (disabled) => ({
    width: "100%", padding: "14px 20px", borderRadius: 10,
    background: disabled ? "rgba(212,163,0,0.15)" : `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`,
    border: "none", color: disabled ? "rgba(0,0,0,0.4)" : "#000", fontFamily: "inherit",
    fontSize: 12.5, fontWeight: 900, letterSpacing: "0.15em", cursor: disabled ? "not-allowed" : "pointer",
  }),
  switchRow: { textAlign: "center", marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.45)" },
  switchLink: { color: GOLD, fontWeight: 700, cursor: "pointer", textDecoration: "underline" },
  forgotRow: { textAlign: "right", marginBottom: 16, marginTop: -4 },
  forgotLink: { fontSize: 11.5, color: GOLD, cursor: "pointer" },
  error: {
    fontSize: 11.5, color: "#f87171", background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, padding: "9px 12px",
    marginBottom: 14, lineHeight: 1.5,
  },
  success: {
    fontSize: 11.5, color: "#4ade80", background: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, padding: "9px 12px",
    marginBottom: 14, lineHeight: 1.5,
  },
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 },
  featureTile: {
    border: "1px solid rgba(212,163,0,0.25)", borderRadius: 12, padding: "16px 10px",
    textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
  },
  featureTitle: { fontSize: 10.5, color: GOLD, fontWeight: 700, letterSpacing: "0.08em" },
  featureText: { fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 },
  trustStrip: {
    display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
    borderTop: "1px solid rgba(212,163,0,0.15)", paddingTop: 20,
  },
  trustItem: { flex: "1 1 100px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" },
  trustTitle: { fontSize: 9.5, color: GOLD, fontWeight: 700, letterSpacing: "0.06em" },
  trustText: { fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 },
  footerNote: { textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
};

const FEATURES = [
  { icon: IconRadio, title: "BITCORUM RADIO", text: "24/7 crypto talk, news, interviews and market commentary." },
  { icon: IconRobot, title: "AI AGENTS", text: "Ask, debate and get expert insights from our AI team." },
  { icon: IconChart, title: "LIVE CHARTS", text: "Advanced interactive charts with multiple indicators." },
  { icon: IconPeople, title: "MULTI-AGENT DEBATES", text: "See AI agents debate and analyse market trends." },
];

function FeatureGrid() {
  return (
    <div style={styles.featureGrid}>
      {FEATURES.map((f) => (
        <div key={f.title} style={styles.featureTile}>
          <f.icon />
          <div style={styles.featureTitle}>{f.title}</div>
          <div style={styles.featureText}>{f.text}</div>
        </div>
      ))}
    </div>
  );
}

function TrustStrip() {
  return (
    <div style={styles.trustStrip}>
      <div style={styles.trustItem}>
        <IconShield /><div style={styles.trustTitle}>SECURE & PRIVATE</div>
        <div style={styles.trustText}>Your data is encrypted and always protected.</div>
      </div>
      <div style={styles.trustItem}>
        <IconBolt /><div style={styles.trustTitle}>REAL TIME INSIGHTS</div>
        <div style={styles.trustText}>Live market data and AI agent intelligence.</div>
      </div>
      <div style={styles.trustItem}>
        <IconGlobe /><div style={styles.trustTitle}>BUILT FOR EVERYONE</div>
        <div style={styles.trustText}>Whether you're a beginner or a pro, Bitcorum is for you.</div>
      </div>
    </div>
  );
}

export default function AuthPage({ onBackHome }) {
  const [mode, setMode] = useState("signup"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetFeedback = () => { setError(""); setMessage(""); };
  const switchMode = (next) => { setMode(next); resetFeedback(); };

  const handleBackHome = () => {
    if (onBackHome) onBackHome();
    else if (typeof window !== "undefined") window.location.href = "/";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetFeedback();
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) setError(signInError.message); else window.scrollTo(0, 0);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    resetFeedback();
    if (!username.trim() || !email.trim() || !password || !confirmPassword) { setError("Fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (!ageConfirmed) { setError("You must confirm you are 18 or over to create an account."); return; }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { username: username.trim(), age_confirmed: true } },
    });
    setLoading(false);
    if (signUpError) { setError(signUpError.message); return; }
    if (data?.session) return; // signed in immediately (email confirmation off)
    setMessage("Account created. Check your inbox to confirm your email before logging in.");
    setMode("login");
  };

  const handleForgotPassword = async () => {
    resetFeedback();
    if (!email.trim()) { setError("Enter your email above first, then tap 'Forgot Password'."); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    setLoading(false);
    if (resetError) setError(resetError.message);
    else setMessage("Password reset email sent — check your inbox.");
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        {mode === "login" && (
          <div style={styles.backHome} onClick={handleBackHome}>← BACK TO HOME</div>
        )}

        <div style={styles.logoRow}>
          <img src={BITCORUM_LOGO} alt="Bitcorum" style={styles.logoImg} />
        </div>

        {mode === "signup" ? (
          <>
            <div style={styles.heading}>
              <span style={{ color: "#fff" }}>Join </span>
              <span style={{ color: GOLD }}>Bitcorum</span>
            </div>
            <div style={styles.subtext}>
              Create your free account today and get access to 6 AI minds plus one powerful verdict — before you trade.
            </div>
          </>
        ) : (
          <>
            <div style={styles.heading}>
              <span style={{ color: "#fff" }}>Welcome </span>
              <span style={{ color: GOLD }}>Back</span>
            </div>
            <div style={styles.subtext}>
              Log in to your Bitcorum account and continue your journey into{" "}
              <span style={{ color: GOLD }}>crypto intelligence</span>.
            </div>
          </>
        )}

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        {mode === "signup" ? (
          <form onSubmit={handleSignup}>
            <div style={styles.fieldWrap}>
              <IconUser />
              <input style={styles.input} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            </div>
            <div style={styles.fieldWrap}>
              <IconMail />
              <input style={styles.input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
            </div>
            <div style={styles.fieldWrap}>
              <IconLock />
              <input style={styles.input} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)}><IconEye open={showPassword} /></button>
            </div>
            <div style={styles.fieldWrap}>
              <IconLock />
              <input style={styles.input} type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
            </div>
            <div style={styles.checkboxRow}>
              <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)}
                style={{ marginTop: 2, accentColor: GOLD, width: 15, height: 15, flexShrink: 0 }} />
              <span style={styles.checkboxLabel}>I confirm that I am 18 years of age or older.</span>
            </div>
            <button type="submit" style={styles.button(loading)} disabled={loading}>
              {loading ? "CREATING ACCOUNT…" : "CREATE FREE ACCOUNT"}
            </button>
            <div style={styles.switchRow}>
              Already have an account? <span style={styles.switchLink} onClick={() => switchMode("login")}>Log In</span>
            </div>
          </form>
        ) : (
          <div style={styles.card}>
            <form onSubmit={handleLogin}>
              <div style={styles.fieldWrapLabeled}>
                <div style={styles.labelRow}><IconMail /><span style={styles.fieldLabel}>EMAIL ADDRESS</span></div>
                <input style={styles.inputLabeled} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" />
              </div>
              <div style={styles.fieldWrapLabeled}>
                <div style={{ ...styles.labelRow, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><IconLock /><span style={styles.fieldLabel}>PASSWORD</span></div>
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)}><IconEye open={showPassword} /></button>
                </div>
                <input style={styles.inputLabeled} type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
              </div>
              <div style={styles.forgotRow}>
                <span style={styles.forgotLink} onClick={handleForgotPassword}>Forgot Password?</span>
              </div>
              <button type="submit" style={styles.button(loading)} disabled={loading}>
                {loading ? "SIGNING IN…" : "LOG IN TO BITCORUM"}
              </button>
              <div style={styles.switchRow}>
                Don't have an account? <span style={styles.switchLink} onClick={() => switchMode("signup")}>Sign Up</span>
              </div>
            </form>
          </div>
        )}

        <div style={{ height: 26 }} />
        <FeatureGrid />
        <TrustStrip />

        {mode === "login" && (
          <div style={styles.footerNote}>🔒 Your information is secure and encrypted</div>
        )}
      </div>
    </div>
  );
}
