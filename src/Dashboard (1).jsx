import { useState, useEffect } from "react";
import Estudiantes from "./Estudiantes.jsx";

const SUPABASE_URL = "https://smojutxbmngxuuzhbuxa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2p1dHhibW5neHV1emhidXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDA2ODEsImV4cCI6MjA5OTI3NjY4MX0.-A55wzsWR0sHEm3aJoSF3nw821JKddwYAKn4HmZbonM";

const api = async (path, token) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return [];
  return res.json();
};

// ── NAV ITEMS ────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "estudiantes", icon: "◈", label: "Estudiantes" },
  { id: "matriculas", icon: "◉", label: "Matrículas" },
  { id: "notas", icon: "◆", label: "Notas" },
  { id: "boletin", icon: "◎", label: "Boletines" },
  { id: "configuracion", icon: "◇", label: "Configuración" },
];

// ── MINI BAR CHART ───────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = Math.max((value / Math.max(max, 1)) * 100, 3);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s ease" }} />
      </div>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", minWidth: 24, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${color}30`,
      borderRadius: 14,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.3s, transform 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + "80"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = color + "30"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Glow fondo */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6, letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.5 }} />
    </div>
  );
}

// ── PERIODO CARD ─────────────────────────────────────────────────
function PeriodoItem({ p }) {
  const start = new Date(p.fecha_inicio);
  const end = new Date(p.fecha_fin);
  const now = new Date();
  const pct = Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100);
  const fmt = d => d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  return (
    <div style={{
      padding: "12px 14px",
      borderRadius: 10,
      border: p.activo ? "1px solid rgba(30,144,255,0.5)" : "1px solid rgba(255,255,255,0.07)",
      background: p.activo ? "rgba(30,144,255,0.07)" : "rgba(255,255,255,0.02)",
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: p.activo ? "#1e90ff" : "rgba(255,255,255,0.5)", fontWeight: 700 }}>
          Período {p.numero} — {p.año}
        </span>
        {p.activo && (
          <span style={{ fontSize: 10, background: "rgba(30,144,255,0.2)", color: "#1e90ff", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
            ● ACTIVO
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: p.activo ? 8 : 0 }}>
        {fmt(start)} → {fmt(end)}
      </div>
      {p.activo && (
        <>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#1e90ff,#ffc800)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{Math.round(pct)}% transcurrido</div>
        </>
      )}
    </div>
  );
}

// ── ACTIVIDAD ────────────────────────────────────────────────────
function ActividadItem({ color, text, time }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{text}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{time}</div>
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────
function DashboardPage({ token }) {
  const [stats, setStats] = useState({ estudiantes: 0, matriculas: 0, docentes: 0, materias: 0 });
  const [periodos, setPeriodos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [est, mat, doc, mat2, pers, grs] = await Promise.all([
          api("/estudiantes?select=id&activo=eq.true", token),
          api("/matriculas?select=id,estado", token),
          api("/docentes?select=id&activo=eq.true", token),
          api("/materias?select=id", token),
          api("/periodos?select=*&año=eq.2026&order=numero", token),
          api("/grados?select=nombre,nivel&order=nombre", token),
        ]);
        setStats({
          estudiantes: est?.length || 0,
          matriculas: mat?.filter(m => m.estado === "aprobada").length || 0,
          docentes: doc?.length || 0,
          materias: mat2?.length || 0,
        });
        setPeriodos(pers || []);
        setGrados(grs || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [token]);

  const niveles = [
    { label: "Primaria", value: grados.filter(g => g.nivel === "primaria").length, color: "#1e90ff" },
    { label: "Secundaria", value: grados.filter(g => g.nivel === "secundaria").length, color: "#ffc800" },
    { label: "Media", value: grados.filter(g => g.nivel === "media").length, color: "#00e676" },
  ];
  const maxNivel = Math.max(...niveles.map(n => n.value), 1);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron',monospace", fontSize: 13, letterSpacing: 2 }}>
      <div style={{ width: 18, height: 18, border: "2px solid rgba(30,144,255,0.3)", borderTopColor: "#1e90ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      CARGANDO SISTEMA...
    </div>
  );

  return (
    <div>
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="👨‍🎓" label="ESTUDIANTES ACTIVOS" value={stats.estudiantes} color="#1e90ff" sub="↑ Sistema listo" />
        <StatCard icon="📋" label="MATRÍCULAS APROBADAS" value={stats.matriculas} color="#ffc800" sub="↑ 2026" />
        <StatCard icon="👩‍🏫" label="DOCENTES ACTIVOS" value={stats.docentes} color="#00e676" sub="↑ Registrados" />
        <StatCard icon="📚" label="MATERIAS" value={stats.materias} color="#bf5fff" sub="↑ Configuradas" />
      </div>

      {/* Grid principal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Columna izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Niveles */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#1e90ff", letterSpacing: 2, marginBottom: 20 }}>
              ◈ DISTRIBUCIÓN POR NIVEL
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {niveles.map((n, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>{n.label.toUpperCase()}</span>
                    <span style={{ fontSize: 12, color: n.color, fontWeight: 700 }}>{n.value} grados</span>
                  </div>
                  <MiniBar value={n.value} max={maxNivel} color={n.color} />
                </div>
              ))}
            </div>

            {/* Barras visuales tipo gráfico */}
            <div style={{ marginTop: 24, display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "0 8px" }}>
              {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m, i) => {
                const h = [40,55,70,60,80,65,90,75,85,50,60,45][i];
                const isActive = i === 7;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%",
                      height: `${h}%`,
                      borderRadius: "4px 4px 0 0",
                      background: isActive
                        ? "linear-gradient(180deg,#ffc800,#e6a800)"
                        : "linear-gradient(180deg,rgba(30,144,255,0.6),rgba(30,144,255,0.2))",
                      boxShadow: isActive ? "0 0 12px rgba(255,200,0,0.4)" : "none",
                      transition: "height 1s ease",
                    }} />
                    <span style={{ fontSize: 9, color: isActive ? "#ffc800" : "rgba(255,255,255,0.25)", letterSpacing: 0.5 }}>{m}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8, letterSpacing: 1 }}>
              ACTIVIDAD MENSUAL — AÑO 2026
            </div>
          </div>

          {/* Actividad reciente */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#1e90ff", letterSpacing: 2, marginBottom: 16 }}>
              ◉ ACTIVIDAD RECIENTE
            </div>
            <ActividadItem color="#00e676" text={<><strong style={{ color: "rgba(255,255,255,0.85)" }}>Base de datos</strong> configurada exitosamente en Supabase</>} time="Hoy" />
            <ActividadItem color="#1e90ff" text={<><strong style={{ color: "rgba(255,255,255,0.85)" }}>11 grados</strong> y grupos A/B/C creados para 2026</>} time="Hoy" />
            <ActividadItem color="#bf5fff" text={<><strong style={{ color: "rgba(255,255,255,0.85)" }}>11 materias</strong> base registradas en el sistema</>} time="Hoy" />
            <ActividadItem color="#ffc800" text={<><strong style={{ color: "rgba(255,255,255,0.85)" }}>4 períodos</strong> académicos 2026 configurados</>} time="Hoy" />
            <ActividadItem color="#00e676" text={<><strong style={{ color: "rgba(255,255,255,0.85)" }}>SIGE Colombia</strong> desplegado exitosamente en Vercel</>} time="Hoy" />
          </div>
        </div>

        {/* Columna derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Períodos */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#1e90ff", letterSpacing: 2, marginBottom: 16 }}>
              ◆ PERÍODOS 2026
            </div>
            {periodos.length > 0
              ? periodos.map(p => <PeriodoItem key={p.id} p={p} />)
              : <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Sin períodos configurados</div>
            }
          </div>

          {/* Accesos rápidos */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#1e90ff", letterSpacing: 2, marginBottom: 16 }}>
              ◎ ACCESOS RÁPIDOS
            </div>
            {[
              { icon: "➕", label: "Nueva matrícula", color: "#1e90ff" },
              { icon: "👤", label: "Registrar estudiante", color: "#00e676" },
              { icon: "📝", label: "Ingresar notas", color: "#bf5fff" },
              { icon: "📄", label: "Generar boletín", color: "#ffc800" },
            ].map((a, i) => (
              <button key={i} style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 9,
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 8,
                transition: "all 0.2s",
                textAlign: "left",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color + "60"; e.currentTarget.style.background = a.color + "10"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <span style={{ flex: 1 }}>{a.label}</span>
                <span style={{ color: a.color, fontSize: 16 }}>›</span>
              </button>
            ))}
          </div>

          {/* Estado del sistema */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700, color: "#00e676", letterSpacing: 2, marginBottom: 12 }}>
              ◇ ESTADO DEL SISTEMA
            </div>
            {[
              { label: "Supabase DB", status: "Conectado", ok: true },
              { label: "Autenticación", status: "Activa", ok: true },
              { label: "Storage", status: "Disponible", ok: true },
              { label: "Vercel Deploy", status: "En línea", ok: true },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
                <span style={{ fontSize: 11, color: s.ok ? "#00e676" : "#ff5252", fontWeight: 600 }}>
                  {s.ok ? "● " : "● "}{s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMING SOON ───────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "rgba(255,255,255,0.2)", fontFamily: "'Orbitron',monospace", fontSize: 13, letterSpacing: 2 }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>◈</div>
      <div>{label.toUpperCase()}</div>
      <div style={{ fontSize: 10, marginTop: 8, color: "rgba(255,255,255,0.15)" }}>MÓDULO EN CONSTRUCCIÓN</div>
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────
export default function Dashboard({ session, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const rolLabel = { admin: "Administrador", docente: "Docente", estudiante: "Estudiante" }[session?.rol] || "Usuario";
  const initials = (session?.email || "U").slice(0, 2).toUpperCase();
  const now = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage token={session?.token} />;
      case "estudiantes": return <Estudiantes token={session?.token} />;
      default: return <ComingSoon label={NAV.find(n => n.id === page)?.label || page} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #020d1f; font-family: 'Inter', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .dash-root {
          min-height: 100vh;
          background: #020d1f;
          display: flex;
          position: relative;
        }

        /* Fondo */
        .dash-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 0% 0%, rgba(0,50,160,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 100% 100%, rgba(0,30,100,0.2) 0%, transparent 60%),
            #020d1f;
        }
        .dash-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(30,100,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,100,255,0.04) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        /* SIDEBAR */
        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 220px;
          background: rgba(4,14,36,0.97);
          border-right: 1px solid rgba(30,100,255,0.15);
          display: flex; flex-direction: column;
          z-index: 200;
          backdrop-filter: blur(20px);
          transition: transform 0.3s;
        }

        .sidebar-logo {
          padding: 24px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .logo-row {
          display: flex; align-items: center; gap: 10px;
        }

        .logo-hex-sm {
          width: 36px; height: 36px;
          background: linear-gradient(135deg,#0050c8,#1e90ff);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 12px rgba(30,144,255,0.5);
        }

        .logo-text { font-family: 'Orbitron',monospace; font-size: 15px; font-weight: 900; color: white; letter-spacing: 1px; }
        .logo-text span { color: #ffc800; }
        .logo-sub { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 1.5px; margin-top: 3px; }

        .sidebar-nav { flex: 1; padding: 16px 10px; overflow-y: auto; }

        .nav-btn {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-size: 13px;
          font-family: 'Inter',sans-serif;
          cursor: pointer;
          margin-bottom: 3px;
          transition: all 0.15s;
          text-align: left;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .nav-btn.active {
          background: linear-gradient(90deg,rgba(30,144,255,0.2),rgba(30,144,255,0.05));
          border: 1px solid rgba(30,144,255,0.3);
          color: white;
        }
        .nav-icon { font-size: 15px; width: 20px; text-align: center; color: #1e90ff; }

        .sidebar-footer {
          padding: 14px 10px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
        }

        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg,#0050c8,#1e90ff);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: white;
          flex-shrink: 0;
        }

        .user-name { font-size: 12px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 10px; color: rgba(255,255,255,0.3); }

        .logout-btn {
          background: none; border: none; color: rgba(255,255,255,0.25);
          cursor: pointer; font-size: 14px; padding: 4px; transition: color 0.2s;
          margin-left: auto; flex-shrink: 0;
        }
        .logout-btn:hover { color: #ff5252; }

        /* MAIN */
        .main { margin-left: 220px; flex: 1; position: relative; z-index: 1; display: flex; flex-direction: column; }

        /* TOPBAR */
        .topbar {
          background: rgba(4,14,36,0.9);
          border-bottom: 1px solid rgba(30,100,255,0.12);
          padding: 16px 28px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: blur(20px);
        }

        .page-title { font-family: 'Orbitron',monospace; font-size: 18px; font-weight: 900; color: white; letter-spacing: 1px; }
        .page-title span { color: #ffc800; }
        .page-date { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 3px; letter-spacing: 0.5px; }

        .topbar-right { display: flex; align-items: center; gap: 12px; }

        .role-badge {
          padding: 5px 12px;
          background: rgba(30,144,255,0.1);
          border: 1px solid rgba(30,144,255,0.3);
          border-radius: 99px;
          font-size: 11px;
          font-family: 'Orbitron',monospace;
          color: #1e90ff;
          letter-spacing: 1px;
        }

        .status-indicator {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(255,255,255,0.25);
        }
        .status-dot-top {
          width: 7px; height: 7px; border-radius: 50%;
          background: #00e676; box-shadow: 0 0 6px #00e676;
          animation: pulse 2s ease-in-out infinite;
        }

        .mobile-btn {
          display: none; background: none; border: none;
          color: rgba(255,255,255,0.6); font-size: 20px; cursor: pointer;
        }

        /* PAGE CONTENT */
        .page-content { padding: 24px 28px; flex: 1; }

        /* OVERLAY mobile */
        .overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); z-index: 199;
        }

        @media(max-width:900px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main { margin-left: 0; }
          .mobile-btn { display: block; }
          .overlay.open { display: block; }
          .page-content { padding: 16px; }
          .topbar { padding: 14px 16px; }
        }

        @media(max-width:700px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .dash-grid-main { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="dash-root">
        <div className="dash-bg" />
        <div className="dash-grid" />

        {/* Overlay mobile */}
        <div className={`overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-row">
              <div className="logo-hex-sm">🏫</div>
              <div>
                <div className="logo-text">SIGE <span>CO</span></div>
                <div className="logo-sub">GESTIÓN EDUCATIVA</div>
              </div>
            </div>
          </div>

          <div className="sidebar-nav">
            {NAV.map(item => (
              <button
                key={item.id}
                className={`nav-btn ${page === item.id ? "active" : ""}`}
                onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="avatar">{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name">{session?.email?.split("@")[0] || "Usuario"}</div>
                <div className="user-role">{rolLabel}</div>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Cerrar sesión">⏻</button>
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="main">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="mobile-btn" onClick={() => setSidebarOpen(true)}>☰</button>
              <div>
                <div className="page-title">
                  {NAV.find(n => n.id === page)?.label?.toUpperCase() || "DASHBOARD"}
                </div>
                <div className="page-date">{now}</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="status-indicator">
                <div className="status-dot-top" />
                Sistema activo
              </div>
              <div className="role-badge">{rolLabel.toUpperCase()}</div>
            </div>
          </div>

          <div className="page-content">
            {renderPage()}
          </div>
        </main>
      </div>
    </>
  );
}
