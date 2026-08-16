import { useState } from "react";

const SUPABASE_URL = "https://smojutxbmngxuuzhbuxa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2p1dHhibW5neHV1emhidXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDA2ODEsImV4cCI6MjA5OTI3NjY4MX0.-A55wzsWR0sHEm3aJoSF3nw821JKddwYAKn4HmZbonM";

const authApi = async (body) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Error");
  return data;
};

const getRol = async (userId, token) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${userId}&select=rol`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data?.[0]?.rol || "estudiante";
};

// Logo SVG "SM" con birrete y libro
function LogoSM() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hexágono fondo */}
      <polygon points="50,2 93,26 93,74 50,98 7,74 7,26" fill="#0a1628" stroke="#1e50e0" strokeWidth="3"/>
      {/* Libro abajo */}
      <path d="M25 72 Q50 65 75 72" stroke="#1e90ff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M25 67 Q50 60 75 67" stroke="#1e90ff" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M25 62 Q50 55 75 62" stroke="#1e90ff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Píxeles digitales */}
      <rect x="46" y="68" width="3" height="3" fill="#1e90ff" opacity="0.8"/>
      <rect x="50" y="65" width="3" height="3" fill="#1e90ff" opacity="0.6"/>
      <rect x="54" y="68" width="3" height="3" fill="#1e90ff" opacity="0.4"/>
      {/* Letra S */}
      <text x="18" y="66" fontFamily="Arial Black, sans-serif" fontSize="36" fontWeight="900"
        fill="url(#gradS)" letterSpacing="-1">S</text>
      {/* Letra M */}
      <text x="46" y="66" fontFamily="Arial Black, sans-serif" fontSize="36" fontWeight="900"
        fill="url(#gradM)" letterSpacing="-1">M</text>
      {/* Birrete */}
      <ellipse cx="50" cy="24" rx="22" ry="5" fill="#1565c0"/>
      <rect x="38" y="19" width="24" height="7" rx="1" fill="#1976d2"/>
      <rect x="44" y="13" width="12" height="8" rx="1" fill="#1976d2"/>
      {/* Cordón del birrete */}
      <line x1="72" y1="24" x2="76" y2="34" stroke="#ffc800" strokeWidth="1.5"/>
      <circle cx="76" cy="36" r="2.5" fill="#ffc800"/>
      {/* Gradientes */}
      <defs>
        <linearGradient id="gradS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fc3f7"/>
          <stop offset="100%" stopColor="#1565c0"/>
        </linearGradient>
        <linearGradient id="gradM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd740"/>
          <stop offset="100%" stopColor="#ff8f00"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LoginSIGE({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showZona, setShowZona] = useState(false);
  const [zona, setZona] = useState("");
  const [institucion, setInstitucion] = useState("");

  const zonas = ["Atlántico", "Bolívar", "Cundinamarca", "Antioquia", "Valle del Cauca", "Santander", "Córdoba", "Magdalena"];
  const instituciones = {
    "Atlántico": ["I.E. Técnica Comercial de Ponedera", "I.E. Simón Bolívar", "I.E. José Consuegra Higgins"],
    "Bolívar": ["I.E. Cartagena de Indias", "I.E. Simón Bolívar Cartagena"],
    "Cundinamarca": ["I.E. Distrital Bogotá", "I.E. La Candelaria"],
    "Antioquia": ["I.E. Medellín Centro", "I.E. La América"],
    "Valle del Cauca": ["I.E. Cali Norte", "I.E. Palmira"],
    "Santander": ["I.E. Bucaramanga", "I.E. Floridablanca"],
    "Córdoba": ["I.E. Montería", "I.E. Cereté"],
    "Magdalena": ["I.E. Santa Marta", "I.E. Ciénaga"],
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setLoading(true); setError("");
    try {
      const data = await authApi({ email, password });
      const rol = await getRol(data.user.id, data.access_token);
      if (onLogin) onLogin({ token: data.access_token, email, rol, id: data.user.id });
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}

        .root {
          min-height: 100vh;
          background: #020d1f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* === FONDO ESPACIAL === */
        .bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,60,180,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 20% 100%, rgba(0,30,120,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(0,20,80,0.2) 0%, transparent 60%),
            #020d1f;
        }

        /* Grid perspectiva tipo portal */
        .grid-floor {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 55%;
          background-image:
            linear-gradient(rgba(30,100,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,100,255,0.12) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(400px) rotateX(55deg);
          transform-origin: bottom center;
          opacity: 0.7;
        }

        .grid-ceil {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 55%;
          background-image:
            linear-gradient(rgba(30,100,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,100,255,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(400px) rotateX(-55deg);
          transform-origin: top center;
          opacity: 0.5;
        }

        /* Rayos de luz desde el centro */
        .rays {
          position: absolute;
          inset: 0;
          background: 
            conic-gradient(from 0deg at 50% 50%,
              transparent 0deg,
              rgba(30,100,255,0.04) 20deg,
              transparent 40deg,
              rgba(30,100,255,0.03) 80deg,
              transparent 100deg,
              rgba(30,144,255,0.04) 160deg,
              transparent 180deg,
              rgba(30,100,255,0.03) 240deg,
              transparent 260deg,
              rgba(30,144,255,0.04) 320deg,
              transparent 360deg
            );
          animation: raysRotate 30s linear infinite;
        }
        @keyframes raysRotate { to { transform: rotate(360deg); } }

        /* Partículas */
        .star { position: absolute; border-radius: 50%; animation: twinkle ease-in-out infinite; }
        @keyframes twinkle {
          0%,100%{opacity:0.1;transform:scale(1);}
          50%{opacity:1;transform:scale(1.4);}
        }

        /* Líneas de velocidad */
        .speed-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(100,180,255,0.6), transparent);
          animation: speedMove linear infinite;
          opacity: 0;
        }
        @keyframes speedMove {
          0%{left:-30%;opacity:0;width:15%;}
          10%{opacity:1;}
          90%{opacity:1;}
          100%{left:115%;opacity:0;width:25%;}
        }

        /* === CARD === */
        .card-wrap {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          margin: 20px;
        }

        .card-outer {
          position: relative;
          border-radius: 16px;
          padding: 2px;
          background: linear-gradient(160deg,
            rgba(30,144,255,0.9) 0%,
            rgba(100,180,255,0.4) 30%,
            rgba(255,200,0,0.3) 50%,
            rgba(30,100,255,0.5) 70%,
            rgba(30,144,255,0.8) 100%
          );
          box-shadow:
            0 0 40px rgba(30,100,255,0.35),
            0 0 80px rgba(30,100,255,0.15),
            0 0 120px rgba(30,100,255,0.08);
          animation: cardGlow 4s ease-in-out infinite alternate;
        }
        @keyframes cardGlow {
          from { box-shadow: 0 0 40px rgba(30,100,255,0.35), 0 0 80px rgba(30,100,255,0.15); }
          to   { box-shadow: 0 0 60px rgba(30,144,255,0.55), 0 0 100px rgba(30,144,255,0.25), 0 0 140px rgba(255,200,0,0.06); }
        }

        .card {
          background: rgba(4, 14, 35, 0.95);
          border-radius: 14px;
          padding: 40px 36px 36px;
          backdrop-filter: blur(24px);
          position: relative;
        }

        /* Esquinas doradas */
        .corner { position: absolute; width: 22px; height: 22px; }
        .c-tl { top: 10px; left: 10px; border-top: 2px solid #ffc800; border-left: 2px solid #ffc800; border-radius: 4px 0 0 0; }
        .c-tr { top: 10px; right: 10px; border-top: 2px solid #ffc800; border-right: 2px solid #ffc800; border-radius: 0 4px 0 0; }
        .c-bl { bottom: 10px; left: 10px; border-bottom: 2px solid #ffc800; border-left: 2px solid #ffc800; border-radius: 0 0 0 4px; }
        .c-br { bottom: 10px; right: 10px; border-bottom: 2px solid #ffc800; border-right: 2px solid #ffc800; border-radius: 0 0 4px 0; }

        /* === LOGO === */
        .logo-area { text-align: center; margin-bottom: 8px; }
        .logo-area svg { filter: drop-shadow(0 0 12px rgba(30,144,255,0.7)); }

        .title-line {
          font-family: 'Orbitron', monospace;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-top: 12px;
          color: white;
        }
        .title-line span { color: #ffc800; }

        .subtitle {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-top: 5px;
        }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 10px;
          margin: 20px 0 16px;
        }
        .div-line { flex:1; height:1px; background: linear-gradient(90deg, transparent, rgba(30,144,255,0.4), transparent); }
        .div-dot { width:6px; height:6px; border-radius:50%; background:#ffc800; box-shadow:0 0 8px #ffc800; }

        .section-label {
          text-align: center;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: #1e90ff;
          margin-bottom: 20px;
        }

        /* === INPUTS === */
        .input-row {
          display: flex;
          align-items: stretch;
          gap: 0;
          margin-bottom: 16px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(30,100,255,0.25);
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .input-row:focus-within {
          border-color: rgba(30,144,255,0.7);
          box-shadow: 0 0 0 3px rgba(30,144,255,0.12), 0 0 20px rgba(30,144,255,0.1);
        }

        .input-icon {
          width: 48px;
          background: rgba(30,100,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid rgba(30,100,255,0.2);
          flex-shrink: 0;
        }

        .hex-icon {
          width: 32px; height: 32px;
          background: rgba(30,100,255,0.25);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .field-input {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: none;
          padding: 14px 14px;
          color: white;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.22); }

        .field-label-top {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1e90ff;
          margin-bottom: 6px;
          font-family: 'Orbitron', monospace;
          display: block;
        }

        .eye-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.4);
          padding: 0 14px;
          cursor: pointer;
          font-size: 16px;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #1e90ff; }

        /* Remember + olvidé */
        .extras {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .remember input[type=checkbox] {
          width: 14px; height: 14px;
          accent-color: #1e90ff;
          cursor: pointer;
        }
        .remember span {
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          font-family: 'Orbitron', monospace;
        }
        .forgot {
          font-size: 10px;
          letter-spacing: 1px;
          color: #ffc800;
          text-decoration: none;
          font-family: 'Orbitron', monospace;
          cursor: pointer;
          background: none;
          border: none;
          transition: color 0.2s;
        }
        .forgot:hover { color: white; }

        /* Error */
        .error-box {
          background: rgba(255,50,50,0.1);
          border: 1px solid rgba(255,50,50,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #ff7070;
          margin-bottom: 16px;
        }

        /* Botón principal AMARILLO */
        .btn-main {
          width: 100%;
          padding: 16px;
          background: linear-gradient(90deg, #e6a800, #ffc800, #ffd740);
          border: none;
          border-radius: 10px;
          color: #0a0e1a;
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s;
          box-shadow: 0 4px 24px rgba(255,200,0,0.4), 0 0 40px rgba(255,200,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-main:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,200,0,0.6), 0 0 60px rgba(255,200,0,0.2);
          background: linear-gradient(90deg, #ffc800, #ffd740, #ffe680);
        }
        .btn-main:active:not(:disabled) { transform: translateY(0); }
        .btn-main:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-arrow { font-size: 18px; font-weight: 900; }

        /* Shimmer */
        .shimmer {
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmerAnim 2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes shimmerAnim { 0%{left:-60%} 100%{left:160%} }

        /* Divider OR */
        .or-row {
          display: flex; align-items: center; gap: 10px;
          margin: 16px 0;
        }
        .or-line { flex:1; height:1px; background:rgba(255,255,255,0.08); }
        .or-text { font-size: 12px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }

        /* Botón zona */
        .btn-zona {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid rgba(30,100,255,0.35);
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }
        .btn-zona:hover {
          border-color: rgba(30,144,255,0.7);
          background: rgba(30,100,255,0.08);
          color: white;
        }

        /* Panel zona */
        .zona-panel {
          margin-top: 14px;
          background: rgba(10,20,50,0.95);
          border: 1px solid rgba(30,100,255,0.3);
          border-radius: 10px;
          padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .zona-select {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(30,100,255,0.25);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          margin-bottom: 10px;
          outline: none;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
        }
        .zona-select option { background: #0a1628; }
        .zona-select:focus { border-color: rgba(30,144,255,0.7); }

        /* Footer */
        .footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          text-align: center;
        }
        .footer-text {
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .footer-mark { color: #ffc800; opacity: 0.7; }
        .status-dot {
          width: 6px; height: 6px;
          background: #00e676;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 6px #00e676;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #0a0e1a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        @media(max-width:480px){
          .card{padding:30px 20px 28px;}
          .title-line{font-size:20px;}
        }
      `}</style>

      <div className="root">
        {/* Fondo */}
        <div className="bg" />
        <div className="grid-floor" />
        <div className="grid-ceil" />
        <div className="rays" />

        {/* Estrellas/partículas */}
        {[...Array(40)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random()*100}%`,
            top: `${Math.random()*100}%`,
            width: `${1 + Math.random()*2}px`,
            height: `${1 + Math.random()*2}px`,
            background: Math.random() > 0.85 ? "#ffc800" : "#4fc3f7",
            animationDuration: `${2 + Math.random()*4}s`,
            animationDelay: `${Math.random()*4}s`,
          }}/>
        ))}

        {/* Líneas de velocidad */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="speed-line" style={{
            top: `${10 + i*15}%`,
            animationDuration: `${3 + Math.random()*4}s`,
            animationDelay: `${i * 1.2}s`,
          }}/>
        ))}

        {/* Card */}
        <div className="card-wrap">
          <div className="card-outer">
            <div className="card">
              <div className="corner c-tl"/><div className="corner c-tr"/>
              <div className="corner c-bl"/><div className="corner c-br"/>

              {/* Logo */}
              <div className="logo-area">
                <LogoSM />
                <div className="title-line">SIGE <span>COLOMBIA</span></div>
                <div className="subtitle">Sistema de Gestión Educativa</div>
              </div>

              <div className="divider">
                <div className="div-line"/>
                <div className="div-dot"/>
                <div className="div-line"/>
              </div>

              <div className="section-label">Acceso al Sistema</div>

              {error && <div className="error-box">⚠️ {error}</div>}

              {/* Email */}
              <label className="field-label-top">Correo Electrónico</label>
              <div className="input-row">
                <div className="input-icon">
                  <div className="hex-icon">👤</div>
                </div>
                <input
                  className="field-input"
                  type="email"
                  placeholder="usuario@institucion.edu.co"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
              </div>

              {/* Contraseña */}
              <label className="field-label-top">Contraseña</label>
              <div className="input-row">
                <div className="input-icon">
                  <div className="hex-icon">🔒</div>
                </div>
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Extras */}
              <div className="extras">
                <label className="remember">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span>Recordar sesión</span>
                </label>
                <button className="forgot">¿Olvidaste tu contraseña?</button>
              </div>

              {/* Botón principal */}
              <button className="btn-main" onClick={handleLogin} disabled={loading}>
                <div className="shimmer" />
                {loading
                  ? <><div className="spinner" /> Verificando...</>
                  : <><span>Ingresar al Sistema</span><span className="btn-arrow">›</span></>
                }
              </button>

              {/* Zona e institución */}
              <div className="or-row">
                <div className="or-line"/><span className="or-text">O</span><div className="or-line"/>
              </div>

              <button className="btn-zona" onClick={() => setShowZona(!showZona)}>
                👥 Seleccionar Zona e Institución
              </button>

              {showZona && (
                <div className="zona-panel">
                  <select className="zona-select" value={zona} onChange={e => { setZona(e.target.value); setInstitucion(""); }}>
                    <option value="">— Selecciona zona —</option>
                    {zonas.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                  {zona && (
                    <select className="zona-select" value={institucion} onChange={e => setInstitucion(e.target.value)}>
                      <option value="">— Selecciona institución —</option>
                      {(instituciones[zona] || []).map(inst => <option key={inst} value={inst}>{inst}</option>)}
                    </select>
                  )}
                  {institucion && (
                    <div style={{fontSize:12, color:"#1e90ff", textAlign:"center", marginTop:4, fontFamily:"Orbitron,monospace", letterSpacing:1}}>
                      ✓ {institucion}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="footer">
                <div className="footer-text">
                  <span className="footer-mark">»»</span>
                  <span className="status-dot"/>
                  Sistema Activo — V1.0.0
                  <span className="footer-mark">««</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
